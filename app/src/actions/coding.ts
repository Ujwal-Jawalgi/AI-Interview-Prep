"use server";

export async function evaluateCode(code: string, language: string, problemTitle: string, problemDescription: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  try {
    const prompt = `
      You are an expert technical interviewer and software engineer.
      I have solved the problem "${problemTitle}" in ${language}.
      
      Problem Description:
      ${problemDescription}

      My Code:
      \`\`\`${language}
      ${code}
      \`\`\`

      Please review my code and provide the following:
      1. The Time Complexity (e.g., O(n)) and a brief 1-sentence explanation.
      2. The Space Complexity (e.g., O(1)) and a brief 1-sentence explanation.
      3. A concise Code Quality Review (1-2 paragraphs) pointing out good practices, potential bugs, edge cases handled or missed, and any optimization suggestions.
      
      Output strictly in JSON format as follows:
      {
        "timeComplexity": "O(N)",
        "timeExplanation": "...",
        "spaceComplexity": "O(1)",
        "spaceExplanation": "...",
        "review": "..."
      }
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned ${response.status}`);
    }

    const data = await response.json();
    const responseContent = data.choices[0]?.message?.content;
    if (!responseContent) throw new Error("No response from Groq");

    const parsed = JSON.parse(responseContent);
    return parsed;
  } catch (error) {
    console.error("Error evaluating code:", error);
    throw new Error("Failed to evaluate code.");
  }
}
