"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
// Use direct lib import to avoid Next.js module.parent 'isDebugMode' bug which looks for a test file
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
import { calculateATSScore } from "@/lib/resume/ats-scorer";
import { getGroqFeedback } from "@/lib/resume/groq-feedback";

export interface ResumeAnalysisResult {
  atsScore: number;
  missingSkills: string[];
  foundSkills: string[];
  missingSections: string[];
  foundSections: string[];
  grammarErrors: number;
  grammarDetails: string[];
  projectFeedback: string;
  overallFeedback: string;
  improvementTips: string[];
}

export async function analyzeResume(formData: FormData): Promise<ResumeAnalysisResult> {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const file = formData.get("resume") as File;
  if (!file) throw new Error("No file uploaded");

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported");
  }

  try {
    // 1. Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    // 2. Run rule-based ATS scoring
    const atsResult = calculateATSScore(text);

    // 3. Get LLM feedback
    const groqFeedback = await getGroqFeedback(text, atsResult.missingSkills);

    // 4. Save to database (Requires SUPABASE_SERVICE_ROLE_KEY to bypass RLS)
    // First, resolve the clerk_id to the database user_id
    const { data: dbUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (dbUser) {
      await supabaseAdmin.from("resumes").insert({
        user_id: dbUser.id,
        file_url: null, // Skipping file storage for this phase
        ats_score: atsResult.score,
      });

      // Upsert progress row for today
      const today = new Date().toISOString().split("T")[0];
      const { data: existingProgress } = await supabaseAdmin
        .from("progress")
        .select("id, practice_time")
        .eq("user_id", dbUser.id)
        .eq("date", today)
        .maybeSingle();

      if (existingProgress) {
        await supabaseAdmin
          .from("progress")
          .update({
            resume_score: atsResult.score,
            practice_time: (existingProgress.practice_time || 0) + 5, // ~5 min per scan
          })
          .eq("id", existingProgress.id);
      } else {
        await supabaseAdmin.from("progress").insert({
          user_id: dbUser.id,
          date: today,
          resume_score: atsResult.score,
          practice_time: 5,
        });
      }
    }

    // 5. Combine and return result
    return {
      atsScore: atsResult.score,
      missingSkills: atsResult.missingSkills,
      foundSkills: atsResult.foundSkills,
      missingSections: atsResult.missingSections,
      foundSections: atsResult.foundSections,
      grammarErrors: groqFeedback.grammarErrors,
      grammarDetails: groqFeedback.grammarDetails,
      projectFeedback: groqFeedback.projectFeedback,
      overallFeedback: groqFeedback.overallFeedback,
      improvementTips: groqFeedback.improvementTips,
    };
  } catch (error) {
    console.error("Resume analysis failed:", error);
    throw new Error("Failed to analyze resume. Please try again.");
  }
}
