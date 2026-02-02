'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Header } from '@/components/layout/Header';
import { BottomBar } from '@/components/layout/BottomBar';
import { SettingsPanel } from '@/components/layout/SettingsPanel';
import { SupportChat } from '@/components/layout/SupportChat';
import { Greeting } from '@/components/dashboard/Greeting';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { EventsSection } from '@/components/dashboard/EventsSection';
import { ChatInput } from '@/components/dashboard/ChatInput';
import { LastReport } from '@/components/dashboard/LastReport';

export default function HomePage() {
  const { dir } = useTranslation();
  const [activeTab, setActiveTab] = useState('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <Header
        onSettingsClick={() => setIsSettingsOpen(true)}
        onSupportClick={() => setIsSupportOpen(true)}
      />

      <main className="pb-24 px-4">
        <div className="max-w-2xl mx-auto space-y-6 pt-4">
          {/* Greeting Section */}
          <section>
            <Greeting />
          </section>

          {/* News Feed */}
          <section>
            <NewsFeed />
          </section>

          {/* Events Section */}
          <section>
            <EventsSection />
          </section>

          {/* Chat Input - Main Interaction Area */}
          <section>
            <ChatInput />
          </section>

          {/* Last Report */}
          <section>
            <LastReport />
          </section>
        </div>
      </main>

      <BottomBar activeTab={activeTab} onTabChange={setActiveTab} />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <SupportChat
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}
