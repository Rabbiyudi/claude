'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle,
  CreditCard,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { EventRegistration } from '@/types';

const categoryLabels: Record<string, string> = {
  shabbat: 'שבת',
  holiday: 'חגים',
  class: 'שיעורים',
  kids: 'ילדים',
  community: 'קהילה',
  other: 'אחר',
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const events = useStore((s) => s.events);
  const registerForEvent = useStore((s) => s.registerForEvent);

  const event = events.find((e) => e.id === params.id);

  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    numberOfGuests: 0,
    notes: '',
  });

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-400 mb-4">האירוע לא נמצא</h1>
          <Link href="/events" className="text-primary hover:underline">
            חזרה לאירועים
          </Link>
        </div>
      </div>
    );
  }

  const isFull =
    event.maxParticipants !== undefined &&
    event.currentParticipants >= event.maxParticipants;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const registration: EventRegistration = {
      id: Date.now().toString(),
      eventId: event.id,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      numberOfGuests: formData.numberOfGuests,
      notes: formData.notes,
      paymentStatus: event.price && event.price > 0 ? 'pending' : 'free',
      createdAt: new Date().toISOString(),
    };

    registerForEvent(event.id, registration);
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="hero-gradient text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6"
          >
            <ArrowRight size={18} />
            חזרה לאירועים
          </Link>
          <div className="flex items-start gap-3 mb-2">
            <span className="badge bg-white/20 text-white">
              {categoryLabels[event.category]}
            </span>
            {event.price === 0 && (
              <span className="badge bg-green-400/20 text-green-200">כניסה חופשית</span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">{event.title}</h1>
          {event.hebrewDate && (
            <p className="text-accent text-lg">{event.hebrewDate}</p>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">פרטי האירוע</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">פרטים</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">תאריך</p>
                    <p className="font-medium">
                      {new Date(event.date).toLocaleDateString('he-IL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">שעה</p>
                    <p className="font-medium">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <MapPin size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">מיקום</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
                {event.maxParticipants && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Users size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">משתתפים</p>
                      <p className="font-medium">
                        {event.currentParticipants} / {event.maxParticipants}
                      </p>
                      {isFull && (
                        <p className="text-red-500 text-sm font-bold">האירוע מלא</p>
                      )}
                    </div>
                  </div>
                )}
                {event.price !== undefined && event.price > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <CreditCard size={20} className="text-accent-dark" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">עלות</p>
                      <p className="font-medium text-lg">&#8362;{event.price}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Registration Sidebar */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              {submitted ? (
                <div className="text-center py-4">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-700 mb-2">
                    נרשמת בהצלחה!
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    אישור נשלח לכתובת המייל שלך.
                    {event.price && event.price > 0 && ' התשלום יבוצע בהגעה.'}
                  </p>
                  <button
                    onClick={() => router.push('/events')}
                    className="text-primary hover:underline text-sm"
                  >
                    חזרה לאירועים
                  </button>
                </div>
              ) : !showForm ? (
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">הרשמה לאירוע</h3>
                  {event.price !== undefined && event.price > 0 && (
                    <p className="text-2xl font-black text-accent-dark mb-4">
                      &#8362;{event.price}
                    </p>
                  )}
                  {event.price === 0 && (
                    <p className="text-green-600 font-bold mb-4">כניסה חופשית</p>
                  )}
                  <button
                    onClick={() => setShowForm(true)}
                    disabled={isFull}
                    className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${
                      isFull
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-accent hover:bg-accent-light text-primary-dark'
                    }`}
                  >
                    {isFull ? 'האירוע מלא' : 'הרשמה עכשיו'}
                  </button>
                  {event.maxParticipants && !isFull && (
                    <p className="text-xs text-gray-400 mt-2">
                      נותרו {event.maxParticipants - event.currentParticipants} מקומות
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold mb-2">טופס הרשמה</h3>
                  <div>
                    <label className="form-label">שם מלא *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, fullName: e.target.value }))
                      }
                      className="form-input"
                      placeholder="ישראל ישראלי"
                    />
                  </div>
                  <div>
                    <label className="form-label">אימייל *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, email: e.target.value }))
                      }
                      className="form-input"
                      dir="ltr"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="form-label">טלפון *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="form-input"
                      dir="ltr"
                      placeholder="050-1234567"
                    />
                  </div>
                  <div>
                    <label className="form-label">מספר אורחים נוספים</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.numberOfGuests}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          numberOfGuests: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">הערות</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, notes: e.target.value }))
                      }
                      className="form-input"
                      rows={3}
                      placeholder="אלרגיות, בקשות מיוחדות..."
                    />
                  </div>
                  {event.price !== undefined && event.price > 0 && (
                    <div className="bg-warm-bg rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">סה&quot;כ לתשלום:</span>
                        <span className="text-xl font-black text-accent-dark">
                          &#8362;{event.price * (1 + formData.numberOfGuests)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        התשלום יבוצע בהגעה לאירוע
                      </p>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent-light text-primary-dark py-3 rounded-xl font-bold text-lg"
                  >
                    אישור הרשמה
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-full text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ביטול
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
