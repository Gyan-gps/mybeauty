import { MongoClient } from 'mongodb';
import { defaultServices, defaultStylist } from './defaults';
import type { Appointment, Customer, Service, Stylist, Schedule } from './types';
let clientPromise: Promise<MongoClient> | undefined; let indexes: Promise<unknown> | undefined;
export async function database() {

  const uri = process.env.NEXT_MONGODB_URL || process.env.MONGODB_URI;

  if (!uri?.startsWith('mongodb')) throw new Error('DATABASE_UNAVAILABLE');

  if (!clientPromise) clientPromise = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10, maxIdleTimeMS: 60000 }).connect().catch(e => {
    clientPromise = undefined;
    throw e;
  });

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'mybeauty');

  if (!indexes) indexes = Promise.all([
    db.collection('users').createIndex({ mobile: 1 }, { unique: true }), db.collection('users').createIndex({ id: 1 }, { unique: true }),
    db.collection('schedules').createIndex({ stylistId: 1, date: 1 }, { unique: true }), db.collection('appointments').createIndex({ id: 1 }, { unique: true }), db.collection('appointments').createIndex({ userId: 1, date: -1 }),
    db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }), db.collection('sessions').createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection('otps').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }), db.collection('otps').createIndex({ mobile: 1 }, { unique: true }),
    db.collection('limits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }), db.collection('limits').createIndex({ key: 1 }, { unique: true }),
    db.collection('services').createIndex({ id: 1 }, { unique: true }), db.collection('stylists').createIndex({ id: 1 }, { unique: true })
  ]).catch(e => {
    indexes = undefined;
    throw e;
  });

  await indexes;

  return {
    db,
    client,
    users: db.collection<Customer>('users'),
    appointments: db.collection<Appointment>('appointments'),
    services: db.collection<Service>('services'),
    stylists: db.collection<Stylist>('stylists'),
    schedules: db.collection<Schedule>('schedules')
  };
}
export async function catalog() {
  try {
    const d = await database();
    const [services, stylists] = await Promise.all([d.services.find({ active: true }, { projection: { _id: 0 } }).toArray(), d.stylists.find({ active: true }, { projection: { _id: 0 } }).toArray()]);
    return { services, stylists, connected: true };
  } catch {
    return { services: defaultServices, stylists: [defaultStylist], connected: false };
  }
}
