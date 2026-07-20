"use server";

export async function evaluateCode(
  code: string,
  language: string,
  problemTitle: string,
  problemDescription: string
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  const prompt = `
You are an expert technical interviewer and software engineer.
I solved the problem "${problemTitle}" in ${language}.

Problem:
${problemDescription}

My Code:
\`\`\`${language}
${code}
\`\`\`

Return strictly this JSON:
{
  "timeComplexity": "O(...)",
  "timeExplanation": "...",
  "spaceComplexity": "O(...)",
  "spaceExplanation": "...",
  "review": "..."
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
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(`Groq API returned ${response.status}`);

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Groq");
  return JSON.parse(content);
}

// ─── Combined analysis for BOTH problems ────────────────────────────────────
export interface CombinedReview {
  problem1: {
    title: string;
    timeComplexity: string;
    timeExplanation: string;
    spaceComplexity: string;
    spaceExplanation: string;
    review: string;
  };
  problem2: {
    title: string;
    timeComplexity: string;
    timeExplanation: string;
    spaceComplexity: string;
    spaceExplanation: string;
    review: string;
  };
  overallAssessment: string;
  overallScore: number; // 0-100
  strengths: string[];
  improvements: string[];
}

export async function evaluateBothSolutions(
  language: string,
  solution1: { title: string; description: string; code: string },
  solution2: { title: string; description: string; code: string }
): Promise<CombinedReview> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  const prompt = `
You are an expert technical interviewer evaluating a candidate who just completed TWO coding problems in ${language}.

=== PROBLEM 1: ${solution1.title} ===
Description: ${solution1.description}

Candidate's Code:
\`\`\`${language}
${solution1.code}
\`\`\`

=== PROBLEM 2: ${solution2.title} ===
Description: ${solution2.description}

Candidate's Code:
\`\`\`${language}
${solution2.code}
\`\`\`

Provide a thorough combined analysis. Consider:
- Correctness and edge cases for each solution
- Time and space complexity for each solution
- Code quality, naming, and style
- Consistency in problem-solving approach across both problems
- Overall placement readiness based on both solutions together

Return strictly this JSON (no markdown, no extra text):
{
  "problem1": {
    "title": "${solution1.title}",
    "timeComplexity": "O(...)",
    "timeExplanation": "one sentence",
    "spaceComplexity": "O(...)",
    "spaceExplanation": "one sentence",
    "review": "2-3 sentence code quality review"
  },
  "problem2": {
    "title": "${solution2.title}",
    "timeComplexity": "O(...)",
    "timeExplanation": "one sentence",
    "spaceComplexity": "O(...)",
    "spaceExplanation": "one sentence",
    "review": "2-3 sentence code quality review"
  },
  "overallAssessment": "3-4 sentences assessing the candidate across both problems: approach, consistency, readiness.",
  "overallScore": <integer 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
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
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(`Groq API returned ${response.status}`);

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Groq");
  return JSON.parse(content) as CombinedReview;
}
