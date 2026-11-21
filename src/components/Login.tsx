'use client';
import { useState } from 'react';
import { ArrowRight, Mail, LoaderCircle } from 'lucide-react';
import { api } from '@/lib/client';
export function Login({ onSuccess, initialMobile = '' }: {
  onSuccess: () => void;
  initialMobile?: string;
}) {
  const [mobile, setMobile] = useState(initialMobile);
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (sent) {
        await api('auth/verify', { method: 'POST', body: JSON.stringify({ mobile, code }) });
        onSuccess();
      } else {
        const data = await api('auth/otp', { method: 'POST', body: JSON.stringify({ mobile }) });
        setMessage(data.message);
        setSent(true);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return <form className="login-form" onSubmit={submit}>
    <span className="login-icon">
      <Mail size={25} />
    </span>
    <h2>Welcome <em>back.</em></h2>
    <p>Enter your mobile number. We’ll send a sign-in code to the email saved on your profile.</p>
    <label>Mobile number<input
      type="tel"
      autoComplete="tel"
      required
      placeholder="+91 98765 43210"
      value={mobile}
      disabled={sent}
      onChange={e => setMobile(e.target.value)}
    /></label>
    {sent && <>
      <p className="notice" role="status">
        {message}
      </p>
      <label>Email verification code<input
        autoFocus
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        placeholder="6-digit code"
        value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
      /></label>
    </>}
    {error && <p className="error" role="alert">
      {error}
    </p>}
    <button className="button full" disabled={busy}>
      {busy ? <LoaderCircle className="spin" size={18} /> : <>
        {sent ? 'Verify & continue' : 'Send email code'}
        <ArrowRight size={17} />
      </>}
    </button>
    {sent && <button
      type="button"
      className="text-link"
      onClick={() => {
        setSent(false);
        setCode('');
        setMessage('');
      }}
    >Change number or request a new code</button>}
    <p className="fine-print">First visit? Your profile is created when you book.</p>
  </form>;
}
