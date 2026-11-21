import { salon } from './config';
import type { Reservation, Service, Stylist } from './types';
export const minutes = (time: string) => {

  const [h, m] = time.split(':').map(Number);

  return h * 60 + m;

};
export const clock = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
export const slotInstant = (date: string, start: number) => new Date(`${date}T${clock(start)}:00${salon.offset}`);
export const timeLabel = (value: number) => new Date(`2000-01-01T${clock(value)}:00`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
export const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: salon.currency, maximumFractionDigits: 0 }).format(value);
export const localDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: salon.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
export function validDate(date: string, now = new Date()) {

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const d = new Date(`${date}T00:00:00${salon.offset}`);

  const today = new Date(`${localDate(now)}T00:00:00${salon.offset}`);

  return !isNaN(+d) && localDate(d) === date && +d >= +today && +d <= +today + salon.bookingDays * 86400000;

}
export function availableSlots(stylist: Stylist, date: string, duration: number, reservations: Reservation[], now = new Date()) {

  if (!validDate(date, now) || !stylist.active || stylist.daysOff.includes(date) || !stylist.weekdays.includes(new Date(`${date}T12:00:00${salon.offset}`).getUTCDay())) return [];

  const blocked = [...reservations, ...stylist.breaks.map(b => ({ start: minutes(b.start), end: minutes(b.end) }))];

  const slots: number[] = [];

  for (let start = minutes(stylist.start); start + duration <= minutes(stylist.end); start += 15) {
    const end = start + duration;

    const instant = +slotInstant(date, start);
    if (instant >= +now + salon.noticeMinutes * 60000 && !blocked.some(b => start < b.end && end > b.start)) slots.push(start);
  }

  return slots;
}
export function totals(services: Service[]) {
  return {
    duration: services.reduce((n, s) => n + s.duration, 0),
    total: services.reduce((n, s) => n + s.price, 0)
  };
}
