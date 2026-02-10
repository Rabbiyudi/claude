// Chabad House Website Types

export interface ChabadEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  endDate?: string;
  time: string;
  location: string;
  image?: string;
  category: 'shabbat' | 'holiday' | 'class' | 'kids' | 'community' | 'other';
  price?: number; // 0 = free
  maxParticipants?: number;
  currentParticipants: number;
  registrations: EventRegistration[];
  hebrewDate?: string;
  isRecurring?: boolean;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  numberOfGuests: number;
  notes?: string;
  paymentStatus: 'pending' | 'completed' | 'free';
  createdAt: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description?: string;
  coverImage: string;
  images: GalleryImage[];
  date: string;
  category: string;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  albumId: string;
}

export interface Donation {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  amount: number;
  currency: 'ILS' | 'USD' | 'EUR';
  dedication?: string;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'yearly';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ShabbatTimes {
  date: string;
  parashat: string;
  candleLighting: string;
  havdalah: string;
  city: string;
}

export interface SiteSettings {
  chabadName: string;
  chabadNameHe: string;
  rabbiName: string;
  address: string;
  phone: string;
  email: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  heroImage?: string;
  aboutText: string;
  aboutImage?: string;
  city: string;
}
