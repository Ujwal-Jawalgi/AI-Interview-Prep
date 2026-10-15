import { NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/groq";
import { getResumePrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const { resumeText, targetRole } = await req.json();

    if (!resumeText || !targetRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = getResumePrompt(targetRole);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Resume Text:\n${resumeText}` }
      ],
      model: GROQ_MODEL,
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content || "{}";
    
    try {
      const analysis = JSON.parse(responseContent);
      return NextResponse.json(analysis);
    } catch (parseError) {
      console.error("Failed to parse Groq response to JSON:", responseContent);
      return NextResponse.json({ error: "Invalid JSON response from AI" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in resume API:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
