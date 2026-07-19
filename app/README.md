# AI Interview Preparation Platform

An AI-powered mock interview and resume analysis platform that helps students and job seekers prepare for placements. Unlike static question-bank sites, it runs real interactive interviews, evaluates answers in real time, analyzes resumes for ATS compatibility, and tracks improvement over time.

**Live demo:** https://ai-interview-arun-khajapure.vercel.app/

---

## Features

- **Authentication** - Email, Google login, and secure sessions via Clerk
- **Dashboard** - Interview count, overall score, resume score, strengths/weaknesses, progress charts
- **Resume Analyzer** - PDF upload, rule-based ATS scoring, keyword matching, and AI-generated improvement feedback
- **AI Mock Interview** - HR, Technical, Behavioral, Aptitude, and Coding interview types across Beginner/Intermediate/Advanced difficulty
- **Voice Interview** - Speak your answers using the browser's Web Speech API
- **Coding Round** - In-browser code editor (C, C++, Java, Python, JavaScript) with real code execution and AI code review
- **Company-Specific Interviews** - Question styles tailored to companies like Google, Amazon, Microsoft, Infosys, and Adobe
- **AI Evaluation** - Scoring across communication, confidence, grammar, technical accuracy, and problem solving
- **Feedback Reports** - Strengths, weaknesses, improvement tips, and recommended topics after every session
- **Progress Tracking** - Charts for practice time, score trends, and skill growth over time
- **AI Career Recommendations** - Suggested roles, skills to learn, and placement-readiness summary based on performance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes / Server Actions (serverless) |
| Database | Supabase (PostgreSQL) |
| Auth | Clerk |
| AI | Groq API |
| Code Execution | Piston API (or Judge0, see note below) |
| Voice | Web Speech API (browser-native) |
| Charts | Chart.js |
| Deployment | Vercel |

> **Note on code execution:** the Coding Round module uses a code execution API to run and test user-submitted code. Check `app/api/execute` (or equivalent) for the currently configured provider, since public API access/pricing for these services can change.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Clerk](https://clerk.com) application
- A [Groq](https://console.groq.com) API key

### Setup

```bash
# Clone the repo
git clone https://github.com/Ujwal-Jawalgi/AI-Interview-Prep.git
cd AI-Interview-Prep

# Install dependencies
npm install
```

Create a `.env.local` file in the project root with the following variables:

```dotenv
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Groq AI
GROQ_API_KEY=

# Code Execution
PISTON_API_URL=
```

Run the database schema (found in `supabase_schema.sql`) in your Supabase project's SQL Editor, then start the dev server:

```bash
npm run dev
```

Visit `https://ai-interview-arun-khajapure.vercel.app/`.

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Mirrors Clerk user, linked via `clerk_id` |
| `resumes` | Uploaded resumes with ATS scores |
| `interviews` | Interview sessions (type, company, difficulty) |
| `questions` | Individual Q&A per interview |
| `scores` | Per-interview score breakdown |
| `progress` | Daily practice and score history for charts |

---

## Architecture

```
User → Next.js Frontend → Next.js API Routes (serverless)
                              → Supabase Postgres (data)
                              → Groq API (AI generation & evaluation)
                              → Piston API (code execution)
                          → Feedback generation → Dashboard
```

---

## Roadmap

- [ ] Video interview analysis (webcam, facial expression/eye contact)
- [ ] Multi-language interview support
- [ ] Mobile app (Android/iOS)
- [ ] Live interviewer sessions & peer mock interviews
- [ ] LinkedIn integration
- [ ] Automatic resume generation

---

## Author

**Ujwal U**
Chair, IEEE EMBS Student Branch Chapter,
B.Tech CSE, BMS Institute of Technology & Management

---

## License

This project is for educational and portfolio purposes.
