export type Service = {
  id: string;

  name: string;

  category: string;

  description: string;

  price: number;

  duration: number;

  active: boolean;
};
export type Stylist = {
  id: string;

  name: string;

  title: string;

  active: boolean;

  serviceIds: string[];

  weekdays: number[];

  start: string;

  end: string;

  breaks: {
    start: string;
    end: string;
  }[];

  daysOff: string[];
};
export type Customer = {
  id: string;

  name: string;

  mobile: string;

  email: string;

  emailVerified: boolean;

  createdAt: Date;
};
export type Appointment = {
  id: string;

  userId: string;

  stylistId: string;

  stylistName: string;

  date: string;

  start: number;

  end: number;

  services: Service[];

  total: number;

  duration: number;

  status: 'confirmed' | 'completed' | 'cancelled' | 'no-show';

  paymentStatus: 'unpaid' | 'paid';

  customerName: string;

  createdAt: Date;
};
export type Reservation = {
  id: string;
  start: number;
  end: number;
  kind: 'appointment' | 'block';
};
export type Schedule = {
  stylistId: string;
  date: string;
  reservations: Reservation[];
};
export type Catalog = {
  services: Service[];
  stylists: Stylist[];
  connected: boolean;
};
