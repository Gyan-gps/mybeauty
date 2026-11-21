'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, LoaderCircle, Scissors, ShieldCheck, CalendarDays } from 'lucide-react';
import { api } from '@/lib/client';
import { localDate, money, timeLabel, totals } from '@/lib/booking';
import { categories, salon } from '@/lib/config';
import type { Appointment, Catalog, Customer } from '@/lib/types';
import { Login } from './Login';
export function Booking({ catalog, initialIds }: {
  catalog: Catalog;
  initialIds: string[];
}) {

  const [step, setStep] = useState(0);
  const [ids, setIds] = useState(initialIds.filter(id => catalog.services.some(s => s.id === id)));
  const [category, setCategory] = useState('All');
  const [stylistId, setStylist] = useState(catalog.stylists[0]?.id || '');
  const [date, setDate] = useState(localDate());
  const [start, setStart] = useState<number | null>(null);
  const [slots, setSlots] = useState<number[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [slotError, setSlotError] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);
  const [user, setUser] = useState<Customer | null>(null);
  const [customer, setCustomer] = useState({ name: '', mobile: '', email: '' });
  const [done, setDone] = useState<Appointment | null>(null);

  const selected = catalog.services.filter(s => ids.includes(s.id));
  const sum = totals(selected);
  const stylists = catalog.stylists.filter(s => ids.every(id => s.serviceIds.includes(id)));
  const stylist = stylists.find(s => s.id === stylistId);
  const serviceKey = ids.join(',');

  async function loadUser() {
    const data = await api('me');
    if (data.user?.mobile) {
      setUser(data.user);
      setCustomer({ name: data.user.name, mobile: data.user.mobile, email: data.user.email });
    }
    setNeedsLogin(false);
  }

  useEffect(() => {
    loadUser().catch(() => { });
  }, []);

  useEffect(() => {
    if (!stylists.some(s => s.id === stylistId)) setStylist(stylists[0]?.id || '');
  }, [serviceKey, stylistId, stylists]);

  // Reset the chosen time only when what it depends on changes — not when moving between steps.
  useEffect(() => {
    setStart(null);
  }, [date, stylistId, serviceKey]);

  useEffect(() => {
    if (step !== 1 || !stylistId || !ids.length) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSlotError('');
    api<{
      slots: number[];
    }>(`slots?date=${date}&stylist=${stylistId}&services=${encodeURIComponent(serviceKey)}`).then(d => {
      if (!cancelled) setSlots(d.slots);
    }).catch(e => {
      if (!cancelled) {
        setSlotError(e.message);
        setSlots([]);
      }
    }).finally(() => {
      if (!cancelled) setLoadingSlots(false);
    });
    return () => {
      cancelled = true;
    };
  }, [step, date, stylistId, serviceKey]);

  async function book(e: React.FormEvent) {
    e.preventDefault();
    if (start === null) return;
    setError('');
    setBusy(true);
    try {
      const data = await api<{
        appointment: Appointment;
      }>('appointments', {
        method: 'POST',
        body: JSON.stringify({ serviceIds: ids, stylistId, date, start, customer })
      });
      setDone(data.appointment);
    } catch (e) {
      const err = e as Error & {
        requiresLogin?: boolean;
      };
      setError(err.message);
      if (err.requiresLogin) setNeedsLogin(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <div className="booking-success">
    <span className="success-icon">
      <CheckCircle2 size={42} />
    </span>
    <div className="eyebrow">A LITTLE SOMETHING TO LOOK FORWARD TO</div>
    <h1>You’re <em>all booked.</em></h1>
    <p>Your visit is confirmed. We’ll see you in the chair.</p>
    <div className="panel confirmation">
      <div>
        <CalendarDays size={18} />
        <strong>
          {new Date(`${done.date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </strong>
      </div>
      <div><Clock3 size={18} />{timeLabel(done.start)} · {done.duration} min</div>
      <div>
        <Scissors size={18} />
        {done.services.map(s => s.name).join(' + ')}
      </div>
      <hr />
      <div>
        <strong>
          {money(done.total)}
        </strong>
        <span>Pay at the salon</span>
      </div>
    </div>
    <Link className="button" href="/profile">View my appointments <ArrowRight size={17} /></Link>
    <p className="fine-print">You’re signed in. Your appointment is saved in your profile.</p>
  </div>;

  return <div className="booking-layout">
    <section><div className="booking-progress" aria-label="Booking progress">
      {['Your services', 'Your time', 'Your details'].map((s, i) => <div key={s} className={i === step ? 'current' : i < step ? 'complete' : ''}>
        <span>
          {i < step ? <Check size={13} /> : i + 1}
        </span>
        {s}
      </div>)}
    </div>{!catalog.connected && <p className="notice" role="status">You can explore the service menu. Live availability will be ready once the salon database is connected.</p>}
      {step === 0 && <>
        <div className="eyebrow">STEP 01 — MAKE IT YOURS</div>
        <h1>A little care.<br /><em>Your way.</em></h1>
        <p className="muted">Choose one service or bring a few together.</p>
        <div className="category-tabs">
          {['All', ...categories].map(c => <button key={c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}>
            {c}
          </button>)}
        </div>
        <div className="booking-services">
          {catalog.services.filter(s => category === 'All' || s.category === category).map(s => <button
            key={s.id}
            className={`booking-service ${ids.includes(s.id) ? 'chosen' : ''}`}
            aria-pressed={ids.includes(s.id)}
            onClick={() => setIds(ids.includes(s.id) ? ids.filter(id => id !== s.id) : [...ids, s.id])}
          >
            <span className="check-box">
              {ids.includes(s.id) && <Check size={14} />}
            </span>
            <span>
              <strong>
                {s.name}
              </strong>
              <small>{s.category} · {s.duration} min</small>
            </span>
            <strong>
              {money(s.price)}
            </strong>
          </button>)}
        </div>
        {!catalog.services.length && <p className="empty-state">Services are being updated. Check back soon.</p>}
        <button
          className="button next-step"
          disabled={!ids.length || !stylists.length}
          onClick={() => setStep(1)}
        >Choose a time <ArrowRight size={17} /></button>
        {ids.length > 0 && !stylists.length && <p className="error">No stylist currently offers this combination. Please adjust your services.</p>}
      </>}
      {step === 1 && <>
        <div className="eyebrow">STEP 02 — TIME FOR YOURSELF</div>
        <h1>Find your<br /><em>perfect moment.</em></h1>
        <p className="muted">Availability is based on your {sum.duration}-minute visit.</p>
        {catalog.stylists.length > 1 && <div className="field-section">
          <h3>Choose your stylist</h3>
          <div className="stylist-options">
            {stylists.map(s => <button key={s.id} className={stylistId === s.id ? 'selected' : ''} onClick={() => setStylist(s.id)}>
              <span className="avatar">
                {s.name[0]}
              </span>
              <span>
                <strong>
                  {s.name}
                </strong>
                <small>
                  {s.title}
                </small>
              </span>
              {stylistId === s.id && <Check size={16} />}
            </button>)}
          </div>
        </div>}
        <div className="field-section">
          <label>Choose a date<input
            type="date"
            min={localDate()}
            max={localDate(new Date(Date.now() + salon.bookingDays * 86400000))}
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          /></label>
        </div>
        <div className="field-section">
          <h3>Available times <small>IST</small></h3>
          {loadingSlots ? <div className="slot-skeleton" role="status" aria-label="Loading available times">
            {Array.from({ length: 8 }, (_, i) => <div className="skeleton" key={i} />)}
          </div> : slotError ? <p className="error" role="alert">
            {slotError}
          </p> : slots.length ? <div className="time-grid">
            {slots.map(t => <button className={start === t ? 'selected' : ''} key={t} onClick={() => setStart(t)}>
              {timeLabel(t)}
            </button>)}
          </div> : <div className="empty-state">
            <CalendarDays size={28} />
            <p>No available times for this date.<br />Try another day{catalog.stylists.length > 1 ? ' or stylist' : ''}.</p>
          </div>}
        </div>
        <div className="form-actions">
          <button className="text-link" onClick={() => setStep(0)}><ArrowLeft size={16} /> Services</button>
          <button className="button" disabled={start === null || loadingSlots} onClick={() => setStep(2)}>Your details <ArrowRight size={17} /></button>
        </div>
      </>}
      {step === 2 && <>
        <div className="eyebrow">STEP 03 — WE’LL SAVE YOU A SEAT</div>
        <h1>Almost<br /><em>your moment.</em></h1>
        {needsLogin ? <div className="panel">
          <Login
            initialMobile={customer.mobile}
            onSuccess={() => {
              loadUser().catch(e => setError(e.message));
              setError('');
            }}
          />
        </div> : <form onSubmit={book} className="details-form">
          <p className="muted">
            {user ? 'Welcome back. Your details are ready.' : 'Your first visit creates your profile and signs you in.'}
          </p>
          <label>Your name<input
            autoComplete="name"
            minLength={2}
            maxLength={80}
            required
            value={customer.name}
            disabled={!!user}
            onChange={e => setCustomer({ ...customer, name: e.target.value })}
            placeholder="How should we call you?"
          /></label>
          <label>Mobile number<input
            type="tel"
            autoComplete="tel"
            required
            disabled={!!user}
            placeholder="+91 98765 43210"
            value={customer.mobile}
            onChange={e => setCustomer({ ...customer, mobile: e.target.value })}
          /></label>
          <label>Email address<input
            type="email"
            autoComplete="email"
            required
            disabled={!!user}
            placeholder="you@example.com"
            value={customer.email}
            onChange={e => setCustomer({ ...customer, email: e.target.value })}
          /><span className="field-help">Used for future sign-ins. Please double-check your email.</span></label>
          <label className="consent">
            <input type="checkbox" required />
            <span>I agree to the <Link href="/privacy" target="_blank">privacy policy</Link> and understand payment is at the salon.</span>
          </label>
          {error && <p className="error" role="alert">
            {error}
          </p>}
          <div className="form-actions">
            <button type="button" className="text-link" disabled={busy} onClick={() => setStep(1)}><ArrowLeft size={16} /> Your time</button>
            <button className="button" disabled={busy}>
              {busy ? <><LoaderCircle className="spin" size={17} /> Confirming…</> : <>Confirm appointment <Check size={17} /></>}
            </button>
          </div>
        </form>}
      </>}
    </section>
    <aside className="booking-summary">
      <div className="eyebrow">YOUR LITTLE ESCAPE</div>
      <h3>Your visit</h3>
      {selected.length ? <div className="summary-services">
        {selected.map(s => <div key={s.id}>
          <span>
            {s.name}
            <small>{s.duration} min</small>
          </span>
          <strong>
            {money(s.price)}
          </strong>
        </div>)}
      </div> : <p className="muted">Your selected services will appear here.</p>}
      {step > 0 && <div className="summary-time">
        <p>
          {new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}
          {start !== null && ` · ${timeLabel(start)}`}
        </p>
        {catalog.stylists.length > 1 && <small>With {stylist?.name}</small>}
      </div>}
      <div className="summary-total">
        <span>Total <small>{sum.duration} minutes</small></span>
        <strong>
          {money(sum.total)}
        </strong>
      </div>
      <div className="summary-assurance">
        <ShieldCheck size={18} />
        <span>Instant confirmation<br /><strong>Pay at the salon. No deposit.</strong></span>
      </div>
    </aside>
  </div>;
}
