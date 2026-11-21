'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ArrowUpRight, LogOut, UserRound, LoaderCircle } from 'lucide-react';
import { api } from '@/lib/client';
import { money, timeLabel, slotInstant } from '@/lib/booking';
import type { Appointment, Customer } from '@/lib/types';
import { Loading } from '@/components/Loading';
import { Login } from '@/components/Login';
export default function Profile() {
  const [user, setUser] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [name, setName] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [message, setMessage] = useState('');
  const [cancelId, setCancelId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api('me');
      if (data.user?.role === 'admin') {
        setError('You are signed in as an administrator. Use the admin dashboard, or sign out to access a customer profile.');
        setUser(null);
      } else {
        setUser(data.user);
        setName(data.user?.name || '');
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function signout() {
    try {
      await api('auth/logout', { method: 'POST' });
      setUser(null);
      setAppointments([]);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function cancel(id: string) {
    setBusy(id);
    setError('');
    try {
      await api('appointments', { method: 'PATCH', body: JSON.stringify({ id, status: 'cancelled' }) });
      setCancelId('');
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  }

  if (loading) return <div className="page-wrap">
    <Loading label="Preparing your little corner…" />
  </div>;

  if (!user) return <div className="page-wrap auth-page">
    {error && <div className="error" role="alert">
      {error}
      <button className="text-link" onClick={load}>Try again</button>
      <button className="text-link" onClick={signout}>Sign out</button>
    </div>}
    <div className="panel auth-panel">
      <Login onSuccess={load} />
    </div>
    <Link className="text-link" href="/book">Your first visit? Book an appointment <ArrowUpRight size={16} /></Link>
  </div>;

  const upcoming = (a: Appointment) => a.status === 'confirmed' && +slotInstant(a.date, a.start) > Date.now();
  const shown = appointments.filter(a => tab === 'upcoming' ? upcoming(a) : !upcoming(a));

  return <div className="page-wrap">
    <div className="section-heading">
      <div>
        <div className="eyebrow">YOUR OWN LITTLE CORNER</div>
        <h1>Hello, <em>{user.name.split(' ')[0]}.</em></h1>
        <p className="muted">A little care, always worth making time for.</p>
      </div>
      <button className="text-link" onClick={signout}><LogOut size={16} /> Sign out</button>
    </div>
    {error && <p className="error" role="alert">
      {error}
    </p>}
    <div className="profile-layout">
      <section>
        <div className="section-heading compact">
          <h3>Your appointments</h3>
          <Link className="text-link" href="/book">Book a visit <ArrowUpRight size={15} /></Link>
        </div>
        <div className="category-tabs">
          <button className={tab === 'upcoming' ? 'selected' : ''} onClick={() => setTab('upcoming')}>Upcoming</button>
          <button className={tab === 'past' ? 'selected' : ''} onClick={() => setTab('past')}>History</button>
        </div>
        {shown.length ? shown.map(a => <article className="appointment-card" key={a.id}>
          <div className="appointment-top">
            <span className={`status ${a.status}`}>
              {a.status.replace('-', ' ')}
            </span>
            <span>
              {a.date}
            </span>
          </div>
          <h3>
            {a.services.map(s => s.name).join(' + ')}
          </h3>
          <p><ClockLabel />{timeLabel(a.start)} · {a.duration} min · {a.stylistName}</p>
          <div className="appointment-bottom">
            <strong>{money(a.total)} <small>
              {a.paymentStatus === 'paid' ? 'Paid' : 'Pay at salon'}
            </small></strong>
            {a.status === 'confirmed' && upcoming(a) ? <button className="text-link" onClick={() => setCancelId(a.id)}>Cancel appointment</button> : <Link className="text-link" href={`/book?services=${a.services.map(s => s.id).join(',')}`}>Book again ↗</Link>}
          </div>
          {cancelId === a.id && <div className="cancel-confirm">
            <p>Cancel this appointment? Your reserved time will become available again.</p>
            <button className="button danger small" disabled={busy === a.id} onClick={() => cancel(a.id)}>
              {busy === a.id ? <LoaderCircle className="spin" size={16} /> : 'Yes, cancel'}
            </button>
            <button className="text-link" disabled={!!busy} onClick={() => setCancelId('')}>Keep appointment</button>
          </div>}
        </article>) : <div className="empty-state">
          <CalendarDays size={32} />
          <h3>
            {tab === 'upcoming' ? 'Your next moment awaits.' : 'Your story starts here.'}
          </h3>
          <p>
            {tab === 'upcoming' ? 'No upcoming appointments. Find a time that’s just for you.' : 'Your previous visits will appear here.'}
          </p>
          <Link className="button" href="/book">Book a visit <ArrowUpRight size={17} /></Link>
        </div>}
      </section>
      <aside className="panel profile-details">
        <span className="profile-avatar">
          <UserRound size={30} />
        </span>
        <h3>Your details</h3>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setBusy('profile');
            setMessage('');
            setError('');
            try {
              await api('me', { method: 'PATCH', body: JSON.stringify({ name }) });
              setUser({ ...user, name });
              setMessage('Your name has been updated.');
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy('');
            }
          }}
        >
          <label>Name<input minLength={2} maxLength={80} value={name} onChange={e => setName(e.target.value)} required /></label>
          <label>Mobile<input value={user.mobile} disabled /></label>
          <label>Email<input value={user.email} disabled /></label>
          <span className="verification-note">
            {user.emailVerified ? 'Email verified' : 'Email not yet verified — verified on your next email OTP login.'}
          </span>
          <button className="button full" disabled={busy === 'profile'}>
            {busy === 'profile' ? 'Saving…' : 'Save details'}
          </button>
          {message && <p className="notice" role="status">
            {message}
          </p>}
        </form>
        <p className="fine-print">Need to change your mobile or email? Contact the salon for help.</p>
      </aside>
    </div>
  </div>;
}
function ClockLabel() {
  return <CalendarDays size={14} />;
}
