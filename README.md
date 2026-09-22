# PharmaVision AI — Intelligent Clinical Pharmacology & Cognitive Healthcare Platform

PharmaVision AI is a high-precision clinical pharmacology and computer vision web application designed to analyze medication packaging, digitize doctor prescriptions, audit blood diagnostic reports, simulate CYP450 metabolic pathways, and deliver adaptive cognitive memory care for elderly patients and caregivers.

---

## 🌟 Key Capabilities & Features

### 1. 📷 Optical Medicine Packaging Scanner & Biomedical Verification
- **High-Precision Packaging Computer Vision**: Analyzes blister packs, medicine bottles, ointment tubes, and prescription labels in real-time.
- **NIH / NCBI PubChem & MeSH Enrichment**: Enriches scanned medications with verified PubChem CID numbers, molecular formulas, molecular weights, IUPAC names, and MeSH classifications.
- **U.S. FDA NDC Database Lookup**: Validates National Drug Codes, active labelers, and DailyMed clinical package inserts.
- **Side-by-Side Clinical Flashcards**: Presents primary indications, mechanisms of action, dosage instructions, patient profiles, warnings, and drug-drug interactions.

### 2. 🧪 Clinical Diagnostics & Dual Consultation Audit
- **Diagnostic Lab Report Analyzer**: Flags out-of-range biomarkers (e.g. HbA1c, Serum Creatinine, LDL Cholesterol, Vitamin D3) with clinical risk assessments and lifestyle recommendations.
- **Doctor Prescription Digitization**: Parses handwritten/printed clinic Rx notes, identifying drug dosages, administration schedules (e.g., `1-0-1`, `OD`, `BD`, `TDS`, `AC`, `PC`, `HS`), and durations.
- **Dual Consultation Auditor (360° Safety Audit)**: Concurrently cross-audits diagnostic lab reports with doctor prescriptions to detect unaddressed biomarker gaps, contraindications, and organ stress alerts (Renal, Hepatic, Cardiovascular).

### 3. 🧬 CYP450 Enzyme Pharmacokinetics Pathway Engine
- **Metabolic Pathway Simulator**: Models CYP450 hepatic enzymes (CYP3A4, CYP2D6, CYP2C9, CYP2C19, CYP1A2) to identify substrate, inhibitor, and inducer drug interactions before compounding toxicity occurs.

### 4. 🧠 Cognitive Care, Reminiscence Therapy & Caregiver Telemetry
- **Daily Memory Recall Games**: Neural stimulation trivia and reminiscence card matching tailored to elderly patients.
- **Dynamic Difficulty Adjustment (DDA)**: Clinically adapts difficulty tiers (1–4) based on patient recall latency, cognitive score, and hesitation patterns.
- **Caregiver & Family Telemetry**: Real-time medication adherence tracking, cognitive performance analytics, and missed routine alerts.
- **Voice Therapy Room**: Soothing, empathetic therapeutic voice interactions and calming guided sleep/reminiscence scripts.

### 5. ⏰ Active Medication Routine Reminder Engine
- **Automated Alarm Watcher**: Background clock interval cross-referencing user routine settings (Morning, Afternoon, Night) with cabinet medications.
- **Full-Screen Intrusive Reminders**: Visual and acoustic chimes with synthesized spoken alerts when scheduled medication times arrive.

### 6. 🌐 8-Language Multilingual Intelligence & Live Speech Translator
- **Universal Multilingual Support**: English, Hindi (हिंदी), Telugu (తెలుగు), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), Bengali (বাংলা), Marathi (मराठी), and Spanish (Español).
- **Live Speech & Doctor-Patient Translator**: Real-time bi-directional clinical speech-to-speech and text translation.
- **Hands-Free Voice Commands**: Voice-controlled application navigation ("Open Scanner", "My Cabinet", "Play Memory Game", "Caregiver").

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, HSL & Material You dynamic tokens, Lucide React icons, Web Audio API, Web Speech API.
- **Backend**: Node.js, Express, Multi-Key Failover Key Manager (`@google/generative-ai`), OpenAI SDK (`openai`), Supabase Database & Auth, Native HTTPS NCBI Entrez Client.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm

### 2. Installation & Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🔒 Environment Variables

### Backend (`backend/.env`)
- `PORT`: Server port (default: `5000`)
- `NODE_ENV`: Environment (`development` or `production`)
- `CLIENT_URL`: Allowed CORS origins
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role secret
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `JWT_SECRET`: Secret key for token signing
- `GEMINI_API_KEY`: Google Gemini API Key (Supports single key OR comma-separated keys for auto-failover)
- `GEMINI_MODEL`: Optional model override (Default: `gemini-3.7-flash`)
- `OPENAI_API_KEY`: Optional OpenAI API Key (GPT-4o failover)
- `NCBI_API_KEY`: Optional NIH / NCBI Entrez API Key

### Frontend (`frontend/.env`)
- `VITE_API_URL`: API Base URL (default: `/api`)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID

---

## 🧪 Testing

Run backend test suite:
```bash
cd backend
npm test
```

Run frontend production build:
```bash
cd frontend
npm run build
```

---

## 📄 License

MIT License
