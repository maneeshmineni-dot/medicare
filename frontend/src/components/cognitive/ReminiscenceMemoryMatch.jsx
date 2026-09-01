import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Trophy, Timer, Award, ArrowLeft, Volume2, ShieldCheck } from 'lucide-react';
import { ddaEngine, DIFFICULTY_TIERS } from '../../services/ddaEngine';
import { cognitiveStorage } from '../../services/cognitiveStorage';
import { playGentleTone, speakText } from '../../utils/speechUtils';

const MEMORY_ICONS = [
  { id: 'temple', emoji: '🛕', name: 'Temple' },
  { id: 'flower', emoji: '🌺', name: 'Hibiscus Flower' },
  { id: 'mango',  emoji: '🥭', name: 'Sweet Mango' },
  { id: 'peacock', emoji: '🦚', name: 'Peacock' },
  { id: 'tea',    emoji: '☕', name: 'Morning Chai' },
  { id: 'lamp',   emoji: '🪔', name: 'Diya Lamp' },
  { id: 'tree',   emoji: '🌳', name: 'Banyan Tree' },
  { id: 'cow',    emoji: '🐄', name: 'Gentle Cow' }
];

export const ReminiscenceMemoryMatch = ({ onBack }) => {
  const [tier, setTier] = useState(ddaEngine.getCurrentTier());
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [firstTapTime, setFirstTapTime] = useState(null);
  const [lastTapTime, setLastTapTime] = useState(null);
  const [hesitations, setHesitations] = useState([]);
  const [moves, setMoves] = useState(0);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const initGame = (customTier = tier) => {
    const selectedPairs = MEMORY_ICONS.slice(0, customTier.pairsCount);
    const deck = [...selectedPairs, ...selectedPairs]
      .map((item, index) => ({
        uniqueId: `${item.id}_${index}`,
        pairId: item.id,
        emoji: item.emoji,
        name: item.name
      }))
      .sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setWrongTaps(0);
    setHesitations([]);
    setStartTime(Date.now());
    setFirstTapTime(null);
    setLastTapTime(null);
    setIsCompleted(false);
    setGameResult(null);

    playGentleTone(432, 1.0);
  };

  useEffect(() => {
    initGame(tier);
  }, [tier.level]);

  const handleCardClick = (index) => {
    if (flippedIndices.includes(index) || matchedPairs.includes(cards[index].pairId) || flippedIndices.length >= 2) {
      return;
    }

    const now = Date.now();
    if (!firstTapTime) setFirstTapTime(now);
    if (lastTapTime) {
      setHesitations(prev => [...prev, now - lastTapTime]);
    }
    setLastTapTime(now);

    playGentleTone(520, 0.4);
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        playGentleTone(659, 1.2);
        const newMatched = [...matchedPairs, firstCard.pairId];
        setMatchedPairs(newMatched);
        setFlippedIndices([]);

        if (newMatched.length === tier.pairsCount) {
          // Game Completed
          handleGameComplete(newMatched.length);
        }
      } else {
        // Mismatch
        setWrongTaps(w => w + 1);
        setTimeout(() => {
          setFlippedIndices([]);
        }, tier.flipBackDelayMs);
      }
    }
  };

  const handleGameComplete = (totalPairs) => {
    const endTime = Date.now();
    const completionTimeMs = endTime - (startTime || endTime);
    const reactionTimeMs = (firstTapTime || endTime) - (startTime || endTime);
    const totalTaps = (moves + 1) * 2;
    const accuracy = totalTaps > 0 ? (totalPairs * 2) / totalTaps : 1;
    const avgHesitation = hesitations.length > 0
      ? Math.round(hesitations.reduce((a, b) => a + b, 0) / hesitations.length)
      : 1200;

    const baseScore = Math.max(50, Math.round(100 - (wrongTaps * 5) - (completionTimeMs / 1000)));
    const finalScore = Math.min(100, Math.round(baseScore * tier.scoreMultiplier));

    const result = {
      gameType: 'reminiscence_match',
      difficultyLevel: tier.level,
      gridSize: `${tier.gridRows}x${tier.gridCols}`,
      completionTimeMs,
      reactionTimeMs,
      hesitationScore: avgHesitation,
      errorRate: Math.min(1, wrongTaps / Math.max(1, totalTaps)),
      score: finalScore
    };

    // Save to local storage
    cognitiveStorage.saveSession(result);

    // Adapt DDA tier
    const ddaResult = ddaEngine.evaluateSession({
      accuracy,
      hesitationScore: avgHesitation,
      completionTimeMs,
      totalPairs
    });

    setIsCompleted(true);
    setGameResult({ ...result, ddaResult });

    playGentleTone(880, 2.0);
    speakText(`Wonderful job! You scored ${finalScore} points!`);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--r-full)' }}
        >
          <ArrowLeft size={18} /> Back to Hub
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {[1, 2, 3, 4, 5].map(lvl => (
            <button
              key={lvl}
              onClick={() => setTier(ddaEngine.setLevel(lvl))}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: lvl === tier.level ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--border)',
                background: lvl === tier.level ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface)',
                color: lvl === tier.level ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Tier Info Card */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '20px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase' }}>
            {tier.badge}
          </span>
          <h3 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 800 }}>{tier.label}</h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
            {tier.description}
          </p>
        </div>
        <button
          onClick={() => initGame(tier)}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--r-full)' }}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {/* Completion Modal / Overlay */}
      {isCompleted && gameResult ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center', borderRadius: '24px', border: '2px solid #10b981', boxShadow: '0 15px 40px rgba(16, 185, 129, 0.2)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Trophy size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 6px' }}>Memory Exercise Complete!</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--md-sys-color-on-surface-variant)', margin: '0 0 24px' }}>
            Excellent focus and cognitive recall
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--md-sys-color-surface-container)', padding: '14px', borderRadius: '16px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>{gameResult.score}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>Score</div>
            </div>
            <div style={{ background: 'var(--md-sys-color-surface-container)', padding: '14px', borderRadius: '16px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#8b5cf6' }}>{Math.round(gameResult.completionTimeMs / 1000)}s</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>Time</div>
            </div>
            <div style={{ background: 'var(--md-sys-color-surface-container)', padding: '14px', borderRadius: '16px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ec4899' }}>{moves}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>Moves</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => initGame(tier)}
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
        /* Memory Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${tier.gridCols}, 1fr)`,
          gap: '14px',
          padding: '10px 0'
        }}>
          {cards.map((card, index) => {
            const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.pairId);
            const isMatched = matchedPairs.includes(card.pairId);

            return (
              <div
                key={card.uniqueId}
                onClick={() => handleCardClick(index)}
                style={{
                  height: '110px',
                  borderRadius: '20px',
                  background: isMatched
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.25))'
                    : isFlipped
                    ? 'var(--md-sys-color-surface-container-highest)'
                    : 'linear-gradient(135deg, var(--md-sys-color-primary), #8b5cf6)',
                  border: isMatched ? '2px solid #10b981' : isFlipped ? '2px solid var(--border)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isFlipped ? 'var(--shadow-elevation-1)' : '0 6px 20px rgba(103, 80, 164, 0.35)',
                  transform: isFlipped ? 'scale(0.98)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.2, 0, 0, 1)',
                  userSelect: 'none'
                }}
              >
                {isFlipped ? (
                  <>
                    <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>{card.emoji}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: '6px', color: 'var(--md-sys-color-on-surface)' }}>
                      {card.name}
                    </span>
                  </>
                ) : (
                  <Sparkles size={28} color="#fff" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
