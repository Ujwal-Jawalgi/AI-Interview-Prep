"use server";

export async function executeCode(code: string, language: string, stdin: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  try {
    const prompt = `
      You are a highly accurate code execution engine.
      I will provide you with a code snippet written in ${language} and its standard input (stdin).
      Your task is to accurately simulate the execution of this code and output the exact standard output (stdout) and standard error (stderr) it would produce.
      Do not explain or add markdown outside the JSON. Return strictly a JSON object.

      Code:
      \`\`\`${language}
      ${code}
      \`\`\`

      Stdin:
      ${stdin}

      Return strictly this JSON format:
      {
        "stdout": "the standard output string",
        "stderr": "the standard error string if any, else empty string",
        "error": "compiler or runtime error string if any, else empty string"
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
        temperature: 0.1, // Low temperature for deterministic simulation
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
    console.error("Error executing code via Groq:", error);
    throw new Error("Failed to execute code.");
  }
}
