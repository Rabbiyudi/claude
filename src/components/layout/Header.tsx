'use client';

import { Settings, Bell, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';

interface HeaderProps {
  onSettingsClick?: () => void;
  onSupportClick?: () => void;
}

export function Header({ onSettingsClick, onSupportClick }: HeaderProps) {
  const { t, isRTL } = useTranslation();

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100',
        'safe-top'
      )}
    >
      <div
        className={clsx(
          'flex items-center justify-between px-4 py-3',
          isRTL ? 'flex-row-reverse' : ''
        )}
      >
        {/* Logo */}
        <div className={clsx('flex items-center gap-2', isRTL ? 'flex-row-reverse' : '')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-xl text-gray-800">Rimon</span>
        </div>

        {/* Actions */}
        <div className={clsx('flex items-center gap-1', isRTL ? 'flex-row-reverse' : '')}>
          <Button variant="icon" size="sm" title="Notifications">
            <Bell size={20} className="text-gray-500" />
          </Button>
          <Button
            variant="icon"
            size="sm"
            onClick={onSupportClick}
            title={t('support')}
          >
            <MessageCircle size={20} className="text-gray-500" />
          </Button>
          <Button
            variant="icon"
            size="sm"
            onClick={onSettingsClick}
            title={t('settings')}
          >
            <Settings size={20} className="text-gray-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}
