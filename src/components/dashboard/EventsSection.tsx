'use client';

import { Calendar, MapPin, Users } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatEventDate, formatTime } from '@/utils/dates';
import { Card } from '@/components/ui/Card';
import type { Event } from '@/types';

function EventCard({ event }: { event: Event }) {
  const { t, language, isRTL } = useTranslation();

  return (
    <Card hover className="min-w-[260px] snap-start">
      <div className={`flex flex-col gap-2 ${isRTL ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 text-[#FFD700] ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Calendar size={14} />
          <span className="text-xs font-medium">
            {formatEventDate(event.date, language)}
          </span>
          {event.hebrewDate && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500">{event.hebrewDate}</span>
            </>
          )}
        </div>

        <h3 className="font-semibold text-gray-900">{event.title}</h3>

        {event.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Users size={12} />
            <span>
              {event.participants.length} {t('participants')}
            </span>
          </div>
          {event.location && (
            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <MapPin size={12} />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400 mt-1">
          {formatTime(event.date)}
        </div>
      </div>
    </Card>
  );
}

export function EventsSection() {
  const events = useStore((state) => state.events);
  const { t, isRTL } = useTranslation();

  // Sort events by date and filter upcoming
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 px-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <span className="text-lg">&#128652;</span>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {t('onTheWay')}
        </h2>
      </div>

      <div
        className={`flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide ${
          isRTL ? 'flex-row-reverse' : ''
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <Card className="w-full text-center py-8 text-gray-400">
            <Calendar className="mx-auto mb-2" size={24} />
            <p>No upcoming events</p>
          </Card>
        )}
      </div>
    </div>
  );
}
