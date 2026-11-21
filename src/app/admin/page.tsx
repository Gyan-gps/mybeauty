'use client';
import { useEffect, useState } from 'react';
import { CalendarDays, Users, Scissors, Clock3, LogOut, Plus, ArrowRight, LoaderCircle, Settings2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/client';
import { localDate, money, timeLabel } from '@/lib/booking';
import { categories, SALON_NAME } from '@/lib/config';
import type { Appointment, Customer, Service, Stylist, Schedule } from '@/lib/types';
import { Loading } from '@/components/Loading';
type Data = {
  appointments: Appointment[];

  users: Customer[];

  services: Service[];

  stylists: Stylist[];

  schedules: Schedule[];
};
const blankService: Service = {

  id: '',
  name: '',
  category: 'Hair',
  description: '',
  price: 450,
  duration: 30,
  active: true
};
const blankStylist: Stylist = {

  id: '',
  name: '',
  title: 'Stylist',
  active: true,
  serviceIds: [],
  weekdays: [1, 2, 3, 4, 5, 6],
  start: '10:00',
  end: '20:00',
  breaks: [{ start: '14:00', end: '14:30' }],
  daysOff: []
};
export default function Admin() {

  const [data, setData] = useState<Data | null>(null);

  const [loading, setLoading] = useState(true);

  const [authenticated, setAuthenticated] = useState(false);

  const [error, setError] = useState('');

  const [message, setMessage] = useState('');

  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState('Appointments');

  const [date, setDate] = useState(localDate());

  const [service, setService] = useState<Service | null>(null);

  const [stylist, setStylist] = useState<Stylist | null>(null);

  const [block, setBlock] = useState({ stylistId: '', date: localDate(), start: '10:00', end: '11:00' });

  const [pending, setPending] = useState<{
    id: string;

    status: 'cancelled' | 'completed' | 'no-show';

    paymentStatus?: 'paid';
  } | null>(null);

  async function load() {

    setError('');

    try {

      const me = await api('me');

      if (me.user?.role !== 'admin') {

        setAuthenticated(false);

        setData(null);

        return;

      }

      setAuthenticated(true);

      const d = await api<Data>('admin/data');

      setData(d);

      setBlock(b => ({ ...b, stylistId: b.stylistId || d.stylists[0]?.id || '' }));

    } catch (e) {

      setError((e as Error).message);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    load();

  }, []);

  useEffect(() => {

    if (!pending && !service && !stylist) return;

    const modal = document.querySelector<HTMLElement>('.modal');

    const previous = document.activeElement as HTMLElement | null;

    const overflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const elements = () => Array.from(modal?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, textarea, a[href]') || []);

    elements()[0]?.focus();

    const handler = (event: KeyboardEvent) => {

      if (event.key === 'Escape' && !busy) {

        setPending(null);

        setService(null);

        setStylist(null);

      }

      if (event.key === 'Tab') {

        const list = elements();

        const first = list[0], last = list.at(-1);

        if (event.shiftKey && document.activeElement === first) {

          event.preventDefault();

          last?.focus();

        } else if (!event.shiftKey && document.activeElement === last) {

          event.preventDefault();

          first?.focus();

        }

      }

    };

    document.addEventListener('keydown', handler);

    return () => {

      document.body.style.overflow = overflow;

      document.removeEventListener('keydown', handler);

      previous?.focus();

    };

  }, [!!pending, !!service, !!stylist, busy]);

  async function action(path: string, body: unknown, method = 'POST') {

    setBusy(true);

    setError('');

    setMessage('');

    try {

      await api(path, { method, body: JSON.stringify(body) });

      setMessage('Changes saved.');

      await load();

      return true;

    } catch (e) {

      setError((e as Error).message);

      return false;

    } finally {

      setBusy(false);

    }

  }

  if (loading) return <div className="page-wrap">
    <Loading label="Opening your salon dashboard…" />
  </div>;

  if (!authenticated) return <div className="page-wrap auth-page">
    <form
      className="panel auth-panel login-form"
      onSubmit={async e => {

        e.preventDefault();

        setBusy(true);

        setError('');

        try {

          await api('auth/admin', { method: 'POST', body: JSON.stringify({ password }) });

          setPassword('');

          await load();

        } catch (e) {

          setError((e as Error).message);

        } finally {

          setBusy(false);

        }

      }}
    >
      <span className="login-icon">
        <ShieldCheck size={26} />
      </span>
      <div className="eyebrow">{SALON_NAME} · SALON MANAGEMENT</div>
      <h1>Your salon.<br /><em>In good hands.</em></h1>
      <label>Admin password<input
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
      /></label>
      {error && <p className="error" role="alert">
        {error}
      </p>}
      <button className="button full" disabled={busy}>
        {busy ? <LoaderCircle size={18} className="spin" /> : <>Open dashboard <ArrowRight size={17} /></>}
      </button>
    </form>
  </div>;

  if (!data) return <div className="page-wrap">
    <p className="error">
      {error || 'Dashboard could not load.'}
    </p>
    <button className="button" onClick={load}>Try again</button>
  </div>;

  const daily = data.appointments.filter(a => a.date === date);

  const confirmed = daily.filter(a => a.status === 'confirmed');

  return <div className="admin-shell page-wrap"><div className="section-heading">
    <div>
      <div className="eyebrow">A GOOD DAY STARTS HERE</div>
      <h1>Salon <em>dashboard.</em></h1>
    </div>
    <button
      className="text-link"
      onClick={async () => {

        try {

          await api('auth/logout', { method: 'POST' });

          setAuthenticated(false);

          setData(null);

        } catch (e) {

          setError((e as Error).message);

        }

      }}
    ><LogOut size={16} /> Sign out</button>
  </div><div className="stat-grid">
      <div className="stat-card">
        <CalendarDays size={18} />
        <span>Appointments on {date}</span>
        <strong>
          {daily.length}
        </strong>
      </div>
      <div className="stat-card">
        <Clock3 size={18} />
        <span>Upcoming on this day</span>
        <strong>
          {confirmed.length}
        </strong>
      </div>
      <div className="stat-card">
        <Users size={18} />
        <span>Customers loaded</span>
        <strong>
          {data.users.length}
        </strong>
      </div>
      <div className="stat-card">
        <Scissors size={18} />
        <span>Active stylists</span>
        <strong>
          {data.stylists.filter(s => s.active).length}
        </strong>
      </div>
    </div><div className="category-tabs admin-tabs">
      {['Appointments', 'Customers', 'Services', 'Stylists & hours', 'Blocked times'].map(t => <button
        key={t}
        className={tab === t ? 'selected' : ''}
        onClick={() => {

          setTab(t);

          setMessage('');

          setError('');

        }}
      >
        {t}
      </button>)}
    </div>{error && <p className="error" role="alert">
      {error}
    </p>}{message && <p className="notice" role="status">
      {message}
    </p>}
    {tab === 'Appointments' && <>
      <div className="section-heading compact">
        <h3>Daily appointments</h3>
        <input
          type="date"
          aria-label="Appointment date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>
      {daily.length ? <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Customer</th>
              <th>Services</th>
              <th>Stylist</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {daily.map(a => <tr key={a.id}>
              <td>
                {timeLabel(a.start)}
                <small>{a.duration} min</small>
              </td>
              <td>
                {a.customerName}
              </td>
              <td>
                {a.services.map(s => s.name).join(', ')}
              </td>
              <td>
                {a.stylistName}
              </td>
              <td>
                {money(a.total)}
                <small>
                  {a.paymentStatus}
                </small>
              </td>
              <td>
                <span className={`status ${a.status}`}>
                  {a.status}
                </span>
              </td>
              <td>
                {a.status === 'confirmed' && <div className="table-actions">
                  <button
                    disabled={busy}
                    onClick={() => setPending({ id: a.id, status: 'completed', paymentStatus: 'paid' })}
                  >Complete & mark paid</button>
                  <button disabled={busy} onClick={() => setPending({ id: a.id, status: 'no-show' })}>No-show</button>
                  <button disabled={busy} onClick={() => setPending({ id: a.id, status: 'cancelled' })}>Cancel</button>
                </div>}
              </td>
            </tr>)}
          </tbody>
        </table>
      </div> : <div className="empty-state">
        <CalendarDays size={30} />
        <p>No appointments for this date.</p>
      </div>}
      <p className="fine-print">Dashboard loads up to the most recent 1,000 appointments. Completion also records payment as paid.</p>
    </>}
    {tab === 'Customers' && <>
      <h3>Customer directory</h3>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Verified email</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map(u => <tr key={u.id}>
              <td>
                {u.name}
              </td>
              <td>
                {u.mobile}
              </td>
              <td>
                {u.email}
              </td>
              <td>
                {u.emailVerified ? 'Yes' : 'No'}
              </td>
              <td>
                {new Date(u.createdAt).toLocaleDateString('en-IN')}
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {!data.users.length && <p className="empty-state">Customers appear after their first booking.</p>}
    </>}
    {tab === 'Services' && <>
      <div className="section-heading compact">
        <h3>Service menu</h3>
        <button
          className="button small"
          onClick={() => setService({ ...blankService, id: crypto.randomUUID() })}
        ><Plus size={16} /> Add service</button>
      </div>
      <div className="admin-card-grid">
        {data.services.map(s => <article className="panel" key={s.id}>
          <span className="eyebrow">
            {s.category}
          </span>
          <h3>
            {s.name}
          </h3>
          <p>{money(s.price)} · {s.duration} min</p>
          <span className={`status ${s.active ? 'confirmed' : 'cancelled'}`}>
            {s.active ? 'Active' : 'Hidden'}
          </span>
          <button className="text-link" onClick={() => setService(s)}><Settings2 size={15} /> Edit service</button>
        </article>)}
      </div>
    </>}
    {tab === 'Stylists & hours' && <>
      <div className="section-heading compact">
        <h3>Team & availability</h3>
        <button
          className="button small"
          onClick={() => setStylist({

            ...blankStylist,
            id: crypto.randomUUID(),
            serviceIds: data.services.filter(s => s.active).map(s => s.id)
          })}
        ><Plus size={16} /> Add stylist</button>
      </div>
      <p className="muted">Customers see the stylist picker only when more than one stylist is active. Each stylist has an independent schedule.</p>
      <div className="admin-card-grid">
        {data.stylists.map(s => <article className="panel" key={s.id}>
          <span className="avatar">
            {s.name[0]}
          </span>
          <h3>
            {s.name}
          </h3>
          <p>
            {s.title}
          </p>
          <p>{s.start} – {s.end} IST</p>
          <span className={`status ${s.active ? 'confirmed' : 'cancelled'}`}>
            {s.active ? 'Active' : 'Hidden'}
          </span>
          <button className="text-link" onClick={() => setStylist(s)}>Edit schedule ↗</button>
        </article>)}
      </div>
    </>}
    {tab === 'Blocked times' && <>
      <h3>Keep some time free</h3>
      <p className="muted">Block a meeting, a walk-in, or a little extra breathing room.</p>
      <form
        className="panel block-form"
        onSubmit={e => {

          e.preventDefault();

          action('admin/blocks', block);

        }}
      >
        <label>Stylist<select
          value={block.stylistId}
          onChange={e => setBlock({ ...block, stylistId: e.target.value })}
          required
        >
          <option value="">Select stylist</option>
          {data.stylists.map(s => <option key={s.id} value={s.id}>
            {s.name}
          </option>)}
        </select></label>
        <label>Date<input
          type="date"
          min={localDate()}
          required
          value={block.date}
          onChange={e => setBlock({ ...block, date: e.target.value })}
        /></label>
        <label>From<input
          type="time"
          required
          value={block.start}
          onChange={e => setBlock({ ...block, start: e.target.value })}
        /></label>
        <label>Until<input
          type="time"
          required
          value={block.end}
          onChange={e => setBlock({ ...block, end: e.target.value })}
        /></label>
        <button className="button" disabled={busy}>Block time</button>
      </form>
      <div className="admin-card-grid">
        {data.schedules.flatMap(s => s.reservations.filter(r => r.kind === 'block').map(r => <article className="panel" key={r.id}>
          <h3>
            {data.stylists.find(st => st.id === s.stylistId)?.name}
          </h3>
          <p>{s.date} · {timeLabel(r.start)} – {timeLabel(r.end)}</p>
          <button
            className="text-link"
            disabled={busy}
            onClick={() => action('admin/blocks', { id: r.id, date: s.date, stylistId: s.stylistId }, 'DELETE')}
          >Remove block</button>
        </article>))}
      </div>
    </>}
    {pending && <div className="modal-backdrop">
      <section className="modal panel" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">Update <em>appointment?</em></h2>
        <p>
          {pending.status === 'completed' ? 'Mark this appointment completed and paid?' : pending.status === 'cancelled' ? 'Cancel this appointment and release the reserved time?' : 'Mark this appointment as a no-show?'}
        </p>
        <div className="form-actions">
          <button className="text-link" disabled={busy} onClick={() => setPending(null)}>Keep current status</button>
          <button
            className="button"
            disabled={busy}
            onClick={async () => {

              if (await action('appointments', pending, 'PATCH')) setPending(null);

            }}
          >
            {busy ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </section>
    </div>}
    {service && <div className="modal-backdrop">
      <section className="modal panel" role="dialog" aria-modal="true" aria-labelledby="service-title">
        <div className="section-heading compact">
          <h2 id="service-title">Edit <em>service.</em></h2>
          <button aria-label="Close service editor" className="icon-button" onClick={() => setService(null)}>×</button>
        </div>
        <form
          className="editor-form"
          onSubmit={async e => {

            e.preventDefault();

            if (await action('admin/services', service)) setService(null);

          }}
        >
          <label>Name<input
            required
            value={service.name}
            onChange={e => setService({ ...service, name: e.target.value })}
          /></label>
          <label>Category<select
            value={service.category}
            onChange={e => setService({ ...service, category: e.target.value })}
          >
            {categories.map(c => <option key={c}>
              {c}
            </option>)}
          </select></label>
          <label>Description<textarea
            value={service.description}
            onChange={e => setService({ ...service, description: e.target.value })}
          /></label>
          <div className="two-fields">
            <label>Price (₹)<input
              type="number"
              min="0"
              required
              value={service.price}
              onChange={e => setService({ ...service, price: Number(e.target.value) })}
            /></label>
            <label>Duration (minutes)<input
              type="number"
              min="15"
              max="480"
              step="15"
              required
              value={service.duration}
              onChange={e => setService({ ...service, duration: Number(e.target.value) })}
            /></label>
          </div>
          <label className="consent"><input
            type="checkbox"
            checked={service.active}
            onChange={e => setService({ ...service, active: e.target.checked })}
          />Available for booking</label>
          <p className="fine-print">Assign new services to at least one stylist before customers can book them.</p>
          {error && <p className="error" role="alert">
            {error}
          </p>}
          <button className="button full" disabled={busy}>
            {busy ? 'Saving…' : 'Save service'}
          </button>
        </form>
      </section>
    </div>}
    {stylist && <div className="modal-backdrop">
      <section className="modal panel" role="dialog" aria-modal="true" aria-labelledby="stylist-title">
        <div className="section-heading compact">
          <h2 id="stylist-title">Stylist <em>schedule.</em></h2>
          <button aria-label="Close stylist editor" className="icon-button" onClick={() => setStylist(null)}>×</button>
        </div>
        <form
          className="editor-form"
          onSubmit={async e => {

            e.preventDefault();

            if (await action('admin/stylists', stylist)) setStylist(null);

          }}
        >
          <label>Name<input
            required
            value={stylist.name}
            onChange={e => setStylist({ ...stylist, name: e.target.value })}
          /></label>
          <label>Title<input value={stylist.title} onChange={e => setStylist({ ...stylist, title: e.target.value })} /></label>
          <label className="consent"><input
            type="checkbox"
            checked={stylist.active}
            onChange={e => setStylist({ ...stylist, active: e.target.checked })}
          />Active stylist</label>
          <h3>Services offered</h3>
          <div className="checkbox-grid">
            {data.services.map(s => <label className="consent" key={s.id}>
              <input
                type="checkbox"
                checked={stylist.serviceIds.includes(s.id)}
                onChange={e => setStylist({

                  ...stylist,
                  serviceIds: e.target.checked ? [...stylist.serviceIds, s.id] : stylist.serviceIds.filter(id => id !== s.id)
                })}
              />
              {s.name}
            </label>)}
          </div>
          <h3>Working days</h3>
          <div className="weekday-options">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => <button
              type="button"
              aria-pressed={stylist.weekdays.includes(i)}
              className={stylist.weekdays.includes(i) ? 'selected' : ''}
              key={day}
              onClick={() => setStylist({

                ...stylist,
                weekdays: stylist.weekdays.includes(i) ? stylist.weekdays.filter(d => d !== i) : [...stylist.weekdays, i]
              })}
            >
              {day}
            </button>)}
          </div>
          <div className="two-fields">
            <label>Start (IST)<input
              type="time"
              required
              value={stylist.start}
              onChange={e => setStylist({ ...stylist, start: e.target.value })}
            /></label>
            <label>End (IST)<input
              type="time"
              required
              value={stylist.end}
              onChange={e => setStylist({ ...stylist, end: e.target.value })}
            /></label>
          </div>
          <h3>Breaks</h3>
          {stylist.breaks.map((b, i) => <div className="break-row" key={i}>
            <input
              type="time"
              aria-label={`Break ${i + 1} start`}
              required
              value={b.start}
              onChange={e => setStylist({

                ...stylist,
                breaks: stylist.breaks.map((v, j) => i === j ? { ...v, start: e.target.value } : v)
              })}
            />
            <input
              type="time"
              aria-label={`Break ${i + 1} end`}
              required
              value={b.end}
              onChange={e => setStylist({

                ...stylist,
                breaks: stylist.breaks.map((v, j) => i === j ? { ...v, end: e.target.value } : v)
              })}
            />
            <button
              type="button"
              className="icon-button"
              aria-label="Remove break"
              onClick={() => setStylist({ ...stylist, breaks: stylist.breaks.filter((_, j) => i !== j) })}
            >×</button>
          </div>)}
          <button
            type="button"
            className="text-link"
            onClick={() => setStylist({ ...stylist, breaks: [...stylist.breaks, { start: '15:00', end: '15:15' }] })}
          >+ Add break</button>
          <label>Days off (one date per line, YYYY-MM-DD)<textarea
            placeholder="2026-12-25"
            value={stylist.daysOff.join('\n')}
            onChange={e => setStylist({ ...stylist, daysOff: e.target.value.split('\n') })}
            onBlur={() => setStylist({ ...stylist, daysOff: stylist.daysOff.map(d => d.trim()).filter(Boolean) })}
          /></label>
          <p className="fine-print">Schedule changes affect new availability. Existing confirmed appointments remain reserved.</p>
          {error && <p className="error" role="alert">
            {error}
          </p>}
          <button className="button full" disabled={busy}>
            {busy ? 'Saving…' : 'Save stylist'}
          </button>
        </form>
      </section>
    </div>}
  </div>;
}
