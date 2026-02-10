'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, Search, Filter } from 'lucide-react';
import { useStore } from '@/store/useStore';

const categoryLabels: Record<string, string> = {
  all: 'הכל',
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

export default function EventsPage() {
  const events = useStore((s) => s.events);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        const matchesSearch =
          e.title.includes(search) ||
          e.description.includes(search) ||
          e.location.includes(search);
        const matchesCategory =
          selectedCategory === 'all' || e.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, search, selectedCategory]);

  const upcomingEvents = filteredEvents.filter(
    (e) => new Date(e.date) >= new Date()
  );
  const pastEvents = filteredEvents.filter(
    (e) => new Date(e.date) < new Date()
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">אירועים</h1>
          <p className="text-gray-300 text-lg">הצטרפו אלינו לאירועים הקרובים</p>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="חיפוש אירועים..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pr-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={18} className="text-gray-400" />
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {upcomingEvents.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              אירועים קרובים ({upcomingEvents.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                >
                  <div className="h-44 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center relative">
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
                    {event.price !== undefined && event.price > 0 && (
                      <div className="absolute top-4 left-4">
                        <span className="badge bg-accent text-primary-dark">
                          &#8362;{event.price}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      {event.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
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
                          <span>
                            {event.currentParticipants}/{event.maxParticipants} משתתפים
                          </span>
                          {event.currentParticipants >= event.maxParticipants && (
                            <span className="text-red-500 font-bold mr-2">מלא!</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-primary font-bold text-sm">
                        לפרטים והרשמה &larr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {pastEvents.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-400 mb-6">
              אירועים שעברו ({pastEvents.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                >
                  <div className="h-32 bg-gray-200 flex items-center justify-center">
                    <Calendar size={32} className="text-gray-400" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-600 mb-1">{event.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(event.date).toLocaleDateString('he-IL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <Calendar size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400">לא נמצאו אירועים</h3>
            <p className="text-gray-400 mt-2">נסו לשנות את מילות החיפוש או הקטגוריה</p>
          </div>
        )}
      </div>
    </div>
  );
}
