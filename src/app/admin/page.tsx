'use client';

import { useState } from 'react';
import {
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  DollarSign,
  Plus,
  Trash2,
  Eye,
  Lock,
  Users,
  BarChart3,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { ChabadEvent } from '@/types';

type Tab = 'dashboard' | 'events' | 'gallery' | 'messages' | 'donations';

export default function AdminPage() {
  const {
    isAdmin,
    setIsAdmin,
    adminPassword,
    events,
    addEvent,
    deleteEvent,
    albums,
    messages,
    markMessageRead,
    donations,
  } = useStore();

  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'community' as ChabadEvent['category'],
    price: 0,
    maxParticipants: 0,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAdmin(true);
    } else {
      alert('סיסמה שגויה');
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: ChabadEvent = {
      id: Date.now().toString(),
      title: eventForm.title,
      description: eventForm.description,
      date: eventForm.date,
      time: eventForm.time,
      location: eventForm.location,
      category: eventForm.category,
      price: eventForm.price,
      maxParticipants: eventForm.maxParticipants || undefined,
      currentParticipants: 0,
      registrations: [],
      createdAt: new Date().toISOString(),
    };
    addEvent(newEvent);
    setShowEventForm(false);
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: 'community',
      price: 0,
      maxParticipants: 0,
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold">כניסת מנהל</h1>
            <p className="text-gray-500 text-sm mt-1">הזינו את סיסמת המנהל</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
              className="form-input text-center"
              dir="ltr"
            />
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-light text-white py-3 rounded-xl font-bold"
            >
              כניסה
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">
            לצורכי הדגמה: chabad123
          </p>
        </div>
      </div>
    );
  }

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalRegistrations = events.reduce((sum, e) => sum + e.currentParticipants, 0);
  const unreadMessages = messages.filter((m) => !m.isRead).length;

  const tabs: { key: Tab; label: string; icon: typeof Calendar; count?: number }[] = [
    { key: 'dashboard', label: 'סקירה', icon: BarChart3 },
    { key: 'events', label: 'אירועים', icon: Calendar, count: events.length },
    { key: 'gallery', label: 'גלריה', icon: ImageIcon, count: albums.length },
    { key: 'messages', label: 'הודעות', icon: MessageSquare, count: unreadMessages },
    { key: 'donations', label: 'תרומות', icon: DollarSign, count: donations.length },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-primary-dark text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-xl font-bold">לוח ניהול</h1>
          <button
            onClick={() => setIsAdmin(false)}
            className="text-gray-300 hover:text-white text-sm"
          >
            התנתק
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <span className="text-gray-500 text-sm">אירועים פעילים</span>
                </div>
                <p className="text-3xl font-black">{events.length}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-green-600" />
                  </div>
                  <span className="text-gray-500 text-sm">סה&quot;כ נרשמים</span>
                </div>
                <p className="text-3xl font-black">{totalRegistrations}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-accent-dark" />
                  </div>
                  <span className="text-gray-500 text-sm">סה&quot;כ תרומות</span>
                </div>
                <p className="text-3xl font-black">&#8362;{totalDonations.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <MessageSquare size={20} className="text-red-600" />
                  </div>
                  <span className="text-gray-500 text-sm">הודעות שלא נקראו</span>
                </div>
                <p className="text-3xl font-black">{unreadMessages}</p>
              </div>
            </div>

            {/* Recent Events with registrations */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">נרשמים אחרונים לאירועים</h3>
              {events.filter((e) => e.registrations.length > 0).length === 0 ? (
                <p className="text-gray-400 text-sm">אין הרשמות עדיין</p>
              ) : (
                <div className="space-y-3">
                  {events
                    .filter((e) => e.registrations.length > 0)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="border border-gray-100 rounded-lg p-4"
                      >
                        <h4 className="font-bold text-sm mb-2">{event.title}</h4>
                        <div className="space-y-1">
                          {event.registrations.map((reg) => (
                            <div
                              key={reg.id}
                              className="flex items-center justify-between text-sm text-gray-600"
                            >
                              <span>{reg.fullName}</span>
                              <span dir="ltr">{reg.phone}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">ניהול אירועים</h2>
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="flex items-center gap-2 bg-accent hover:bg-accent-light text-primary-dark px-4 py-2 rounded-xl font-bold text-sm"
              >
                <Plus size={18} />
                אירוע חדש
              </button>
            </div>

            {showEventForm && (
              <form
                onSubmit={handleAddEvent}
                className="bg-white rounded-xl p-6 shadow-sm space-y-4"
              >
                <h3 className="font-bold text-lg">הוספת אירוע חדש</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">שם האירוע *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.title}
                      onChange={(e) =>
                        setEventForm((p) => ({ ...p, title: e.target.value }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">קטגוריה</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) =>
                        setEventForm((p) => ({
                          ...p,
                          category: e.target.value as ChabadEvent['category'],
                        }))
                      }
                      className="form-input"
                    >
                      <option value="shabbat">שבת</option>
                      <option value="holiday">חגים</option>
                      <option value="class">שיעורים</option>
                      <option value="kids">ילדים</option>
                      <option value="community">קהילה</option>
                      <option value="other">אחר</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">תאריך *</label>
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(e) =>
                        setEventForm((p) => ({ ...p, date: e.target.value }))
                      }
                      className="form-input"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="form-label">שעה *</label>
                    <input
                      type="time"
                      required
                      value={eventForm.time}
                      onChange={(e) =>
                        setEventForm((p) => ({ ...p, time: e.target.value }))
                      }
                      className="form-input"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="form-label">מיקום *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.location}
                      onChange={(e) =>
                        setEventForm((p) => ({
                          ...p,
                          location: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">מחיר (0 = חינם)</label>
                    <input
                      type="number"
                      min="0"
                      value={eventForm.price}
                      onChange={(e) =>
                        setEventForm((p) => ({
                          ...p,
                          price: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      מקסימום משתתפים (0 = ללא הגבלה)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={eventForm.maxParticipants}
                      onChange={(e) =>
                        setEventForm((p) => ({
                          ...p,
                          maxParticipants: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">תיאור *</label>
                  <textarea
                    required
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="form-input"
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-xl font-bold"
                  >
                    הוסף אירוע
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="text-gray-400 hover:text-gray-600 px-4 py-2"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{event.title}</h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        {event.category}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {new Date(event.date).toLocaleDateString('he-IL')} |{' '}
                      {event.time} | {event.location}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {event.currentParticipants} נרשמים
                      {event.maxParticipants
                        ? ` / ${event.maxParticipants}`
                        : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="מחק אירוע"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">ניהול גלריה</h2>
            <p className="text-gray-500 text-sm">
              אלבומים קיימים: {albums.length}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  <div className="h-40 relative">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold">{album.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {album.images.length} תמונות
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">הודעות ({messages.length})</h2>
            {messages.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <MessageSquare
                  size={48}
                  className="text-gray-300 mx-auto mb-3"
                />
                <p className="text-gray-400">אין הודעות עדיין</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`bg-white rounded-xl p-5 shadow-sm border-r-4 ${
                      msg.isRead ? 'border-gray-200' : 'border-accent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold">{msg.fullName}</h3>
                        <p className="text-sm text-gray-500">{msg.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {new Date(msg.createdAt).toLocaleDateString('he-IL')}
                        </span>
                        {!msg.isRead && (
                          <button
                            onClick={() => markMessageRead(msg.id)}
                            className="text-primary hover:text-primary-light"
                            title="סמן כנקרא"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{msg.message}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span dir="ltr">{msg.email}</span>
                      {msg.phone && <span dir="ltr">{msg.phone}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">תרומות ({donations.length})</h2>
              <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
                <span className="text-gray-500 text-sm">סה&quot;כ: </span>
                <span className="font-black text-accent-dark text-lg">
                  &#8362;{totalDonations.toLocaleString()}
                </span>
              </div>
            </div>
            {donations.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <DollarSign
                  size={48}
                  className="text-gray-300 mx-auto mb-3"
                />
                <p className="text-gray-400">אין תרומות עדיין</p>
              </div>
            ) : (
              <div className="space-y-3">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold">{donation.fullName}</h3>
                      <p className="text-gray-500 text-sm" dir="ltr">
                        {donation.email}
                      </p>
                      {donation.dedication && (
                        <p className="text-gray-400 text-xs mt-1">
                          &quot;{donation.dedication}&quot;
                        </p>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-lg text-accent-dark">
                        {donation.currency === 'ILS' && '\u20AA'}
                        {donation.currency === 'USD' && '$'}
                        {donation.currency === 'EUR' && '\u20AC'}
                        {donation.amount}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(donation.createdAt).toLocaleDateString(
                          'he-IL'
                        )}
                      </p>
                      {donation.isRecurring && (
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">
                          חוזרת
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
