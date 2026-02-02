'use client';

import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';

export function Greeting() {
  const user = useStore((state) => state.user);
  const { t, isRTL } = useTranslation();

  if (!user) return null;

  return (
    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('greeting')}, {user.name}
        </h1>
        {user.organization && (
          <p className="text-gray-500 text-sm mt-0.5">{user.organization}</p>
        )}
      </div>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center text-white font-bold text-lg shadow-md">
        {user.name.charAt(0).toUpperCase()}
      </div>
    </div>
  );
}
