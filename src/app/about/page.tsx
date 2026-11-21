import { pageMeta } from '@/lib/seo';
import Link from 'next/link';
import { SALON_NAME } from '@/lib/config';
export const metadata = pageMeta('Our story', 'Meet the thinking behind our salon: thoughtful care, personal attention and time for yourself.', '/about');
export default function About() {



  return <div className="page-wrap prose-page">
    <div className="eyebrow">THE STORY BEHIND THE CHAIR</div>
    <h1>Personal care.<br /><em>In every sense.</em></h1>
    <img



      className="wide-photo"



      src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=85"



      alt="A welcoming salon interior"



    />
    <h2>A space for <em>yourself.</em></h2>
    <p>At {SALON_NAME}, a visit starts with listening. Whether you’re keeping a look you love or trying something new, our approach is simple: understand what works for you, take care with the details, and help you leave feeling good.</p>
    <p>From a fresh haircut to a restorative facial, you can bring your favourite services together in one visit. Choose your time online, receive instant confirmation, and pay at the salon.</p>
    <Link className="button" href="/book">Make time for yourself ↗</Link>
  </div>;
}
