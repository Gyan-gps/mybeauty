// Change the salon name here once; all screens and metadata use this value.
export const SALON_NAME = 'MyBeauty';
export const salon = {

  name: SALON_NAME,
  tagline: 'A little time. All for you.',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  offset: '+05:30',
  address: '',
  phone: '',
  email: '',
  instagram: '',
  bookingDays: 30,
  noticeMinutes: 30
};
// On Vercel, fall back to the production domain Vercel provides when NEXT_PUBLIC_SITE_URL is unset.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');
export const categories = ['Hair', 'Beard', 'Facial', 'Grooming'] as const;
