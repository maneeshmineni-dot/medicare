import React from 'react';
import { Sidebar } from './Sidebar';
import { EmergencyBanner } from './EmergencyBanner';
import { CookieConsentBanner } from './CookieConsentBanner';
import { FloatingAssistantWidget } from './FloatingAssistantWidget';

export const AppLayout = ({ children }) => (
  <div className="app-shell">
    <Sidebar />
    <main className="page-content" style={{ display: 'flex', flexDirection: 'column' }}>
      <EmergencyBanner />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <FloatingAssistantWidget />
      <CookieConsentBanner />
    </main>
  </div>
);
