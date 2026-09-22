import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { EmergencyBanner } from './EmergencyBanner';
import { CookieConsentBanner } from './CookieConsentBanner';
import { FloatingAssistantWidget } from './FloatingAssistantWidget';
import { FloatingVoiceAgentButton } from './voice/FloatingVoiceAgentButton';
import { FullScreenReminderModal } from './cognitive/FullScreenReminderModal';
import { reminderScheduler } from '../services/reminderScheduler';

export const AppLayout = ({ children }) => {
  useEffect(() => {
    reminderScheduler.startAutoCheck();
    return () => reminderScheduler.stopAutoCheck();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <EmergencyBanner />
        <div style={{ flex: 1 }}>
          {children}
        </div>
        <FloatingAssistantWidget />
        <FloatingVoiceAgentButton />
        <FullScreenReminderModal />
        <CookieConsentBanner />
      </main>
    </div>
  );
};
