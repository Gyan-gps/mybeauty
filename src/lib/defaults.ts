import type { Service, Stylist } from './types';
export const defaultServices: Service[] = [
  {
    id: 'signature-cut',
    name: 'Signature haircut',
    category: 'Hair',
    description: 'A considered cut, tailored to you. Wash and finish included.',
    price: 450,
    duration: 45,
    active: true
  },
  {
    id: 'hair-spa',
    name: 'Restorative hair spa',
    category: 'Hair',
    description: 'Deep nourishment, a calming massage, a fresh start.',
    price: 900,
    duration: 60,
    active: true
  },
  {
    id: 'hair-colour',
    name: 'Hair colour',
    category: 'Hair',
    description: 'Rich, dimensional colour with a polished finish.',
    price: 1500,
    duration: 90,
    active: true
  },
  {
    id: 'beard-sculpt',
    name: 'Beard sculpt',
    category: 'Beard',
    description: 'Clean lines and thoughtful shaping for your signature look.',
    price: 250,
    duration: 30,
    active: true
  },
  {
    id: 'classic-shave',
    name: 'Classic shave',
    category: 'Beard',
    description: 'A warm towel, a close shave, a moment to slow down.',
    price: 300,
    duration: 30,
    active: true
  },
  {
    id: 'glow-facial',
    name: 'The glow facial',
    category: 'Facial',
    description: 'Cleanse, replenish and leave with a little extra glow.',
    price: 1200,
    duration: 60,
    active: true
  },
  {
    id: 'express-cleanup',
    name: 'Express cleanup',
    category: 'Facial',
    description: 'A refreshing reset for skin that needs a little care.',
    price: 600,
    duration: 30,
    active: true
  },
  {
    id: 'head-massage',
    name: 'Head massage',
    category: 'Grooming',
    description: 'Unwind with a soothing scalp and temple massage.',
    price: 350,
    duration: 30,
    active: true
  }
];
export const defaultStylist: Stylist = {
  id: 'lead-stylist',
  name: 'Your stylist',
  title: 'Hair & grooming specialist',
  active: true,
  serviceIds: defaultServices.map(s => s.id),
  weekdays: [0, 1, 2, 3, 4, 5, 6],
  start: '10:00',
  end: '20:00',
  breaks: [{ start: '14:00', end: '14:30' }],
  daysOff: []
};
