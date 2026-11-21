import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availableSlots, validDate, totals, minutes, localDate } from '../src/lib/booking';
import { defaultStylist, defaultServices } from '../src/lib/defaults';
const now = new Date('2026-11-19T02:00:00Z');
const stylist = { ...defaultStylist };
test('multiple categories contribute their full price and consecutive duration', () => {
  assert.deepEqual(totals([defaultServices[0], defaultServices[3]]), { total: 700, duration: 75 });
});
test('visits fit entirely inside opening hours', () => {
  const slots = availableSlots(stylist, '2026-11-20', 75, [], now);
  assert.equal(slots[0], 600);
  assert.equal(slots.at(-1), 1125);
  assert.ok(!slots.includes(1140));
});
test('a visit cannot span the lunch break', () => {
  const slots = availableSlots(stylist, '2026-11-20', 45, [], now);
  assert.ok(slots.includes(795));
  assert.ok(!slots.includes(810));
  assert.ok(!slots.includes(840));
  assert.ok(slots.includes(870));
});
test('an existing appointment excludes every overlapping start', () => {
  const slots = availableSlots(stylist, '2026-11-20', 45, [{ id: 'a', start: 660, end: 705, kind: 'appointment' }], now);
  assert.ok(slots.includes(615));
  assert.ok(!slots.includes(630));
  assert.ok(!slots.includes(690));
  assert.ok(slots.includes(705));
});
test('admin blocks behave like occupied appointments', () => {
  const slots = availableSlots(stylist, '2026-11-20', 30, [{ id: 'walk-in', start: 600, end: 660, kind: 'block' }], now);
  assert.equal(slots[0], 660);
});
test('a day off has no bookable slots', () => {
  assert.deepEqual(availableSlots({ ...stylist, daysOff: ['2026-11-20'] }, '2026-11-20', 30, [], now), []);
});
test('a non-working weekday has no bookable slots', () => {
  assert.deepEqual(availableSlots({ ...stylist, weekdays: [1] }, '2026-11-20', 30, [], now), []);
});
test('inactive stylists cannot be booked', () => {
  assert.deepEqual(availableSlots({ ...stylist, active: false }, '2026-11-20', 30, [], now), []);
});
test('same-day appointments respect the minimum notice period', () => {
  const slots = availableSlots(stylist, '2026-11-19', 30, [], new Date('2026-11-19T05:10:00Z'));
  assert.equal(slots[0], 675);
});
test('availability for one stylist does not occupy another stylist', () => {
  const busy = availableSlots(stylist, '2026-11-20', 30, [{ id: 'a', start: 600, end: 660, kind: 'appointment' }], now);
  const free = availableSlots({ ...stylist, id: 'second' }, '2026-11-20', 30, [], now);
  assert.ok(!busy.includes(600));
  assert.ok(free.includes(600));
});
test('reject past dates, impossible calendar dates and dates past the booking horizon', () => {
  assert.equal(validDate('2026-11-18', now), false);
  assert.equal(validDate('2026-11-31', now), false);
  assert.equal(validDate('2026-12-20', now), false);
  assert.equal(validDate('2026-12-19', now), true);
  assert.equal(validDate('nonsense', now), false);
});
test('salon date is independent of the server timezone', () => {
  assert.equal(localDate(new Date('2026-11-19T20:00:00Z')), '2026-11-20');
});
test('a treatment longer than the working day cannot be booked', () => {
  assert.deepEqual(availableSlots(stylist, '2026-11-20', 700, [], now), []);
});
test('adjacent appointments can share an end/start boundary', () => {
  const slots = availableSlots(stylist, '2026-11-20', 30, [{ id: 'a', start: 630, end: 660, kind: 'appointment' }], now);
  assert.ok(slots.includes(600));
  assert.ok(slots.includes(660));
});
test('time conversion keeps minutes precise', () => {
  assert.equal(minutes('10:45'), 645);
  assert.equal(minutes('00:15'), 15);
});
