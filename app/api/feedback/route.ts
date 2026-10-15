import { NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/groq";
import { getFeedbackSystemPrompt } from "@/lib/prompts";
import { AnswerScore } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { question, answer, role, type } = await req.json();

    if (!question || !answer || !role || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = getFeedbackSystemPrompt(role, type);
    
    const prompt = `Question: ${question}\nCandidate Answer: ${answer}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: GROQ_MODEL,
      temperature: 0.2, // Low temperature to ensure valid JSON
      max_tokens: 1024,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content || "{}";
    
    try {
      const feedback: AnswerScore = JSON.parse(responseContent);
      return NextResponse.json(feedback);
    } catch (parseError) {
      console.error("Failed to parse Groq response to JSON:", responseContent);
      return NextResponse.json({ error: "Invalid JSON response from AI" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in feedback API:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
