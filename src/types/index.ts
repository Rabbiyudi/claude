// Rimon CRM Types

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  contactId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  location?: string;
  participants: string[];
  hebrewDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsItem {
  id: string;
  message: string;
  type: 'contact' | 'task' | 'event' | 'general';
  timestamp: Date;
  relatedId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  organization?: string;
  language: 'en' | 'he';
  avatar?: string;
}

export interface Report {
  id: string;
  content: string;
  createdAt: Date;
  type: 'voice' | 'text' | 'image';
  processed: boolean;
  extractedData?: {
    contacts?: Partial<Contact>[];
    tasks?: Partial<Task>[];
    events?: Partial<Event>[];
  };
}

export type IntentType = 'add_contact' | 'add_task' | 'add_event' | 'search' | 'update' | 'general';

export interface ParsedIntent {
  type: IntentType;
  confidence: number;
  data: Record<string, unknown>;
  originalText: string;
}
