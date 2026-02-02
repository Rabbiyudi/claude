'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Contact, Task, Event, NewsItem, User, Report } from '@/types';
import type { Language } from '@/i18n/translations';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Contacts
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  updateContact: (id: string, data: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Events
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (id: string, data: Partial<Event>) => void;
  deleteEvent: (id: string) => void;

  // News feed
  newsItems: NewsItem[];
  addNewsItem: (item: NewsItem) => void;

  // Reports
  reports: Report[];
  addReport: (report: Report) => void;
  lastReport: Report | null;

  // UI State
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;

  // Settings
  whatsappEnabled: boolean;
  setWhatsappEnabled: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

// Initial mock data
const mockUser: User = {
  id: '1',
  name: 'Mendel',
  email: 'mendel@chabadisraeli.org',
  organization: 'Chabad Israeli Center',
  language: 'en',
};

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Purim Celebration',
    description: 'Annual Purim party with megillah reading',
    date: new Date('2026-03-14T18:00:00'),
    location: 'Main Hall',
    participants: ['Moshe Avraham', 'Sarah Cohen', 'David Levi'],
    hebrewDate: "י\"ד אדר ב'",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Shabbat Dinner',
    description: 'Weekly community Shabbat dinner',
    date: new Date('2026-02-06T18:30:00'),
    location: 'Community Center',
    participants: ['Rachel Green', 'Yossi Klein'],
    hebrewDate: "ח' אדר א'",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Torah Study',
    description: 'Weekly Parsha class',
    date: new Date('2026-02-04T19:00:00'),
    location: 'Study Hall',
    participants: ['Avi Stern', 'Miriam Gold', 'Chaim Weiss', 'Leah Bloom'],
    hebrewDate: "ו' אדר א'",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockNewsItems: NewsItem[] = [
  {
    id: '1',
    message: 'Moshe Avraham +2 registered for the Purim event',
    type: 'event',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    relatedId: '1',
  },
  {
    id: '2',
    message: 'New contact added: Sarah Cohen',
    type: 'contact',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    message: 'Task completed: Call David about sponsorship',
    type: 'task',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
];

const mockLastReport: Report = {
  id: '1',
  content: 'Met with potential donor at the coffee shop. Very interested in supporting youth programs. Follow up next week.',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  type: 'voice',
  processed: true,
  extractedData: {
    contacts: [{ name: 'Potential Donor', notes: 'Interested in youth programs' }],
    tasks: [{ title: 'Follow up with potential donor', priority: 'high' }],
  },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      user: mockUser,
      setUser: (user) => set({ user }),

      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),

      // Contacts
      contacts: [],
      addContact: (contact) =>
        set((state) => ({ contacts: [...state.contacts, contact] })),
      updateContact: (id, data) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
          ),
        })),
      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),

      // Tasks
      tasks: [],
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, data) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date() } : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      toggleTaskComplete: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date() } : t
          ),
        })),

      // Events
      events: mockEvents,
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (id, data) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: new Date() } : e
          ),
        })),
      deleteEvent: (id) =>
        set((state) => ({ events: state.events.filter((e) => e.id !== id) })),

      // News feed
      newsItems: mockNewsItems,
      addNewsItem: (item) =>
        set((state) => ({ newsItems: [item, ...state.newsItems].slice(0, 20) })),

      // Reports
      reports: [mockLastReport],
      addReport: (report) =>
        set((state) => ({
          reports: [report, ...state.reports],
          lastReport: report,
        })),
      lastReport: mockLastReport,

      // UI State
      isRecording: false,
      setIsRecording: (isRecording) => set({ isRecording }),
      isProcessing: false,
      setIsProcessing: (isProcessing) => set({ isProcessing }),

      // Settings
      whatsappEnabled: true,
      setWhatsappEnabled: (whatsappEnabled) => set({ whatsappEnabled }),
      notificationsEnabled: true,
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    {
      name: 'rimon-crm-storage',
      partialize: (state) => ({
        language: state.language,
        contacts: state.contacts,
        tasks: state.tasks,
        events: state.events,
        whatsappEnabled: state.whatsappEnabled,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);
