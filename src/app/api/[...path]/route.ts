import { NextRequest, NextResponse } from 'next/server';
import { randomInt, randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { database, catalog } from '@/lib/db';
import { ApiError, digest, hash, login, logout, rateLimit, requireSession, same, session } from '@/lib/auth';
import { availableSlots, minutes, totals, validDate, slotInstant } from '@/lib/booking';
import { salon, SALON_NAME } from '@/lib/config';
import type { Appointment, Customer, Service, Stylist } from '@/lib/types';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const mobile = z.string().trim().transform(v => v.replace(/[\s()-]/g, '')).pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, 'Include a country code, e.g. +91.'));
const customerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  mobile,
  email: z.email().trim().toLowerCase().max(254)
});
const bookingSchema = z.object({
  serviceIds: z.array(z.string()).min(1).max(12),
  stylistId: z.string().min(1),
  date: z.string(),
  start: z.number().int().min(0).max(1439),
  customer: customerSchema
});
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const serviceSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().trim().min(2).max(80),
  category: z.enum(['Hair', 'Beard', 'Facial', 'Grooming']),
  description: z.string().max(300),
  price: z.number().min(0).max(100000),
  duration: z.number().int().min(15).max(480).multipleOf(15),
  active: z.boolean()
});
const stylistSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().trim().min(2).max(80),
  title: z.string().max(100),
  active: z.boolean(),
  serviceIds: z.array(z.string()).max(100),
  weekdays: z.array(z.number().int().min(0).max(6)).max(7),
  start: time,
  end: time,
  breaks: z.array(z.object({ start: time, end: time })).max(10),
  daysOff: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(366)
}).refine(s => minutes(s.start) < minutes(s.end) && s.breaks.every(b => minutes(b.start) < minutes(b.end) && minutes(b.start) >= minutes(s.start) && minutes(b.end) <= minutes(s.end)), 'Check working hours and breaks.');
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
async function body(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > 20000) throw new ApiError('Request is too large.', 413);
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError('Invalid request.');
  }
}
async function reserve(stylistId: string, date: string, start: number, end: number, id: string, kind: 'appointment' | 'block' = 'appointment') {

  const d = await database();
  try {
    await d.schedules.updateOne({ stylistId, date }, { $setOnInsert: { stylistId, date, reservations: [] } }, { upsert: true });
  } catch (e) {
    if (!(e && typeof e === 'object' && 'code' in e && e.code === 11000)) throw e;
  }

  const result = await d.schedules.updateOne({
    stylistId,
    date,
    reservations: { $not: { $elemMatch: { start: { $lt: end }, end: { $gt: start } } } }
  }, { $push: { reservations: { id, start, end, kind } } });

  if (!result.modifiedCount) throw new ApiError('That time was just taken. Please choose another slot.', 409);
}
async function release(stylistId: string, date: string, id: string) {
  const d = await database();
  await d.schedules.updateOne({ stylistId, date }, { $pull: { reservations: { id } } });
}
async function route(req: NextRequest, { params }: {
  params: Promise<{
    path: string[];
  }>;
}) {

  try {

    const path = (await params).path.join('/');
    const method = req.method;

    if (method !== 'GET') {
      const origin = req.headers.get('origin');
      if (origin && origin !== new URL(req.url).origin) throw new ApiError('Request origin is not allowed.', 403);
    }

    if (method === 'GET' && path === 'catalog') return json(await catalog());

    if (method === 'GET' && path === 'slots') {

      const d = await database();
      const date = req.nextUrl.searchParams.get('date') || '';
      const ids = (req.nextUrl.searchParams.get('services') || '').split(',');
      const stylistId = req.nextUrl.searchParams.get('stylist') || '';

      if (!validDate(date) || new Set(ids).size !== ids.length) throw new ApiError('Choose a valid date and services.');

      const [services, stylist, schedule] = await Promise.all([d.services.find({ id: { $in: ids }, active: true }).toArray(), d.stylists.findOne({ id: stylistId, active: true }), d.schedules.findOne({ stylistId, date })]);

      if (!stylist || !services.length || services.length !== ids.length || !ids.every(id => stylist.serviceIds.includes(id))) throw new ApiError('This stylist does not offer all selected services.');

      return json({ slots: availableSlots(stylist, date, totals(services).duration, schedule?.reservations || []) });

    }

    if (method === 'GET' && path === 'me') {

      const s = await session();
      if (!s) return json({ user: null });
      const d = await database();
      if (s.role === 'admin') return json({ user: { role: 'admin', name: 'Salon admin' } });

      const user = await d.users.findOne({ id: s.userId }, { projection: { _id: 0 } });
      const appointments = await d.appointments.find({ userId: s.userId }, { projection: { _id: 0 } }).sort({ date: -1, start: -1 }).toArray();
      return json({ user, appointments });

    }

    if (method === 'POST' && path === 'auth/logout') {
      await logout();
      return json({ ok: true });
    }

    if (method === 'POST' && path === 'auth/otp') {

      const value = z.object({ mobile }).parse(await body(req));
      await rateLimit(`otp:${value.mobile}`, 3, 600);
      const d = await database();
      const user = await d.users.findOne({ mobile: value.mobile });

      if (!user) return json({ message: 'If an account exists, a code has been sent to its saved email.' });

      if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) throw new ApiError('Email login is not available yet. Please contact the salon.', 503);

      const code = String(randomInt(100000, 1000000));
      await d.db.collection('otps').updateOne({ mobile: value.mobile }, {
        $set: {
          codeHash: digest(`${value.mobile}:${code}`),
          attempts: 0,
          expiresAt: new Date(Date.now() + 600000)
        }
      }, { upsert: true });

      try {
        await nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_PORT === '465',
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined
        }).sendMail({
          from: process.env.SMTP_FROM,
          to: user.email,
          subject: `Your ${SALON_NAME} sign-in code`,
          text: `Your sign-in code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.`
        });
      } catch {
        await d.db.collection('otps').deleteOne({ mobile: value.mobile });
        throw new ApiError('We could not send the email. Please try again later.', 503);
      }

      return json({ message: 'If an account exists, a code has been sent to its saved email.' });

    }

    if (method === 'POST' && path === 'auth/verify') {

      const v = z.object({ mobile, code: z.string().regex(/^\d{6}$/) }).parse(await body(req));
      await rateLimit(`verify:${v.mobile}`, 10, 600);
      const d = await database();
      const otp = await d.db.collection('otps').findOneAndUpdate({ mobile: v.mobile, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } }, { $inc: { attempts: 1 } }, { returnDocument: 'before' });

      if (!otp || !same(otp.codeHash, digest(`${v.mobile}:${v.code}`))) throw new ApiError('The code is invalid or expired.');

      const consumed = await d.db.collection('otps').deleteOne({ _id: otp._id, codeHash: otp.codeHash });
      if (!consumed.deletedCount) throw new ApiError('This code has already been used.');

      const user = await d.users.findOneAndUpdate({ mobile: v.mobile }, { $set: { emailVerified: true } }, { returnDocument: 'after' });
      if (!user) throw new ApiError('Account not found.');
      await login(user.id);
      return json({ ok: true });

    }

    if (method === 'POST' && path === 'auth/admin') {

      const v = z.object({ password: z.string().min(1).max(200) }).parse(await body(req));
      await rateLimit('admin-login', 8, 600);

      if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 5) throw new ApiError('Admin login is not configured.', 503);

      if (!same(hash(v.password), hash(process.env.ADMIN_PASSWORD))) throw new ApiError('Incorrect password.', 401);
      await login('admin', 'admin');
      return json({ ok: true });

    }

    if (method === 'POST' && path === 'appointments') {

      const v = bookingSchema.parse(await body(req));
      await rateLimit(`booking:${v.customer.mobile}`, 8, 3600);
      const d = await database();
      let user: Customer | null = await d.users.findOne({ mobile: v.customer.mobile });
      const s = await session();

      if (user && (!s || s.userId !== user.id || s.role !== 'customer')) return json({
        error: 'Please verify your email to book with this mobile number.',
        requiresLogin: true
      }, 401);

      if (new Set(v.serviceIds).size !== v.serviceIds.length) throw new ApiError('Choose each service only once.');

      const [services, stylist, schedule] = await Promise.all([d.services.find({ id: { $in: v.serviceIds }, active: true }, { projection: { _id: 0 } }).toArray(), d.stylists.findOne({ id: v.stylistId, active: true }), d.schedules.findOne({ stylistId: v.stylistId, date: v.date })]);

      if (!stylist || services.length !== v.serviceIds.length || !v.serviceIds.every(id => stylist.serviceIds.includes(id))) throw new ApiError('Selected services are unavailable for this stylist.');

      const { total, duration } = totals(services);
      if (!availableSlots(stylist, v.date, duration, schedule?.reservations || []).includes(v.start)) throw new ApiError('This time is unavailable. Choose another slot.', 409);

      const id = randomUUID();
      await reserve(stylist.id, v.date, v.start, v.start + duration, id);
      let createdUser = false;
      let saved = false;

      try {

        if (!user) {
          user = { id: randomUUID(), ...v.customer, emailVerified: false, createdAt: new Date() };
          try {
            await d.users.insertOne(user);
            createdUser = true;
          } catch (e) {
            if (e && typeof e === 'object' && 'code' in e && e.code === 11000) throw new ApiError('This number now has an account. Please log in.', 409);
            throw e;
          }
        }

        const appointment: Appointment = {
          id,
          userId: user.id,
          stylistId: stylist.id,
          stylistName: stylist.name,
          date: v.date,
          start: v.start,
          end: v.start + duration,
          services,
          total,
          duration,
          status: 'confirmed',
          paymentStatus: 'unpaid',
          customerName: user.name,
          createdAt: new Date()
        };
        await d.appointments.insertOne(appointment);
        saved = true;
        await login(user.id);
        return json({ appointment }, 201);

      } catch (e) {
        if (!saved) {
          await release(stylist.id, v.date, id);
          if (createdUser && user) await d.users.deleteOne({ id: user.id });
        }
        throw e;
      }

    }

    if (method === 'PATCH' && path === 'me') {

      const s = await requireSession();
      const v = z.object({ name: z.string().trim().min(2).max(80) }).parse(await body(req));
      const d = await database();
      await d.users.updateOne({ id: s.userId }, { $set: v });
      return json({ ok: true });

    }

    if (method === 'PATCH' && path === 'appointments') {

      const s = await requireSession();
      const v = z.object({
        id: z.string(),
        status: z.enum(['cancelled', 'completed', 'no-show']),
        paymentStatus: z.enum(['paid', 'unpaid']).optional()
      }).parse(await body(req));
      const d = await database();
      const a = await d.appointments.findOne({ id: v.id });
      if (!a || s.role !== 'admin' && a.userId !== s.userId) throw new ApiError('Appointment not found.', 404);

      if (a.status !== 'confirmed') throw new ApiError('This appointment has already been updated.', 409);

      if (s.role !== 'admin' && (v.status !== 'cancelled' || +slotInstant(a.date, a.start) <= Date.now())) throw new ApiError('Contact the salon to update this appointment.');

      const result = await d.appointments.updateOne({ id: v.id, status: 'confirmed' }, {
        $set: {
          status: v.status,
          ...(s.role === 'admin' && v.paymentStatus ? { paymentStatus: v.paymentStatus } : {})
        }
      });
      if (!result.modifiedCount) throw new ApiError('Appointment changed. Refresh and try again.', 409);
      if (v.status === 'cancelled') await release(a.stylistId, a.date, a.id);
      return json({ ok: true });

    }

    if (path.startsWith('admin/')) {

      await requireSession(true);
      const d = await database();

      if (method === 'GET' && path === 'admin/data') {
        const [appointments, users, services, stylists, schedules] = await Promise.all([d.appointments.find({}, { projection: { _id: 0 } }).sort({ date: -1, start: 1 }).limit(1000).toArray(), d.users.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(1000).toArray(), d.services.find({}, { projection: { _id: 0 } }).toArray(), d.stylists.find({}, { projection: { _id: 0 } }).toArray(), d.schedules.find({ 'reservations.kind': 'block' }, { projection: { _id: 0 } }).toArray()]);
        return json({ appointments, users, services, stylists, schedules });
      }

      if (method === 'POST' && path === 'admin/services') {
        const v = serviceSchema.parse(await body(req));
        await d.services.updateOne({ id: v.id }, { $set: v }, { upsert: true });
        return json({ ok: true });
      }

      if (method === 'POST' && path === 'admin/stylists') {
        const v = stylistSchema.parse(await body(req));
        const count = await d.services.countDocuments({ id: { $in: v.serviceIds } });
        if (count !== v.serviceIds.length) throw new ApiError('Choose valid services.');
        await d.stylists.updateOne({ id: v.id }, { $set: v }, { upsert: true });
        return json({ ok: true });
      }

      if (method === 'POST' && path === 'admin/blocks') {
        const v = z.object({ stylistId: z.string(), date: z.string(), start: time, end: time }).parse(await body(req));
        if (!validDate(v.date) || minutes(v.start) >= minutes(v.end) || !await d.stylists.findOne({ id: v.stylistId })) throw new ApiError('Check the date, stylist and times.');
        await reserve(v.stylistId, v.date, minutes(v.start), minutes(v.end), randomUUID(), 'block');
        return json({ ok: true });
      }

      if (method === 'DELETE' && path === 'admin/blocks') {
        const v = z.object({ stylistId: z.string(), date: z.string(), id: z.string() }).parse(await body(req));
        await d.schedules.updateOne({ stylistId: v.stylistId, date: v.date }, { $pull: { reservations: { id: v.id, kind: 'block' } } });
        return json({ ok: true });
      }

    }

    throw new ApiError('Not found.', 404);

  } catch (e) {
    if (e instanceof z.ZodError) return json({ error: e.issues[0]?.message || 'Check your details.' }, 400);
    if (e instanceof ApiError) return json({ error: e.message }, e.status);
    console.error('API request failed:', e instanceof Error ? e.name : 'UnknownError');
    return json({ error: 'The service is temporarily unavailable. Please try again shortly.' }, 503);
  }
}
export { route as GET, route as POST, route as PATCH, route as DELETE };
