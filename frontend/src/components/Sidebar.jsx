import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import {
  LayoutDashboard, Camera, History, User, LogOut, Pill, FileText, Package,
  Bot, Brain, Flower2, Users, Stethoscope, Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const NAV_SECTIONS = [
    {
      title: t('sectionClinical') || 'Clinical & Diagnostics',
      items: [
        { to: '/dashboard',       icon: LayoutDashboard, label: t('home') },
        { to: '/scanner',         icon: Camera,          label: t('scanner') },
        { to: '/report-analyzer', icon: FileText,        label: t('reportsRx') },
        { to: '/cabinet',         icon: Package,         label: t('cabinet') }
      ]
    },
    {
      title: t('sectionCognitive') || 'Cognitive & Vitality',
      items: [
        { to: '/memory-assistance', icon: Brain,   label: t('memoryCare') || 'Memory Care' },
        { to: '/voice-therapy',     icon: Flower2, label: t('voiceTherapy') || 'Voice Room' },
        { to: '/caregiver',         icon: Users,   label: t('caregiver') || 'Caregiver Hub' }
      ]
    },
    {
      title: t('sectionSupport') || 'AI Guidance & Records',
      items: [
        { to: '/assistant', icon: Bot,     label: t('assistant') || 'AI Assistant', badge: 'AI' },
        { to: '/history',   icon: History, label: t('history') || 'History' },
        { to: '/profile',   icon: User,    label: t('profile') || 'Profile' }
      ]
    }
  ];

  const MOBILE_NAV_ITEMS = [
    { to: '/dashboard',         icon: LayoutDashboard, label: t('home') },
    { to: '/scanner',           icon: Camera,          label: t('scanner') },
    { to: '/cabinet',           icon: Package,         label: t('cabinet') },
    { to: '/memory-assistance', icon: Brain,           label: t('memoryCare') || 'Memory' },
    { to: '/assistant',         icon: Bot,             label: t('assistant') || 'AI' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'PV';

  return (
    <>
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="sidebar desktop-sidebar">
        {/* Brand */}
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo">
            <Pill size={20} strokeWidth={2.2} color="#fff" />
          </div>
          <div className="sidebar-brand-text">
            <h2>{t('appName')}</h2>
            <p>{t('tagline')}</p>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="nav-section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{section.title}</span>
              </div>
              {section.items.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <span className="nav-icon"><Icon size={18} strokeWidth={2} /></span>
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '999px',
                      background: 'var(--md-sys-color-primary-container)',
                      color: 'var(--md-sys-color-on-primary-container)'
                    }}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer — user + language selector + theme switch + logout */}
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {user && (
            <div className="sidebar-user">
              <div className="user-avatar">{initials}</div>
              <div className="user-info-text">
                <h4>{user.name || 'User'}</h4>
                <p>{user.email || ''}</p>
              </div>
            </div>
          )}
          
          {/* Language Selector + Theme Switcher inline row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <LanguageSelector />
            </div>
            <ThemeToggle />
          </div>

          {user && (
            <button
              onClick={handleLogout}
              className="btn-ghost"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                color: 'var(--md-sys-color-error)',
                padding: '8px 12px',
                borderRadius: 'var(--r-md)',
                fontSize: '0.85rem',
                gap: '8px'
              }}
            >
              <LogOut size={16} strokeWidth={2} />
              <span>{t('logout')}</span>
            </button>
          )}
        </div>
      </aside>

      {/* MOBILE TOPBAR */}
      <header className="mobile-topbar">
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
          <div className="sidebar-logo">
            <Pill size={16} strokeWidth={2.2} color="#fff" />
          </div>
          <div className="sidebar-brand-text">
            <h2>{t('appName')}</h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LanguageSelector compact />
          <ThemeToggle />
          {user && (
            <div
              onClick={() => navigate('/profile')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                border: '1px solid var(--border)',
                flexShrink: 0
              }}
            >
              {initials}
            </div>
          )}
        </div>
      </header>

      {/* MOBILE BOTTOM FLOATING NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        {MOBILE_NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
