# Phase 12 — Production Deployment Guide

Your InterviewAI app is fully built, passing all compile checks and is ready to be deployed to production! Since we are using Next.js with Serverless Actions for everything, deploying to **Vercel** is the easiest and most seamless route.

Follow these steps to get your app live on a public URL.

---

## Step 1: Push to GitHub
Vercel deploys directly from your Git repository. 
If you haven't pushed your code to GitHub yet:
1. Initialize Git in your project folder (if not done yet): `git init`
2. Add all files: `git add .`
3. Commit: `git commit -m "Ready for production"`
4. Push to a new GitHub repository.

## Step 2: Import into Vercel
1. Go to [Vercel.com](https://vercel.com/) and log in (with GitHub).
2. Click **Add New...** → **Project**.
3. Select your `InterviewAI` GitHub repository and click **Import**.
4. Leave the Framework Preset as **Next.js**.

## Step 3: Add Environment Variables
Before clicking Deploy, expand the **Environment Variables** section. You must copy ALL of the keys from your local `.env.local` file. 

Copy and paste these exact keys and your corresponding values:

**Clerk (Auth)**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (value: `/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (value: `/sign-up`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (value: `/dashboard`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` (value: `/dashboard`)

**Supabase (Database)**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Groq (AI Integration)**
- `GROQ_API_KEY`

**Piston (Code Execution)**
- `PISTON_API_URL` (value: `https://emkc.org/api/v2/piston/execute`)

> [!TIP]
> You can simply copy the entire contents of your `.env.local` file and paste it into the first "Key" box in Vercel. Vercel will automatically parse and populate all the fields for you!

## Step 4: Deploy & Verify!
1. Click **Deploy**.
2. Wait 2-3 minutes for Vercel to build and assign a production URL (e.g., `interview-ai.vercel.app`).
3. Click the generated URL to visit your live site!

### Final End-to-End Checklist
Once live, please run through this flow to verify everything works in production:
- [ ] Sign up as a new user.
- [ ] Upload a dummy PDF Resume (Verify it parses and gives an ATS score).
- [ ] Take an AI Mock Interview (e.g. HR or Technical) and complete it.
- [ ] Try a Coding Round (run a quick Python/JS snippet via Piston).
- [ ] Submit an interview and check the Score Breakdown.
- [ ] View the Feedback Report.
- [ ] Check your Dashboard Progress Charts to see the new data point.
- [ ] Click "Generate AI Career Profile" at the bottom to see your recommendations.

Congratulations! Your AI Interview Preparation platform is complete!
