'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { clsx } from 'clsx';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const { t } = useTranslation();
  const { isRecording, setIsRecording, isProcessing, setIsProcessing } = useStore();
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        if (onRecordingComplete) {
          setIsProcessing(true);
          await onRecordingComplete(audioBlob);
          setIsProcessing(false);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  }, [onRecordingComplete, setIsRecording, setIsProcessing]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
  }, [setIsRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (isProcessing) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={clsx(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
          'focus:outline-none focus:ring-4 focus:ring-[#FFD700]/30',
          {
            'bg-[#FFD700] hover:bg-[#E6C200] shadow-lg hover:shadow-xl active:scale-95':
              !isRecording && !isProcessing,
            'bg-red-500 recording-pulse': isRecording,
            'bg-gray-200 cursor-not-allowed': isProcessing,
          }
        )}
        aria-label={isRecording ? t('tapToStop') : t('record')}
      >
        {isProcessing ? (
          <Loader2 className="w-7 h-7 text-gray-500 animate-spin" />
        ) : isRecording ? (
          <Square className="w-6 h-6 text-white fill-white" />
        ) : (
          <Mic className="w-7 h-7 text-gray-800" />
        )}
      </button>

      {isRecording && (
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-gray-600">{t('recording')}</span>
          <span className="font-mono text-gray-500">{formatTime(recordingTime)}</span>
        </div>
      )}

      {isProcessing && (
        <span className="text-sm text-gray-500">{t('processing')}</span>
      )}

      {!isRecording && !isProcessing && (
        <span className="text-xs text-gray-400">{t('tapToStop').replace('Tap to stop', t('record'))}</span>
      )}
    </div>
  );
}
