import { pageMeta } from '@/lib/seo';
import { catalog } from '@/lib/db';
import { ServiceList } from '@/components/ServiceList';
export const metadata = pageMeta('Our services', 'Explore haircuts, beard care, facials and grooming. Choose multiple services and book your perfect salon visit.', '/services');
export const revalidate = 300;
export default async function Services() {
  const { services } = await catalog();
  return <div className="page-wrap">
    <div className="page-heading">
      <div className="eyebrow">A LITTLE CARE GOES A LONG WAY</div>
      <h1>Find your <em>ritual.</em></h1>
      <p>One treatment or a little of everything.<br />Choose your services. We’ll make time for you.</p>
    </div>
    <ServiceList services={services} />
    <p className="muted fine-print">Prices shown in INR. Payment at the salon. Service durations are estimates.</p>
  </div>;
}
