'use client';

import { create } from 'zustand';
import type {
  ChabadEvent,
  EventRegistration,
  GalleryAlbum,
  Donation,
  ContactMessage,
  ShabbatTimes,
  SiteSettings,
} from '@/types';
import { mockEvents, mockGalleryAlbums, mockShabbatTimes, siteSettings } from '@/data/mock-data';

interface AppState {
  // Site Settings
  settings: SiteSettings;

  // Events
  events: ChabadEvent[];
  addEvent: (event: ChabadEvent) => void;
  updateEvent: (id: string, data: Partial<ChabadEvent>) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (eventId: string, registration: EventRegistration) => void;

  // Gallery
  albums: GalleryAlbum[];
  addAlbum: (album: GalleryAlbum) => void;
  deleteAlbum: (id: string) => void;

  // Donations
  donations: Donation[];
  addDonation: (donation: Donation) => void;

  // Contact Messages
  messages: ContactMessage[];
  addMessage: (message: ContactMessage) => void;
  markMessageRead: (id: string) => void;

  // Shabbat Times
  shabbatTimes: ShabbatTimes;

  // Admin
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  adminPassword: string;
}

export const useStore = create<AppState>()((set) => ({
  // Site Settings
  settings: siteSettings,

  // Events
  events: mockEvents,
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (id, data) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),
  deleteEvent: (id) =>
    set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
  registerForEvent: (eventId, registration) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              registrations: [...e.registrations, registration],
              currentParticipants: e.currentParticipants + 1 + registration.numberOfGuests,
            }
          : e
      ),
    })),

  // Gallery
  albums: mockGalleryAlbums,
  addAlbum: (album) => set((state) => ({ albums: [...state.albums, album] })),
  deleteAlbum: (id) =>
    set((state) => ({ albums: state.albums.filter((a) => a.id !== id) })),

  // Donations
  donations: [],
  addDonation: (donation) =>
    set((state) => ({ donations: [...state.donations, donation] })),

  // Contact Messages
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [message, ...state.messages] })),
  markMessageRead: (id) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, isRead: true } : m
      ),
    })),

  // Shabbat Times
  shabbatTimes: mockShabbatTimes,

  // Admin
  isAdmin: false,
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  adminPassword: 'chabad123',
}));
