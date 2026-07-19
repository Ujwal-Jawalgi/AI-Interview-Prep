const COMPANY_PROFILES: Record<string, { prompt: string; grading: string }> = {
  Google: {
    prompt: "This is a Google interview. Focus heavily on rigorous Data Structures and Algorithms, scalability, and optimal time/space complexity.",
    grading: "Grade like a strict Google engineer. Penalize heavily for sub-optimal time/space complexity or ignoring edge cases.",
  },
  Amazon: {
    prompt: "This is an Amazon interview. Frame the question tightly around Amazon Leadership Principles (e.g., Customer Obsession, Ownership, Dive Deep, Deliver Results).",
    grading: "Grade based on Amazon's STAR method (Situation, Task, Action, Result). Penalize if the answer lacks data, ownership, or customer focus.",
  },
  Infosys: {
    prompt: "This is an Infosys interview. Focus on fresher-level generalist IT questions, basic OOP concepts, Database fundamentals, and SDLC.",
    grading: "Grade leniently like an IT service company HR/Technical recruiter. Focus on clarity, basic understanding, and communication skills.",
  },
  Microsoft: {
    prompt: "This is a Microsoft interview. Focus on practical problem-solving, system design basics, and object-oriented design.",
    grading: "Grade like a Microsoft engineer. Focus on clean code, architectural thought process, and handling edge cases gracefully.",
  },
  Adobe: {
    prompt: "This is an Adobe interview. Focus on core Data Structures, Algorithms, memory management, and past project architecture.",
    grading: "Grade with a focus on deep algorithmic understanding, memory efficiency, and clear communication of tradeoffs.",
  },
  TCS: {
    prompt: "This is a TCS (Tata Consultancy Services) interview. Focus on standard IT aptitude, basic programming concepts (Java/C++), SQL queries, and basic HR questions.",
    grading: "Grade leniently. Focus on correct basic definitions, confidence, and foundational knowledge rather than complex algorithmic optimizations.",
  },
};

export async function generateInterviewQuestion(
  type: string,
  difficulty: string,
  company: string,
  previousQuestions: string[]
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not defined");

  let companyContext = "";
  if (company) {
    const profile = COMPANY_PROFILES[company] || { prompt: `This is an interview for ${company}.`, grading: "" };
    companyContext = ` ${profile.prompt}`;
  }

  const historyContext = previousQuestions.length > 0
    ? `You have already asked the following questions in this interview: ${previousQuestions.join(" | ")}. Do NOT repeat them or ask very similar questions.`
    : "";

  const prompt = `You are an expert interviewer conducting a ${difficulty} level ${type} interview.${companyContext}
Your goal is to ask ONE highly relevant, challenging, and realistic interview question.
${historyContext}

Provide ONLY the question text. Do not include any introductory text, pleasantries, or follow-up instructions. Just the question itself.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API Error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export interface AnswerEvaluation {
  feedback: string;
  rating: number; // 1 to 10
}

export async function evaluateInterviewAnswer(
  type: string,
  question: string,
  answer: string,
  company?: string
): Promise<AnswerEvaluation> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not defined");

  let companyGrading = "";
  if (company) {
    const profile = COMPANY_PROFILES[company];
    if (profile) {
      companyGrading = ` ${profile.grading}`;
    }
  }

  const prompt = `You are an expert interviewer evaluating a candidate's answer in a ${type} interview.${companyGrading}

Question asked: "${question}"
Candidate's answer: "${answer}"

Evaluate this answer objectively. Point out what they did well and what they missed. Be constructive but strict.
Return your evaluation STRICTLY as a JSON object with this format (no markdown code blocks, just raw JSON):
{
  "feedback": "Your 2-3 sentence constructive feedback here.",
  "rating": <number between 1 and 10 based on the quality of the answer>
}
`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API Error: ${await response.text()}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content) as AnswerEvaluation;
}

export interface OverallEvaluation {
  communication: number;
  technical: number;
  grammar: number;
  confidence: number;
  logical_thinking: number;
  problem_solving: number;
  final_score: number;
  feedback: string;
}

export async function generateOverallScore(
  type: string,
  difficulty: string,
  qnaPairs: { question: string; answer: string }[]
): Promise<OverallEvaluation> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not defined");

  const qnaText = qnaPairs.map((p, i) => `Q${i + 1}: ${p.question}\nA${i + 1}: ${p.answer || "(No Answer)"}`).join("\n\n");

  const prompt = `You are an expert technical interviewer evaluating a candidate's complete performance in a ${difficulty} level ${type} interview.

Here is the transcript of the interview:
${qnaText}

Analyze their overall performance and provide scores between 0 and 100 for ALL of the following categories:
- communication: How clearly and effectively did they express themselves?
- technical: How accurate and deep was their domain/technical knowledge?
- grammar: Did they use proper grammar and sentence structure?
- confidence: Did they sound confident and self-assured, or hesitant?
- logical_thinking: Did they reason through problems logically and structured?
- problem_solving: Did they approach problems methodically and find correct solutions?
- final_score: A holistic overall score (0-100) as a weighted average of all above categories.

Also provide a 'feedback' string (2-3 sentences) summarizing their strengths and areas to improve.

Output STRICTLY as a JSON object with no markdown formatting:
{
  "communication": 85,
  "technical": 70,
  "grammar": 90,
  "confidence": 80,
  "logical_thinking": 75,
  "problem_solving": 72,
  "final_score": 79,
  "feedback": "Overall summary here."
}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API Error: ${await response.text()}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content) as OverallEvaluation;
}

export interface FeedbackReport {
  strengths: string[];
  weaknesses: string[];
  improvement_tips: string[];
  recommended_topics: string[];
  practice_questions: string[];
  company_readiness: {
    Google: number;
    Amazon: number;
    Microsoft: number;
    Adobe: number;
    Infosys: number;
    TCS: number;
  };
  executive_summary: string;
}

export async function generateFeedbackReport(
  interviewType: string,
  difficulty: string,
  company: string | null,
  qnaPairs: { question: string; answer: string }[],
  scores: {
    communication: number;
    technical: number;
    grammar: number;
    confidence: number;
    logical_thinking: number;
    problem_solving: number;
    final_score: number;
  }
): Promise<FeedbackReport> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not defined");

  const qnaText = qnaPairs
    .map((p, i) => `Q${i + 1}: ${p.question}\nA${i + 1}: ${p.answer || "(No Answer)"}`)
    .join("\n\n");

  const scoresText = Object.entries(scores)
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}/100`)
    .join(", ");

  const companyCtx = company ? `The interview was for ${company}.` : "No specific company was targeted.";

  const prompt = `You are an expert career coach and technical interviewer. Based on the following interview transcript and AI-generated scores, produce a comprehensive feedback report for the candidate.

Interview Type: ${difficulty} level ${interviewType}
${companyCtx}

SCORES: ${scoresText}

TRANSCRIPT:
${qnaText}

Generate a detailed, actionable report. Output STRICTLY as raw JSON (no markdown) matching this exact schema:
{
  "executive_summary": "2-3 sentence overview of the candidate's overall performance and readiness.",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "improvement_tips": ["tip 1 with specific action", "tip 2", "tip 3", "tip 4"],
  "recommended_topics": ["topic 1 to study", "topic 2", "topic 3", "topic 4", "topic 5"],
  "practice_questions": ["Practice question 1?", "Practice question 2?", "Practice question 3?"],
  "company_readiness": {
    "Google": <0-100 readiness score>,
    "Amazon": <0-100>,
    "Microsoft": <0-100>,
    "Adobe": <0-100>,
    "Infosys": <0-100>,
    "TCS": <0-100>
  }
}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API Error: ${await response.text()}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content) as FeedbackReport;
}

