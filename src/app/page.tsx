import { pageMeta } from '@/lib/seo';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Check, Scissors, Sparkles, Clock3, Leaf } from 'lucide-react';
import { SALON_NAME, salon, siteUrl } from '@/lib/config';
import { catalog } from '@/lib/db';
import { money } from '@/lib/booking';
export const revalidate = 300;
export const metadata = pageMeta(`${SALON_NAME} — Your time to feel good`, 'Thoughtful hair, beard and skin care. Discover your next look and book your salon appointment in a few easy steps.', '/');
export default async function HomePage() {
  const { services } = await catalog();
  const featured = services.filter(s => ['signature-cut', 'beard-sculpt', 'glow-facial'].includes(s.id));
  const cards = featured.length ? featured : services.slice(0, 3);
  return <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{        
__html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HairSalon',
          name: SALON_NAME,
          url: siteUrl,
          image: `${siteUrl}/og`,
          priceRange: '₹₹',
          ...(salon.phone ? { telephone: salon.phone } : {}),
          ...(salon.address ? { address: salon.address } : {})
        }).replace(/</g, '\\u003c')      
}}
    />
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="tiny-line" /> YOUR EVERYDAY, ELEVATED</div>
        <h1>A fresh look.<br />A little <em>more you.</em></h1>
        <p>Expert hands. Thoughtful care. A space to slow down.<br className="desktop-only" /> Make a little time for yourself. We’ll take it from here.</p>
        <div className="hero-buttons">
          <Link href="/book" className="button">Find your moment <ArrowUpRight size={18} /></Link>
          <Link className="text-link" href="/services">Explore services <ArrowDown size={16} /></Link>
        </div>
        <div className="hero-proof">
          <span className="proof-icon">
            <Scissors size={19} />
          </span>
          <div>
            <strong>Good style starts with good care.</strong>
            <span>Personal attention, from hello to the final finish.</span>
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <img
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=85"
          alt="Warm, thoughtfully designed salon with classic barber chairs"
          fetchPriority="high"
        />
        <div className="image-shade" />
        <div className="image-label"><span className="live-dot" /> A LITTLE LUXURY. JUST FOR YOU.</div>
        <div className="hero-image-caption">
          <span>THE ART OF<br /><em>feeling good.</em></span>
          <span className="circle-arrow">
            <ArrowUpRight size={26} />
          </span>
        </div>
        <div className="floating-note">
          <Sparkles size={18} />
          <span>Your next good hair day<br /><strong>starts right here.</strong></span>
        </div>
      </div>
      <div className="hero-number">01 — YOUR MOMENT</div>
    </section>
    <div className="values-strip">
      <span><Scissors size={16} /> Crafted around you</span>
      <i />
      <span><Clock3 size={16} /> Your time, respected</span>
      <i />
      <span><Leaf size={16} /> Care in every detail</span>
      <i />
      <span><Check size={16} /> Book now. Pay at the salon.</span>
    </div>
    <section className="section services-preview">
      <div className="section-heading">
        <div>
          <div className="eyebrow">THE CARE YOU CAME FOR</div>
          <h2>Small rituals.<br /><em>Remarkable results.</em></h2>
        </div>
        <div>
          <p>A sharp new cut or a well-earned reset.<br />Find what feels right for you.</p>
          <Link href="/services" className="text-link">View all services <ArrowUpRight size={16} /></Link>
        </div>
      </div>
      <div className="service-feature-grid">
        {cards.map((s, i) => <Link className="feature-card" href={`/book?service=${s.id}`} key={s.id}>
          <div className={`feature-art art-${i}`}>
            <span className="feature-number">0{i + 1}</span>
            {i === 0 ? <Scissors size={58} strokeWidth={.8} /> : i === 1 ? <span className="art-word">b.</span> : <Sparkles size={58} strokeWidth={.8} />}
            <span className="category-tag">
              {s.category}
            </span>
          </div>
          <div className="feature-content">
            <div>
              <h3>
                {s.name}
              </h3>
              <span>{s.duration} min · {money(s.price)}</span>
            </div>
            <ArrowUpRight size={21} />
          </div>
          <p>
            {s.description}
          </p>
        </Link>)}
      </div>
    </section>
    <section className="story-band">
      <div className="story-image">
        <img
          src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1000&q=85"
          alt="A stylist carefully finishing a client's haircut"
          loading="lazy"
        />
      </div>
      <div className="story-copy">
        <div className="eyebrow">MORE THAN A SALON VISIT</div>
        <h2>Come as you are.<br />Leave <em>feeling yourself.</em></h2>
        <p>We believe looking after yourself should feel effortless. A warm welcome, an honest conversation, and care that’s as individual as you are.</p>
        <Link href="/about" className="text-link">A little about us <ArrowUpRight size={17} /></Link>
        <div className="story-signature">See you in the chair.</div>
      </div>
    </section>
    <section className="section steps-section">
      <div className="eyebrow">LESS PLANNING. MORE PAMPERING.</div>
      <h2>Your next visit,<br /><em>beautifully simple.</em></h2>
      <div className="steps-grid">
        {[['01', 'Choose your care', 'Mix and match the services you love.'], ['02', 'Find your time', 'Choose an available slot that fits your day.'], ['03', 'Make yourself at home', 'Instant confirmation. Pay when you visit.']].map(([n, h, p]) => <div className="step" key={n}>
          <span>
            {n}
          </span>
          <h3>
            {h}
          </h3>
          <p>
            {p}
          </p>
        </div>)}
      </div>
    </section>
    <section className="cta-band">
      <div className="eyebrow">YOU DESERVE A MOMENT</div>
      <h2>Let’s make it <em>yours.</em></h2>
      <Link className="button" href="/book">Book your visit <ArrowUpRight size={18} /></Link>
      <p>No advance payment. Just something to look forward to.</p>
    </section>
  </>;
}
