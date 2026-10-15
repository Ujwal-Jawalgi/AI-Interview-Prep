export type UserRole = "fresher" | "junior" | "mid" | "senior";

export interface Profile {
  id: string;
  name: string;
  target_role: string;
  experience_level: UserRole;
  skills: string[];
  created_at: string;
}

export type Difficulty = "easy" | "medium" | "hard";
export type InterviewType = "technical" | "hr" | "behavioral" | "mixed";

export interface Question {
  id: string;
  category: "dsa" | "core-cs" | "hr" | "behavioral";
  topic: string;
  difficulty: Difficulty;
  question: string;
  sample_answer: string;
  tags: string[];
}

export interface AnswerScore {
  clarity: number;
  technical: number;
  structure: number;
  overall: number;
  strengths: string[];
  improvements: string[];
  sample_answer: string;
}

export interface Interview {
  id: string;
  user_id: string;
  role: string;
  difficulty: Difficulty;
  type: InterviewType;
  questions: string[]; // question strings
  answers: string[]; // answer strings
  scores: AnswerScore[];
  overall_score: number;
  duration_minutes: number;
  created_at: string;
}
