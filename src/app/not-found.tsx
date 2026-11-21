import Link from 'next/link';
export default function NotFound() {
  return <div className="page-wrap empty-state">
    <div className="eyebrow">404 — A DIFFERENT KIND OF SHORT CUT</div>
    <h1>Let’s get you<br /><em>back on track.</em></h1>
    <Link className="button" href="/">Back to home ↗</Link>
  </div>;
}
