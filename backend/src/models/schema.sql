-- ==============================================================================
-- PharmaVision AI & Smriti-Setu Cognitive Health - Supabase SQL Schema
-- Run this in your Supabase SQL Editor (https://zrhnqwazjrqvhanbxrqn.supabase.co)
-- ==============================================================================

-- 1. Cognitive Game Telemetry & Session Records
CREATE TABLE IF NOT EXISTS cognitive_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    game_type TEXT NOT NULL,                  -- 'reminiscence_match', 'cognitive_qa', 'object_recognition'
    difficulty_level INTEGER NOT NULL DEFAULT 1,
    grid_size TEXT DEFAULT '2x2',
    completion_time_ms INTEGER NOT NULL,
    reaction_time_ms INTEGER NOT NULL,
    hesitation_score REAL NOT NULL,
    error_rate REAL NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Family Custom Memory Questions
CREATE TABLE IF NOT EXISTS family_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    relation_tag TEXT,                       -- 'son', 'daughter', 'spouse', 'hometown', 'childhood'
    image_url TEXT,
    hint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Routine Adherence & Caregiver Telemetry
CREATE TABLE IF NOT EXISTS routine_adherence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    routine_slot TEXT NOT NULL,              -- 'morning', 'afternoon', 'evening', 'night'
    medication_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'taken',    -- 'taken', 'skipped', 'late'
    taken_at TIMESTAMPTZ DEFAULT NOW(),
    caregiver_notified BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- 4. Caregiver-Patient Associations
CREATE TABLE IF NOT EXISTS caregiver_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caregiver_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    relationship TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
