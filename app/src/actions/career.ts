"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateCareerRecommendationPrompt } from "@/lib/career/groq-career";
import { revalidatePath } from "next/cache";

export async function generateCareerRecommendation() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!dbUser) throw new Error("User not found");

  // Fetch interview scores
  const { data: interviews } = await supabaseAdmin
    .from("interviews")
    .select("id")
    .eq("user_id", dbUser.id);
  const interviewIds = interviews?.map(i => i.id) || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allScores: any[] = [];
  if (interviewIds.length > 0) {
    const { data: scores } = await supabaseAdmin
      .from("scores")
      .select("final_score, communication, technical, grammar, confidence, logical_thinking, problem_solving")
      .in("interview_id", interviewIds);
    allScores = scores || [];
  }

  const avgScore = allScores.length > 0
    ? Math.round(allScores.reduce((acc, curr) => acc + (curr.final_score || 0), 0) / allScores.length)
    : 0;

  // Derive strengths/weaknesses (simplified for prompt)
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (allScores.length > 0) {
    const avgComm = allScores.reduce((acc, curr) => acc + (curr.communication || 0), 0) / allScores.length;
    const avgTech = allScores.reduce((acc, curr) => acc + (curr.technical || 0), 0) / allScores.length;
    if (avgComm > 70) strengths.push("Communication");
    else if (avgComm > 0) weaknesses.push("Communication");
    if (avgTech > 70) strengths.push("Technical Depth");
    else if (avgTech > 0) weaknesses.push("Technical Depth");
  }

  // Fetch resume data
  const { data: resumes } = await supabaseAdmin
    .from("resumes")
    .select("ats_score")
    .eq("user_id", dbUser.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const atsScore = resumes?.[0]?.ats_score || 0;

  const recommendation = await generateCareerRecommendationPrompt(
    { avgScore, strengths, weaknesses, totalInterviews: allScores.length },
    { atsScore, recentSkills: [] } // For simplicity we aren't storing resume skills separately right now
  );

  // Upsert into career_recommendations
  const { data: existing } = await supabaseAdmin
    .from("career_recommendations")
    .select("id")
    .eq("user_id", dbUser.id)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("career_recommendations")
      .update({
        recommended_roles: recommendation.recommended_roles,
        suggested_skills: recommendation.suggested_skills,
        learning_resources: recommendation.learning_resources,
        readiness_summary: recommendation.readiness_summary,
      })
      .eq("id", existing.id);
  } else {
    await supabaseAdmin.from("career_recommendations").insert({
      user_id: dbUser.id,
      recommended_roles: recommendation.recommended_roles,
      suggested_skills: recommendation.suggested_skills,
      learning_resources: recommendation.learning_resources,
      readiness_summary: recommendation.readiness_summary,
    });
  }

  revalidatePath("/dashboard");
  return recommendation;
}
