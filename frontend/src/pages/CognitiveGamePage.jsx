import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ReminiscenceMemoryMatch } from '../components/cognitive/ReminiscenceMemoryMatch';
import { CognitiveQAGame } from '../components/cognitive/CognitiveQAGame';

export const CognitiveGamePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'match';

  return (
    <div className="page-inner" style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {mode === 'quiz' ? (
        <CognitiveQAGame onBack={() => navigate('/memory-assistance')} />
      ) : (
        <ReminiscenceMemoryMatch onBack={() => navigate('/memory-assistance')} />
      )}
    </div>
  );
};
