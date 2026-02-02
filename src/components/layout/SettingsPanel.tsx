'use client';

import { X, Globe, Bell, MessageSquare, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { clsx } from 'clsx';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { t, language, setLanguage, isRTL } = useTranslation();
  const {
    whatsappEnabled,
    setWhatsappEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          'relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md',
          'max-h-[90vh] overflow-y-auto shadow-2xl',
          'animate-in slide-in-from-bottom duration-300'
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div
          className={clsx(
            'sticky top-0 flex items-center justify-between p-4 border-b border-gray-100 bg-white',
            isRTL ? 'flex-row-reverse' : ''
          )}
        >
          <h2 className="text-xl font-bold text-gray-800">{t('settings')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Settings content */}
        <div className="p-4 space-y-6">
          {/* Language */}
          <div className="space-y-3">
            <div className={clsx('flex items-center gap-2', isRTL ? 'flex-row-reverse' : '')}>
              <Globe size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-700">{t('language')}</h3>
            </div>
            <div className={clsx('flex gap-2', isRTL ? 'flex-row-reverse' : '')}>
              <button
                onClick={() => setLanguage('en')}
                className={clsx(
                  'flex-1 py-3 px-4 rounded-xl font-medium transition-all',
                  'flex items-center justify-center gap-2',
                  {
                    'bg-[#FFD700] text-gray-900 shadow-md': language === 'en',
                    'bg-gray-100 text-gray-600 hover:bg-gray-200': language !== 'en',
                  }
                )}
              >
                {language === 'en' && <Check size={16} />}
                {t('english')}
              </button>
              <button
                onClick={() => setLanguage('he')}
                className={clsx(
                  'flex-1 py-3 px-4 rounded-xl font-medium transition-all',
                  'flex items-center justify-center gap-2',
                  {
                    'bg-[#FFD700] text-gray-900 shadow-md': language === 'he',
                    'bg-gray-100 text-gray-600 hover:bg-gray-200': language !== 'he',
                  }
                )}
              >
                {language === 'he' && <Check size={16} />}
                {t('hebrew')}
              </button>
            </div>
          </div>

          {/* WhatsApp */}
          <div
            className={clsx(
              'flex items-center justify-between p-4 bg-gray-50 rounded-xl',
              isRTL ? 'flex-row-reverse' : ''
            )}
          >
            <div className={clsx('flex items-center gap-3', isRTL ? 'flex-row-reverse' : '')}>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <MessageSquare size={18} className="text-green-600" />
              </div>
              <span className="font-medium text-gray-700">{t('whatsappEnabled')}</span>
            </div>
            <button
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
              className={clsx(
                'w-12 h-7 rounded-full transition-colors relative',
                {
                  'bg-[#FFD700]': whatsappEnabled,
                  'bg-gray-300': !whatsappEnabled,
                }
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  {
                    'left-6': whatsappEnabled && !isRTL,
                    'left-1': !whatsappEnabled && !isRTL,
                    'right-6': whatsappEnabled && isRTL,
                    'right-1': !whatsappEnabled && isRTL,
                  }
                )}
              />
            </button>
          </div>

          {/* Notifications */}
          <div
            className={clsx(
              'flex items-center justify-between p-4 bg-gray-50 rounded-xl',
              isRTL ? 'flex-row-reverse' : ''
            )}
          >
            <div className={clsx('flex items-center gap-3', isRTL ? 'flex-row-reverse' : '')}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell size={18} className="text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">{t('notifications')}</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={clsx(
                'w-12 h-7 rounded-full transition-colors relative',
                {
                  'bg-[#FFD700]': notificationsEnabled,
                  'bg-gray-300': !notificationsEnabled,
                }
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  {
                    'left-6': notificationsEnabled && !isRTL,
                    'left-1': !notificationsEnabled && !isRTL,
                    'right-6': notificationsEnabled && isRTL,
                    'right-1': !notificationsEnabled && isRTL,
                  }
                )}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Rimon CRM v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
