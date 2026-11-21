import { pageMeta } from '@/lib/seo';
import { catalog } from '@/lib/db';
import { Booking } from '@/components/Booking';
export const metadata = pageMeta('Book your visit', 'Choose your salon services, find an available time and confirm your appointment. Pay at the salon.', '/book');
export const dynamic = 'force-dynamic';
export default async function Book({ searchParams }: {
  searchParams: Promise<{
    service?: string;
    services?: string;
  }>;
}) {
  const params = await searchParams;
  return <div className="page-wrap booking-page">
    <Booking
      catalog={await catalog()}
      initialIds={(params.services || params.service || '').split(',').filter(Boolean)}
    />
  </div>;
}
