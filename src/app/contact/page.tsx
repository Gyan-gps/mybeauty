import Link from 'next/link';
import { salon } from '@/lib/config';
export const metadata = {
  title: 'Visit us',
  description: 'Plan your salon visit and book a convenient appointment online.',
  alternates: { canonical: '/contact' }
};
export default function Contact() {
  return <div className="page-wrap prose-page">
    <div className="eyebrow">WE’LL SAVE YOU A SEAT</div>
    <h1>Your next<br /><em>good hair day.</em></h1>
    <div className="contact-grid">
      <article className="panel">
        <h3>Find us</h3>
        <p>
          {salon.address || 'Our address will be added here before launch.'}
        </p>
        {salon.address && <a
          className="text-link"
          href={`https://maps.google.com/?q=${encodeURIComponent(salon.address)}`}
          target="_blank"
          rel="noopener noreferrer"
        >Get directions ↗</a>}
      </article>
      <article className="panel">
        <h3>Get in touch</h3>
        {salon.phone ? <a href={`tel:${salon.phone}`}>
          {salon.phone}
        </a> : <p>Contact details coming soon.</p>}
        {salon.email && <p>
          <a href={`mailto:${salon.email}`}>
            {salon.email}
          </a>
        </p>}
      </article>
    </div>
    <p>Our booking calendar shows current availability, including stylist breaks and days off.</p>
    <Link className="button" href="/book">Find an available time ↗</Link>
  </div>;
}
