import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, Volume2, CheckCircle2, XCircle, RotateCcw, Trophy, Heart, HelpCircle } from 'lucide-react';
import { familyQuestionsStorage } from '../../services/familyQuestionsStorage';
import { cognitiveStorage } from '../../services/cognitiveStorage';
import { speakText, playGentleTone } from '../../utils/speechUtils';

const BASE_QUESTIONS = [
  {
    id: 'base_1',
    question: 'Which day of the week is it today?',
    getDynamic: () => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      const wrong = days.filter(d => d !== today).slice(0, 3);
      return {
        question: 'Which day of the week is it today?',
        correctAnswer: today,
        options: [today, ...wrong].sort(() => Math.random() - 0.5),
        hint: 'Think about yesterday and tomorrow.'
      };
    }
  },
  {
    id: 'base_2',
    question: 'Which year are we currently in?',
    getDynamic: () => {
      const year = new Date().getFullYear();
      return {
        question: 'Which year are we currently in?',
        correctAnswer: `${year}`,
        options: [`${year}`, `${year - 1}`, `${year + 1}`, `${year - 5}`].sort(() => Math.random() - 0.5),
        hint: 'It is the present decade.'
      };
    }
  },
  {
    id: 'base_3',
    question: 'How many hours are there in a full day?',
    correctAnswer: '24 Hours',
    options: ['24 Hours', '12 Hours', '36 Hours', '48 Hours'],
    hint: 'Day and night combined.'
  }
];

export const CognitiveQAGame = ({ onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [firstTapTime, setFirstTapTime] = useState(null);
  const [hesitations, setHesitations] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const initGame = () => {
    const familyQ = familyQuestionsStorage.getQuestions();
    const dynamicBase = BASE_QUESTIONS.map(q => q.getDynamic ? q.getDynamic() : q);
    const combined = [...familyQ, ...dynamicBase].sort(() => Math.random() - 0.5);

    setQuestions(combined.slice(0, 5));
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setCorrectCount(0);
    setHesitations([]);
    setStartTime(Date.now());
    setFirstTapTime(null);
    setIsCompleted(false);

    if (combined[0]) {
      speakText(combined[0].question);
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleOptionSelect = (option) => {
    if (isAnswered) return;

    const now = Date.now();
    if (!firstTapTime) setFirstTapTime(now);
    if (startTime) setHesitations(prev => [...prev, now - startTime]);

    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      playGentleTone(659, 1.2);
      setScore(s => s + 20);
      setCorrectCount(c => c + 1);
      speakText('Correct! Wonderful answer.');
    } else {
      playGentleTone(330, 0.8);
      speakText(`That was close. The answer is ${currentQ.correctAnswer}.`);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswered(false);
      setStartTime(Date.now());
      speakText(questions[nextIdx].question);
    } else {
      // Completed all questions
      const endTime = Date.now();
      const completionTimeMs = endTime - (startTime || endTime);
      const avgHesitation = hesitations.length > 0
        ? Math.round(hesitations.reduce((a, b) => a + b, 0) / hesitations.length)
        : 1400;

      const finalScore = Math.round((correctCount / questions.length) * 100);

      const sessionRecord = {
        gameType: 'cognitive_qa',
        difficultyLevel: 2,
        gridSize: '1x4',
        completionTimeMs,
        reactionTimeMs: 1200,
        hesitationScore: avgHesitation,
        errorRate: (questions.length - correctCount) / questions.length,
        score: finalScore
      };

      cognitiveStorage.saveSession(sessionRecord);
      setIsCompleted(true);
      playGentleTone(880, 2.0);
    }
  };

  if (questions.length === 0) return null;
  const currentQ = questions[currentIndex];

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--r-full)' }}
        >
          <ArrowLeft size={18} /> Back to Hub
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--md-sys-color-primary)' }}>
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {isCompleted ? (
        <div className="card" style={{ padding: '36px', textAlign: 'center', borderRadius: '24px', border: '2px solid #8b5cf6' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Trophy size={32} />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '0 0 8px' }}>Quiz Completed!</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--md-sys-color-on-surface-variant)', margin: '0 0 24px' }}>
            You answered {correctCount} out of {questions.length} questions correctly.
          </p>

          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#8b5cf6', marginBottom: '24px' }}>
            {Math.round((correctCount / questions.length) * 100)}%
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={initGame}
              className="btn-primary"
              style={{ padding: '12px 24px', borderRadius: 'var(--r-full)' }}
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="btn-secondary"
              style={{ padding: '12px 24px', borderRadius: 'var(--r-full)' }}
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '28px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0, lineHeight: 1.4 }}>
              {currentQ.question}
            </h2>
            <button
              onClick={() => speakText(currentQ.question)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--md-sys-color-primary-container)',
                border: 'none',
                color: 'var(--md-sys-color-on-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Volume2 size={18} />
            </button>
          </div>

          {currentQ.hint && (
            <div style={{
              background: 'var(--md-sys-color-surface-container)',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <HelpCircle size={16} color="#8b5cf6" />
              <span>Hint: {currentQ.hint}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQ.correctAnswer;

              let btnBg = 'var(--md-sys-color-surface)';
              let border = '1px solid var(--border)';
              let textColor = 'var(--md-sys-color-on-surface)';

              if (isAnswered) {
                if (isCorrect) {
                  btnBg = 'rgba(16, 185, 129, 0.15)';
                  border = '2px solid #10b981';
                  textColor = 'var(--emerald)';
                } else if (isSelected && !isCorrect) {
                  btnBg = 'rgba(239, 68, 68, 0.15)';
                  border = '2px solid #ef4444';
                  textColor = 'var(--rose)';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border,
                    background: btnBg,
                    color: textColor,
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: isAnswered ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 size={20} color="#10b981" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={20} color="#ef4444" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <button
              onClick={handleNext}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: 'var(--r-full)', fontSize: '1rem', fontWeight: 800 }}
            >
              {currentIndex + 1 < questions.length ? 'Next Question →' : 'See Results 🏆'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
