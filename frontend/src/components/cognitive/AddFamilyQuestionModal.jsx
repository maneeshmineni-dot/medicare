import React, { useState } from 'react';
import { X, Plus, Image, HelpCircle, Heart, Check } from 'lucide-react';
import { familyQuestionsStorage } from '../../services/familyQuestionsStorage';

export const AddFamilyQuestionModal = ({ isOpen, onClose, onQuestionAdded }) => {
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [relationTag, setRelationTag] = useState('family');
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || !correctAnswer.trim()) {
      setError('Please provide a question and the correct answer.');
      return;
    }

    const options = [
      correctAnswer.trim(),
      opt2.trim() || 'Option B',
      opt3.trim() || 'Option C',
      opt4.trim() || 'Option D'
    ];

    const newQ = familyQuestionsStorage.addQuestion({
      question: question.trim(),
      correctAnswer: correctAnswer.trim(),
      options,
      relationTag,
      hint: hint.trim()
    });

    if (onQuestionAdded) onQuestionAdded(newQ);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'var(--md-sys-color-surface-container)',
        borderRadius: 'var(--r-2xl, 24px)',
        border: '1px solid var(--border)',
        padding: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Heart size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Add Family Memory Trivia</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                Personalize cognitive quizzes with fond memories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface)' }}
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--rose)', padding: '10px 14px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
              Memory / Question:
            </label>
            <input
              type="text"
              className="search-input"
              style={{ width: '100%', marginTop: '6px', padding: '10px 14px' }}
              placeholder="e.g. What is the name of your first family pet?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>
              ✓ Correct Answer (The Truth):
            </label>
            <input
              type="text"
              className="search-input"
              style={{ width: '100%', marginTop: '6px', padding: '10px 14px', borderColor: '#10b981' }}
              placeholder="e.g. Bruno (Golden Retriever)"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)' }}>Alternative Option 2:</label>
              <input
                type="text"
                className="search-input"
                style={{ width: '100%', marginTop: '4px', padding: '8px 12px' }}
                placeholder="e.g. Tommy"
                value={opt2}
                onChange={(e) => setOpt2(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)' }}>Alternative Option 3:</label>
              <input
                type="text"
                className="search-input"
                style={{ width: '100%', marginTop: '4px', padding: '8px 12px' }}
                placeholder="e.g. Leo"
                value={opt3}
                onChange={(e) => setOpt3(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
              Memory Category:
            </label>
            <select
              value={relationTag}
              onChange={(e) => setRelationTag(e.target.value)}
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--md-sys-color-surface)',
                color: 'var(--md-sys-color-on-surface)',
                fontSize: '0.85rem'
              }}
            >
              <option value="family">Family & Children</option>
              <option value="childhood">Childhood & Hometown</option>
              <option value="tradition">Festivals & Traditions</option>
              <option value="pets">Beloved Pets</option>
              <option value="career">Career & Hobbies</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
              Gentle Hint (Optional):
            </label>
            <input
              type="text"
              className="search-input"
              style={{ width: '100%', marginTop: '6px', padding: '10px 14px' }}
              placeholder="e.g. He used to greet you at the gate every evening."
              value={hint}
              onChange={(e) => setHint(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1, padding: '12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #ec4899, #f43f5e)', border: 'none' }}
            >
              Save Memory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
