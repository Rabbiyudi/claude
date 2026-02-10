'use client';

import Link from 'next/link';
import {
  Calendar,
  BookOpen,
  Users,
  Heart,
  Clock,
  MapPin,
  ArrowLeft,
  Star,
  Flame,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const categoryLabels: Record<string, string> = {
  shabbat: 'שבת',
  holiday: 'חגים',
  class: 'שיעורים',
  kids: 'ילדים',
  community: 'קהילה',
  other: 'אחר',
};

const categoryColors: Record<string, string> = {
  shabbat: 'bg-purple-100 text-purple-700',
  holiday: 'bg-red-100 text-red-700',
  class: 'bg-blue-100 text-blue-700',
  kids: 'bg-green-100 text-green-700',
  community: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function HomePage() {
  const settings = useStore((s) => s.settings);
  const events = useStore((s) => s.events);
  const shabbatTimes = useStore((s) => s.shabbatTimes);

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(197,165,90,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(197,165,90,0.2) 0%, transparent 50%)',
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Star size={16} className="text-accent" />
              <span className="text-sm text-gray-200">ברוכים הבאים</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              {settings.chabadNameHe}
              <br />
              <span className="gold-shimmer text-3xl md:text-5xl">הבית שלכם</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              מקום של חום, תורה וקהילה. הצטרפו אלינו לאירועים, שיעורים וחוויות יהודיות מעשירות
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/events"
                className="bg-accent hover:bg-accent-light text-primary-dark px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              >
                לאירועים הקרובים
              </Link>
              <Link
                href="/donate"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-bold border border-white/20"
              >
                תרומה לבית חב&quot;ד
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shabbat Times Banner */}
      <section className="bg-warm-bg border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <Flame size={24} className="text-accent-dark" />
              </div>
              <div>
                <h3 className="font-bold text-lg">זמני שבת - פרשת {shabbatTimes.parashat}</h3>
                <p className="text-gray-500 text-sm">{shabbatTimes.city}</p>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-500">הדלקת נרות</p>
                <p className="text-2xl font-bold text-primary">{shabbatTimes.candleLighting}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">צאת שבת</p>
                <p className="text-2xl font-bold text-primary">{shabbatTimes.havdalah}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Quick Links */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Calendar, label: 'אירועים', href: '/events', color: 'bg-blue-50 text-blue-600' },
              { icon: BookOpen, label: 'שיעורי תורה', href: '/events?category=class', color: 'bg-purple-50 text-purple-600' },
              { icon: Users, label: 'ארוחות שבת', href: '/events?category=shabbat', color: 'bg-orange-50 text-orange-600' },
              { icon: Heart, label: 'תרומה', href: '/donate', color: 'bg-red-50 text-red-600' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="card-hover bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm"
              >
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <item.icon size={28} />
                </div>
                <h3 className="font-bold text-gray-800">{item.label}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900">אירועים קרובים</h2>
            <Link
              href="/events"
              className="flex items-center gap-2 text-primary hover:text-primary-light font-medium"
            >
              לכל האירועים
              <ArrowLeft size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="h-48 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center relative">
                  <Calendar size={48} className="text-white/30" />
                  <div className="absolute top-4 right-4">
                    <span className={`badge ${categoryColors[event.category]}`}>
                      {categoryLabels[event.category]}
                    </span>
                  </div>
                  {event.price === 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="badge bg-green-100 text-green-700">חינם</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{event.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} className="text-accent shrink-0" />
                      <span>
                        {new Date(event.date).toLocaleDateString('he-IL', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}{' '}
                        | {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-accent shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    {event.maxParticipants && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={14} className="text-accent shrink-0" />
                        <span>{event.currentParticipants}/{event.maxParticipants} משתתפים</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-6">אודות {settings.chabadNameHe}</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {settings.aboutText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-full font-bold"
              >
                צרו איתנו קשר
              </Link>
              <Link
                href="/gallery"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full font-bold"
              >
                גלריית תמונות
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-primary-dark mb-4">
            רוצים להיות חלק מהקהילה?
          </h2>
          <p className="text-primary-dark/70 text-lg mb-8">
            הצטרפו אלינו לאירוע הבא ותחוו את החום והאהבה של בית חב&quot;ד
          </p>
          <Link
            href="/events"
            className="inline-block bg-primary-dark hover:bg-primary text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all"
          >
            הרשמה לאירוע
          </Link>
        </div>
      </section>
    </div>
  );
}
