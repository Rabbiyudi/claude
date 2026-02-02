'use client';

import { Bell, Calendar, UserPlus, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatRelativeTime } from '@/utils/dates';
import type { NewsItem } from '@/types';

const iconMap = {
  contact: UserPlus,
  task: CheckCircle,
  event: Calendar,
  general: Bell,
};

function NewsItemComponent({ item }: { item: NewsItem }) {
  const { language, isRTL } = useTranslation();
  const Icon = iconMap[item.type];

  return (
    <div
      className={`news-item flex items-center gap-3 py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors ${
        isRTL ? 'flex-row-reverse' : ''
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          item.type === 'event'
            ? 'bg-blue-100 text-blue-600'
            : item.type === 'contact'
            ? 'bg-green-100 text-green-600'
            : item.type === 'task'
            ? 'bg-purple-100 text-purple-600'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate">{item.message}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">
        {formatRelativeTime(item.timestamp, language)}
      </span>
    </div>
  );
}

export function NewsFeed() {
  const newsItems = useStore((state) => state.newsItems);
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className="text-lg">&#128240;</span>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {t('news')}
        </h2>
      </div>
      <div className="space-y-2">
        {newsItems.slice(0, 5).map((item) => (
          <NewsItemComponent key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
