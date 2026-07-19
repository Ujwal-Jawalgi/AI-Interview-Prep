export interface GroqFeedback {
  grammarErrors: number;
  grammarDetails: string[];
  projectFeedback: string;
  overallFeedback: string;
  improvementTips: string[];
}

export async function getGroqFeedback(resumeText: string, missingSkills: string[]): Promise<GroqFeedback> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in the environment.");
  }

  const prompt = `
You are an expert ATS (Applicant Tracking System) and Technical Recruiter.
I will provide you with the raw extracted text from a candidate's resume, as well as a list of technical skills they are missing.

Your task is to provide qualitative feedback on their resume. 
Output your response STRICTLY as a JSON object matching this structure (no markdown formatting around the JSON, just raw JSON):
{
  "grammarErrors": number (count of glaring grammar/spelling errors),
  "grammarDetails": string[] (list of the specific errors found, or empty if none),
  "projectFeedback": string (1-2 sentences critiquing the quality of their project descriptions, use of metrics, STAR method),
  "overallFeedback": string (2-3 sentences of overall impression),
  "improvementTips": string[] (3 actionable tips for improving the resume)
}

Missing Skills: ${missingSkills.slice(0, 5).join(", ")}

Resume Text:
${resumeText.substring(0, 4000)} // truncate to avoid token limits if extremely long
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Fast and capable for this task
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content) as GroqFeedback;
    
  } catch (error) {
    console.error("Failed to fetch Groq feedback:", error);
    // Fallback if LLM fails
    return {
      grammarErrors: 0,
      grammarDetails: [],
      projectFeedback: "Unable to analyze project descriptions at this time due to an AI service error.",
      overallFeedback: "Our AI service is temporarily unavailable for qualitative feedback. Please rely on the ATS score for now.",
      improvementTips: ["Try running the analyzer again later."]
    };
  }
}
