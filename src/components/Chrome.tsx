'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Scissors, UserRound, Menu, X, Download, Home, CalendarDays } from 'lucide-react';
import { SALON_NAME } from '@/lib/config';
type InstallEvent = Event & {
  prompt: () => Promise<void>;
};
export function Chrome() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => { });
    const handler = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  useEffect(() => setOpen(false), [path]);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header">
      <Link className="brand" href="/" aria-label={`${SALON_NAME} home`}>
        <span className="brand-mark">
          <Scissors size={20} />
        </span>
        {SALON_NAME}
        <span className="brand-dot">.</span>
      </Link>
      <nav className={open ? 'desktop-nav is-open' : 'desktop-nav'} aria-label="Main navigation">
        <Link className={path === '/services' ? 'active' : ''} href="/services">Our services</Link>
        <Link href="/about">Our story</Link>
        <Link href="/contact">Visit us</Link>
      </nav>
      <div className="header-actions">
        {install && <button
          className="icon-button install"
          aria-label="Install MyBeauty"
          onClick={async () => {
            await install.prompt();
            setInstall(null);
          }}
        >
          <Download size={18} />
        </button>}
        <Link className="profile-link" href="/profile" aria-label="Your profile">
          <UserRound size={19} />
        </Link>
        <Link href="/book" className="button small header-book">Book a visit <ArrowUpRight size={16} /></Link>
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="icon-button menu-toggle"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
    {!path.startsWith('/admin') && <nav className="mobile-bottom" aria-label="Mobile navigation">
      <Link className={path === '/' ? 'active' : ''} href="/"><Home size={19} />Home</Link>
      <Link className={path === '/services' ? 'active' : ''} href="/services"><Scissors size={19} />Services</Link>
      <Link className={path === '/book' ? 'active' : ''} href="/book"><CalendarDays size={19} />Book a visit</Link>
      <Link className={path === '/profile' ? 'active' : ''} href="/profile"><UserRound size={19} />Profile</Link>
    </nav>}
  </>;
}
export function Footer() {
  return <footer className="footer">
    <div>
      <Link className="brand" href="/">
        {SALON_NAME}
        <span className="brand-dot">.</span>
      </Link>
      <p>Good hair. A calmer mind. A little more you.</p>
    </div>
    <div className="footer-links">
      <Link href="/services">Services</Link>
      <Link href="/contact">Visit us</Link>
      <Link href="/privacy">Privacy</Link>
      <Link href="/admin">Salon admin</Link>
    </div>
    <span className="footer-note">© {new Date().getFullYear()} {SALON_NAME}. Made for your moment.</span>
  </footer>;
}
