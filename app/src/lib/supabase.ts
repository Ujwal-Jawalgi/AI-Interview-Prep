import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  users: {
    id: string;
    clerk_id: string;
    name: string | null;
    email: string;
    college: string | null;
    branch: string | null;
    created_at: string;
  };
  resumes: {
    id: string;
    user_id: string;
    file_url: string | null;
    ats_score: number | null;
    created_at: string;
  };
  interviews: {
    id: string;
    user_id: string;
    interview_type: string | null;
    company: string | null;
    difficulty: string | null;
    created_at: string;
  };
  questions: {
    id: string;
    interview_id: string;
    question_text: string | null;
    user_answer: string | null;
    ai_feedback: string | null;
  };
  scores: {
    id: string;
    interview_id: string;
    communication: number | null;
    technical: number | null;
    grammar: number | null;
    confidence: number | null;
    final_score: number | null;
  };
  progress: {
    id: string;
    user_id: string;
    date: string;
    practice_time: number | null;
    interview_score: number | null;
    resume_score: number | null;
  };
};
