import { NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/groq";
import { getInterviewSystemPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const { messages, role, difficulty, type } = await req.json();

    if (!messages || !role || !difficulty || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = getInterviewSystemPrompt(role, difficulty, type);
    
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
    });

    const responseContent = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ text: responseContent });
  } catch (error: any) {
    console.error("Error in interview API:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
