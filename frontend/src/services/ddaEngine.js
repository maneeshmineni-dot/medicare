/**
 * Dynamic Difficulty Adjustment (DDA) Engine for Cognitive Therapeutics
 * Adapts puzzle complexity, card count, and response pacing across graduated tiers
 */

export const DIFFICULTY_TIERS = {
  1: {
    level: 1,
    label: 'Gentle Familiarity',
    badge: 'Level 1: Gentle (4 Cards)',
    gridRows: 2,
    gridCols: 2,
    pairsCount: 2,
    flipBackDelayMs: 1200,
    audioSpeed: 0.8,
    hintLatencyMs: 6000,
    scoreMultiplier: 1.0,
    description: '4 large tactile cards (2 pairs), relaxed pace'
  },
  2: {
    level: 2,
    label: 'Focused Recall',
    badge: 'Level 2: Novice (6 Cards)',
    gridRows: 2,
    gridCols: 3,
    pairsCount: 3,
    flipBackDelayMs: 1050,
    audioSpeed: 0.85,
    hintLatencyMs: 8000,
    scoreMultiplier: 1.25,
    description: '6 cards (3 pairs), gentle prompt pacing'
  },
  3: {
    level: 3,
    label: 'Pattern Discrimination',
    badge: 'Level 3: Moderate (8 Cards)',
    gridRows: 2,
    gridCols: 4,
    pairsCount: 4,
    flipBackDelayMs: 950,
    audioSpeed: 0.9,
    hintLatencyMs: 10000,
    scoreMultiplier: 1.5,
    description: '8 cards (4 pairs), quicker memory recall'
  },
  4: {
    level: 4,
    label: 'Visual Tenacity',
    badge: 'Level 4: Active (10 Cards)',
    gridRows: 2,
    gridCols: 5,
    pairsCount: 5,
    flipBackDelayMs: 900,
    audioSpeed: 0.92,
    hintLatencyMs: 11000,
    scoreMultiplier: 1.75,
    description: '10 cards (5 pairs), expanded visual field'
  },
  5: {
    level: 5,
    label: 'Cognitive Agility',
    badge: 'Level 5: Master (12 Cards)',
    gridRows: 3,
    gridCols: 4,
    pairsCount: 6,
    flipBackDelayMs: 850,
    audioSpeed: 0.95,
    hintLatencyMs: 12000,
    scoreMultiplier: 2.0,
    description: '12 cards (6 pairs), advanced spatial recall'
  }
};

class DDAEngine {
  constructor() {
    this.currentLevel = 1;
  }

  getCurrentTier() {
    return DIFFICULTY_TIERS[this.currentLevel] || DIFFICULTY_TIERS[1];
  }

  setLevel(level) {
    const clamped = Math.max(1, Math.min(5, level));
    this.currentLevel = clamped;
    return this.getCurrentTier();
  }

  /**
   * Evaluate performance and calculate adapted tier
   */
  evaluateSession({ accuracy, hesitationScore, completionTimeMs, totalPairs }) {
    let newLevel = this.currentLevel;

    // High mastery (accuracy >= 85% and low hesitation)
    if (accuracy >= 0.85 && hesitationScore < 1500) {
      newLevel = Math.min(5, this.currentLevel + 1);
    }
    // High difficulty encountered (accuracy < 50% or very high hesitation)
    else if (accuracy < 0.5 || hesitationScore > 3500) {
      newLevel = Math.max(1, this.currentLevel - 1);
    }

    this.currentLevel = newLevel;
    return {
      newLevel,
      tier: this.getCurrentTier(),
      levelChanged: newLevel !== this.currentLevel
    };
  }
}

export const ddaEngine = new DDAEngine();
