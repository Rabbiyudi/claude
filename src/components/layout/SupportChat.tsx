'use client';

import { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { clsx } from 'clsx';

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportChat({ isOpen, onClose }: SupportChatProps) {
  const { t, isRTL } = useTranslation();
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Chat panel */}
      <div
        className={clsx(
          'relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md',
          'h-[70vh] flex flex-col shadow-2xl',
          'animate-in slide-in-from-bottom duration-300'
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div
          className={clsx(
            'flex items-center justify-between p-4 border-b border-gray-100',
            isRTL ? 'flex-row-reverse' : ''
          )}
        >
          <div className={clsx('flex items-center gap-3', isRTL ? 'flex-row-reverse' : '')}>
            <div className="w-10 h-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
              <MessageCircle size={20} className="text-[#B8860B]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">{t('support')}</h2>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome message */}
          <div className={clsx('flex gap-3', isRTL ? 'flex-row-reverse' : '')}>
            <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
              <p className="text-sm text-gray-700">
                {isRTL
                  ? 'שלום! איך אוכל לעזור לך היום?'
                  : "Hi there! How can I help you today?"}
              </p>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-100">
          <div
            className={clsx(
              'flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2',
              isRTL ? 'flex-row-reverse' : ''
            )}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isRTL ? 'הקלד הודעה...' : 'Type a message...'}
              className={clsx(
                'flex-1 bg-transparent border-none outline-none text-sm',
                isRTL ? 'text-right' : 'text-left'
              )}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <button
              className={clsx(
                'w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center',
                'hover:bg-[#E6C200] transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              disabled={!message.trim()}
            >
              <Send size={14} className={clsx('text-gray-800', isRTL ? 'rotate-180' : '')} />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            {isRTL
              ? 'או שלח הודעה לוואטסאפ'
              : 'Or send a message via WhatsApp'}
          </p>
        </div>
      </div>
    </div>
  );
}
