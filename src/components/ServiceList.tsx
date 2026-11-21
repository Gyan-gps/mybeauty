'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Check, Clock3 } from 'lucide-react';
import { categories } from '@/lib/config';
import { money, totals } from '@/lib/booking';
import type { Service } from '@/lib/types';
export function ServiceList({ services }: {
  services: Service[];
}) {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<string[]>([]);
  const chosen = services.filter(s => selected.includes(s.id));
  const sum = totals(chosen);
  return <>
    <div className="category-tabs" role="group" aria-label="Filter by service category">
      {['All', ...categories].map(c => <button className={category === c ? 'selected' : ''} key={c} onClick={() => setCategory(c)}>
        {c}
      </button>)}
    </div>
    <div className="service-list">
      {services.filter(s => category === 'All' || s.category === category).map(s => <button
        key={s.id}
        className={`service-row ${selected.includes(s.id) ? 'chosen' : ''}`}
        aria-pressed={selected.includes(s.id)}
        onClick={() => setSelected(selected.includes(s.id) ? selected.filter(id => id !== s.id) : [...selected, s.id])}
      >
        <span className="service-row-icon">
          {selected.includes(s.id) ? <Check size={20} /> : <Plus size={20} />}
        </span>
        <span className="service-row-copy">
          <span className="eyebrow">
            {s.category}
          </span>
          <strong>
            {s.name}
          </strong>
          <span>
            {s.description}
          </span>
        </span>
        <span className="service-price">
          <strong>
            {money(s.price)}
          </strong>
          <span><Clock3 size={13} />{s.duration} min</span>
        </span>
      </button>)}
    </div>
    {!services.length && <div className="empty-state">Our service menu is being updated. Please check back soon.</div>}
    {selected.length > 0 && <div className="selection-bar">
      <div>
        <strong>{selected.length} service{selected.length > 1 ? 's' : ''} selected</strong>
        <span>{sum.duration} min · {money(sum.total)}</span>
      </div>
      <Link className="button" href={`/book?services=${selected.join(',')}`}>Choose a time <ArrowUpRight size={18} /></Link>
    </div>}
  </>;
}
