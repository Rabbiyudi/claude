'use client';

import { Home, Users, CheckSquare, Calendar } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { clsx } from 'clsx';

interface NavItem {
  id: string;
  icon: React.ElementType;
  labelKey: 'home' | 'contacts' | 'tasks' | 'calendar';
  href: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, labelKey: 'home', href: '/' },
  { id: 'contacts', icon: Users, labelKey: 'contacts', href: '/contacts' },
  { id: 'tasks', icon: CheckSquare, labelKey: 'tasks', href: '/tasks' },
  { id: 'calendar', icon: Calendar, labelKey: 'calendar', href: '/calendar' },
];

interface BottomBarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function BottomBar({ activeTab = 'home', onTabChange }: BottomBarProps) {
  const { t, isRTL } = useTranslation();

  return (
    <nav
      className={clsx(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100',
        'safe-bottom shadow-lg'
      )}
    >
      <div
        className={clsx(
          'flex items-center justify-around px-4 py-2',
          isRTL ? 'flex-row-reverse' : ''
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={clsx(
                'flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all',
                {
                  'text-[#B8860B] bg-[#FFD700]/10': isActive,
                  'text-gray-400 hover:text-gray-600 hover:bg-gray-50': !isActive,
                }
              )}
            >
              <Icon
                size={22}
                className={isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}
              />
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
