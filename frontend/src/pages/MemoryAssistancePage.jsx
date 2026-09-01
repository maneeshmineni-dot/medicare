import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Sparkles, Heart, Activity, Trophy, Play, Plus, Clock, Users, Shield, Flower2, ArrowRight
} from 'lucide-react';
import { cognitiveStorage } from '../services/cognitiveStorage';
import { AddFamilyQuestionModal } from '../components/cognitive/AddFamilyQuestionModal';

export const MemoryAssistancePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(cognitiveStorage.getStats());
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);

  return (
    <div className="page-inner" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.12))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '28px',
        padding: '32px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--md-sys-color-primary-container)',
            color: 'var(--md-sys-color-on-primary-container)',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 800,
            marginBottom: '14px',
            textTransform: 'uppercase'
          }}>
            <Brain size={16} /> Smriti-Setu Cognitive Health Suite
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--md-sys-color-on-surface)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Elderly Memory & Cognitive Care
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6, margin: '0 0 20px' }}>
            Daily interactive memory recall, personalized family reminiscence trivia, and adaptive neural stimulation designed to support cognitive wellness and Alzheimer’s care.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={() => navigate('/cognitive-games?mode=match')}
              className="btn-primary"
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--r-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, var(--md-sys-color-primary), #6d28d9)',
                border: 'none',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)'
              }}
            >
              <Play size={18} /> Start Memory Match Game
            </button>
            <button
              onClick={() => navigate('/cognitive-games?mode=quiz')}
              className="btn-secondary"
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--r-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={18} color="var(--md-sys-color-primary)" /> Daily Orientation Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Cognitive Index</span>
            <div className="stat-icon" style={{ background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-primary)' }}>
              <Trophy size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.avgScore} <span style={{ fontSize: '1rem', fontWeight: 600 }}>/ 100</span></div>
          <div className="stat-trend trend-up">
            <Activity size={14} /> Based on {stats.totalSessions} sessions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Recall Latency</span>
            <div className="stat-icon" style={{ background: 'var(--md-sys-color-success-container)', color: 'var(--emerald)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.avgHesitationMs} <span style={{ fontSize: '1rem', fontWeight: 600 }}>ms</span></div>
          <div className="stat-trend trend-up">
            Healthy response cadence
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Caregiver Telemetry</span>
            <div className="stat-icon" style={{ background: 'var(--md-sys-color-tertiary-container)', color: 'var(--md-sys-color-tertiary)' }}>
              <Heart size={18} />
            </div>
          </div>
          <div className="stat-value">Active</div>
          <div
            onClick={() => navigate('/caregiver')}
            style={{ fontSize: '0.82rem', color: 'var(--md-sys-color-primary)', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}
          >
            View Dashboard →
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Photo Match Card */}
        <div
          onClick={() => navigate('/cognitive-games?mode=match')}
          className="card"
          style={{
            padding: '24px',
            borderRadius: '24px',
            cursor: 'pointer',
            border: '1px solid var(--border)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '16px'
          }}>
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>Reminiscence Memory Match</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: '0 0 16px' }}>
            Tactile tile matching game with familiar cultural symbols, flowers, and objects designed to stimulate memory.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8b5cf6', fontWeight: 800, fontSize: '0.9rem' }}>
            Play Exercise <ArrowRight size={16} />
          </div>
        </div>

        {/* Family Memory Vault Card */}
        <div
          onClick={() => setIsFamilyModalOpen(true)}
          className="card"
          style={{
            padding: '24px',
            borderRadius: '24px',
            cursor: 'pointer',
            border: '1px solid var(--border)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '16px'
          }}>
            <Heart size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>Family Memory Vault</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: '0 0 16px' }}>
            Upload personal family trivia, children’s names, and childhood memories to customize orientation quizzes.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ec4899', fontWeight: 800, fontSize: '0.9rem' }}>
            Add Family Trivia <Plus size={16} />
          </div>
        </div>

        {/* Voice Therapy Room Card */}
        <div
          onClick={() => navigate('/voice-therapy')}
          className="card"
          style={{
            padding: '24px',
            borderRadius: '24px',
            cursor: 'pointer',
            border: '1px solid var(--border)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '16px'
          }}>
            <Flower2 size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>Voice Therapy Room</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: '0 0 16px' }}>
            Multilingual therapeutic guidance across 8 Indian regional languages with soothing 432Hz ambient frequencies.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 800, fontSize: '0.9rem' }}>
            Enter Room <ArrowRight size={16} />
          </div>
        </div>
      </div>

      <AddFamilyQuestionModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        onQuestionAdded={() => setStats(cognitiveStorage.getStats())}
      />
    </div>
  );
};
