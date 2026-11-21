import { pageMeta } from '@/lib/seo';
import { SALON_NAME } from '@/lib/config';
export const metadata = pageMeta('Privacy', 'How your salon appointment and profile information is used.', '/privacy');
export default function Privacy() {
  return <div className="page-wrap prose-page">
    <div className="eyebrow">YOUR DETAILS, TREATED WITH CARE</div>
    <h1>Your <em>privacy.</em></h1>
    <h2>What we collect</h2>
    <p>{SALON_NAME} stores your name, mobile number, email address and appointment details so we can arrange your visits and show your booking history.</p>
    <h2>Access to your account</h2>
    <p>Your first appointment creates a profile and signs you in on that device. Your mobile and email are initially unverified. For future sign-ins, a one-time code is sent to the email saved on your profile. Session cookies keep you signed in; they are essential to the service.</p>
    <h2>Use and access</h2>
    <p>Salon administrators can access customer and appointment details to manage the salon. Email delivery providers process your email address to deliver login codes. We do not use your details for advertising.</p>
    <h2>Managing your information</h2>
    <p>You can update your name in your profile. Contact the salon to request correction of your mobile or email, deletion of your information, or help accessing your account. Service providers and retention periods should be confirmed by the salon before this website launches.</p>
  </div>;
}
