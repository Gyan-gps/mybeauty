import { cookies } from 'next/headers';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { database } from './db';
export const hash = (v: string) => createHash('sha256').update(v).digest('hex');
export function digest(v: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('Authentication is not configured.');
  return createHmac('sha256', secret).update(v).digest('hex');
}
export function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export async function session() {
  const token = (await cookies()).get('mybeauty_session')?.value;
  if (!token) return null;
  const { db } = await database();
  return db.collection<{
    tokenHash: string;
    userId: string;
    role: 'customer' | 'admin';
    expiresAt: Date;
  }>('sessions').findOne({ tokenHash: hash(token), expiresAt: { $gt: new Date() } });
}
export async function login(userId: string, role: 'customer' | 'admin' = 'customer') {
  const token = randomBytes(32).toString('hex');
  const days = Math.max(1, Math.min(30, Number(process.env.SESSION_TTL_DAYS) || 7));
  const expiresAt = new Date(Date.now() + days * 86400000);
  const { db } = await database();
  await db.collection('sessions').insertOne({ tokenHash: hash(token), userId, role, expiresAt });
  (await cookies()).set('mybeauty_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt
  });
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get('mybeauty_session')?.value;
  if (token) {
    const { db } = await database();
    await db.collection('sessions').deleteOne({ tokenHash: hash(token) });
  }
  jar.delete('mybeauty_session');
}
export class ApiError extends Error {  
constructor(message: string, public status = 400) {
    super(message);
  }
}
export async function requireSession(admin = false) {
  const s = await session();
  if (!s || (admin && s.role !== 'admin')) throw new ApiError(admin ? 'Admin access required.' : 'Please log in to continue.', 401);
  return s;
}
export async function rateLimit(key: string, max = 10, seconds = 600) {
  const { db } = await database();
  const window = Math.floor(Date.now() / (seconds * 1000));
  const id = hash(`${key}:${window}`);
  try {
    const row = await db.collection('limits').findOneAndUpdate({ key: id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 1) * seconds * 1000) } }, { upsert: true, returnDocument: 'after' });
    if (row && row.count > max) throw new ApiError('Too many attempts. Please try again later.', 429);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError('Please try again shortly.', 429);
  }
}
