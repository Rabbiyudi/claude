'use client';

import { useState, useRef, useCallback } from 'react';
import { Send, Image, Paperclip, Search, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { VoiceRecorder } from './VoiceRecorder';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';

export function ChatInput() {
  const { t, isRTL } = useTranslation();
  const { addNewsItem, addReport, setIsProcessing } = useStore();
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() && !attachedFile) return;

    setIsProcessing(true);

    // Create a report for the submission
    const report = {
      id: Date.now().toString(),
      content: message,
      createdAt: new Date(),
      type: attachedFile ? 'image' as const : 'text' as const,
      processed: true,
      extractedData: {},
    };

    addReport(report);

    // Add news item
    addNewsItem({
      id: Date.now().toString(),
      message: `New message: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`,
      type: 'general',
      timestamp: new Date(),
    });

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMessage('');
    setAttachedFile(null);
    setIsExpanded(false);
    setIsProcessing(false);
  }, [message, attachedFile, addReport, addNewsItem, setIsProcessing]);

  const handleVoiceRecording = useCallback(
    async (audioBlob: Blob) => {
      // In a real app, this would send to Whisper API for transcription
      // and then process with GPT

      const report = {
        id: Date.now().toString(),
        content: 'Voice recording processed',
        createdAt: new Date(),
        type: 'voice' as const,
        processed: true,
        extractedData: {},
      };

      addReport(report);

      addNewsItem({
        id: Date.now().toString(),
        message: 'Voice message processed successfully',
        type: 'general',
        timestamp: new Date(),
      });
    },
    [addReport, addNewsItem]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      setIsExpanded(true);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-4">
      <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <span className="text-lg">&#128173;</span>
        <h2 className="text-sm font-semibold text-gray-500">{t('whatsOnYourMind')}</h2>
      </div>

      {/* Attached file preview */}
      {attachedFile && (
        <div
          className={`mb-3 p-2 bg-gray-50 rounded-lg flex items-center gap-2 ${
            isRTL ? 'flex-row-reverse' : ''
          }`}
        >
          {attachedFile.type.startsWith('image/') ? (
            <Image size={16} className="text-blue-500" />
          ) : (
            <Paperclip size={16} className="text-gray-500" />
          )}
          <span className="text-sm text-gray-600 flex-1 truncate">{attachedFile.name}</span>
          <button onClick={removeAttachment} className="p-1 hover:bg-gray-200 rounded">
            <X size={14} className="text-gray-400" />
          </button>
        </div>
      )}

      {/* Text input */}
      <div className={`flex items-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setIsExpanded(e.target.value.length > 0);
            }}
            placeholder={t('typeMessage')}
            className={clsx(
              'w-full resize-none rounded-xl border border-gray-200 px-4 py-3',
              'text-gray-800 placeholder-gray-400',
              'focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20',
              'transition-all duration-200',
              isRTL ? 'text-right' : 'text-left'
            )}
            rows={isExpanded ? 3 : 1}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
      </div>

      {/* Action buttons */}
      <div
        className={`flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 ${
          isRTL ? 'flex-row-reverse' : ''
        }`}
      >
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'image')}
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'file')}
        />

        <Button
          variant="icon"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          title={t('attachImage')}
        >
          <Image size={18} className="text-gray-500" />
        </Button>

        <Button
          variant="icon"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          title={t('attachFile')}
        >
          <Paperclip size={18} className="text-gray-500" />
        </Button>

        <Button variant="icon" size="sm" title={t('search')}>
          <Search size={18} className="text-gray-500" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!message.trim() && !attachedFile}
          className={clsx(
            'flex items-center gap-2',
            isRTL ? 'flex-row-reverse' : ''
          )}
        >
          <span>{t('send')}</span>
          <Send size={16} className={isRTL ? 'rotate-180' : ''} />
        </Button>
      </div>
    </div>
  );
}
