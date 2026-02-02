'use client';

import { FileText, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatRelativeTime } from '@/utils/dates';
import { Card } from '@/components/ui/Card';

export function LastReport() {
  const lastReport = useStore((state) => state.lastReport);
  const { t, language, isRTL } = useTranslation();

  if (!lastReport) return null;

  return (
    <Card hover className="bg-gray-50 border-gray-200">
      <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="w-10 h-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-[#B8860B]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className="text-sm font-semibold text-gray-700">{t('lastReport')}</h3>
            <div className={`flex items-center gap-1 text-xs text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock size={12} />
              <span>{formatRelativeTime(lastReport.createdAt, language)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{lastReport.content}</p>
        </div>
      </div>
    </Card>
  );
}
