export interface CareerRecommendation {
  recommended_roles: string[];
  suggested_skills: string[];
  learning_resources: { name: string; url: string }[];
  readiness_summary: string;
}

export async function generateCareerRecommendationPrompt(
  interviewData: { avgScore: number; strengths: string[]; weaknesses: string[]; totalInterviews: number },
  resumeData: { atsScore: number; recentSkills: string[] }
): Promise<CareerRecommendation> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not defined");

  const prompt = `You are an expert AI Career Coach. Based on the user's performance data, generate a career recommendation profile.

Performance Data:
- Total Mock Interviews Completed: ${interviewData.totalInterviews}
- Average Interview Score: ${interviewData.avgScore}/100
- Key Strengths: ${interviewData.strengths.join(", ") || "None recorded yet"}
- Areas for Improvement: ${interviewData.weaknesses.join(", ") || "None recorded yet"}

Resume Data:
- ATS Score: ${resumeData.atsScore}/100
- Resume Skills (if available): ${resumeData.recentSkills.join(", ") || "None recorded yet"}

Analyze this profile and provide your recommendations.
Return the output strictly as a valid JSON object matching the following structure:
{
  "recommended_roles": ["Role 1", "Role 2", "Role 3"],
  "suggested_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  "learning_resources": [
    { "name": "Resource Name", "url": "https://example.com" },
    { "name": "Resource Name 2", "url": "https://example.com" }
  ],
  "readiness_summary": "A 2-3 sentence summary of how ready they are for placements and what they should focus on next."
}
`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API Error: ${await response.text()}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content) as CareerRecommendation;
}
