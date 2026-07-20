import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import CareerPageClient from "./CareerPageClient";
import type { CareerRecommendation } from "@/lib/career/groq-career";

export default async function CareerPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!dbUser) redirect("/onboarding");

  // ── Load cached recommendation (if one exists) ──────────────
  const { data: cached } = await supabaseAdmin
    .from("career_recommendations")
    .select(
      "recommended_roles, suggested_skills, learning_resources, readiness_summary"
    )
    .eq("user_id", dbUser.id)
    .maybeSingle();

  const initialData: CareerRecommendation | null = cached
    ? {
        recommended_roles: cached.recommended_roles ?? [],
        suggested_skills: cached.suggested_skills ?? [],
        learning_resources: cached.learning_resources ?? [],
        readiness_summary: cached.readiness_summary ?? "",
      }
    : null;

  // ── Load performance context for the stats strip ────────────
  const { data: interviews } = await supabaseAdmin
    .from("interviews")
    .select("id")
    .eq("user_id", dbUser.id);

  const interviewIds = (interviews ?? []).map((i) => i.id);

  let avgScore = 0;
  if (interviewIds.length > 0) {
    const { data: scores } = await supabaseAdmin
      .from("scores")
      .select("final_score")
      .in("interview_id", interviewIds);

    if (scores && scores.length > 0) {
      avgScore = Math.round(
        scores.reduce((acc, s) => acc + (s.final_score ?? 0), 0) / scores.length
      );
    }
  }

  return (
    <CareerPageClient
      initialData={initialData}
      totalInterviews={interviewIds.length}
      avgScore={avgScore}
    />
  );
}
