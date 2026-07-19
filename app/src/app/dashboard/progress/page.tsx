import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import ProgressPageClient from "./ProgressPageClient";

export default async function ProgressPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!dbUser) redirect("/onboarding");

  // Fetch last 30 days of progress rows
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: progressRows } = await supabaseAdmin
    .from("progress")
    .select("date, practice_time, interview_score, resume_score")
    .eq("user_id", dbUser.id)
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  // Fetch all interview scores for skill radar & distribution
  const { data: interviews } = await supabaseAdmin
    .from("interviews")
    .select("id")
    .eq("user_id", dbUser.id);

  const interviewIds = (interviews ?? []).map((i) => i.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allScores: any[] = [];
  if (interviewIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("scores")
      .select("communication, technical, grammar, confidence, logical_thinking, problem_solving, final_score")
      .in("interview_id", interviewIds);
    allScores = data ?? [];
  }

  // Compute aggregate skill averages
  const skillAvgs = allScores.length > 0
    ? {
        communication: Math.round(allScores.reduce((a, s) => a + (s.communication ?? 0), 0) / allScores.length),
        technical: Math.round(allScores.reduce((a, s) => a + (s.technical ?? 0), 0) / allScores.length),
        grammar: Math.round(allScores.reduce((a, s) => a + (s.grammar ?? 0), 0) / allScores.length),
        confidence: Math.round(allScores.reduce((a, s) => a + (s.confidence ?? 0), 0) / allScores.length),
        logical: Math.round(allScores.reduce((a, s) => a + (s.logical_thinking ?? 0), 0) / allScores.length),
        problemSolving: Math.round(allScores.reduce((a, s) => a + (s.problem_solving ?? 0), 0) / allScores.length),
      }
    : { communication: 0, technical: 0, grammar: 0, confidence: 0, logical: 0, problemSolving: 0 };

  // Score distribution
  const excellent = allScores.filter((s) => (s.final_score ?? 0) >= 80).length;
  const good = allScores.filter((s) => (s.final_score ?? 0) >= 60 && (s.final_score ?? 0) < 80).length;
  const needsWork = allScores.filter((s) => (s.final_score ?? 0) < 60).length;

  // Format progress rows for charts
  const rows = progressRows ?? [];
  const formatDate = (d: string) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const labels = rows.map((r) => formatDate(r.date));
  const interviewScores = rows.map((r) => r.interview_score ?? 0);
  const resumeScores = rows.map((r) => r.resume_score ?? 0);
  const practiceMinutes = rows.map((r) => r.practice_time ?? 0);

  // Summary stats
  const totalPracticeTime = rows.reduce((a, r) => a + (r.practice_time ?? 0), 0);
  const avgInterviewScore = allScores.length > 0
    ? Math.round(allScores.reduce((a, s) => a + (s.final_score ?? 0), 0) / allScores.length)
    : 0;
  const bestScore = allScores.length > 0
    ? Math.max(...allScores.map((s) => s.final_score ?? 0))
    : 0;
  const activeDays = new Set(rows.filter(r => (r.interview_score ?? 0) > 0 || (r.practice_time ?? 0) > 0).map(r => r.date)).size;

  return (
    <ProgressPageClient
      labels={labels}
      interviewScores={interviewScores}
      resumeScores={resumeScores}
      practiceMinutes={practiceMinutes}
      skillAvgs={skillAvgs}
      scoreDistribution={{ excellent, good, needsWork }}
      stats={{ totalPracticeTime, avgInterviewScore, bestScore, activeDays, totalInterviews: allScores.length }}
    />
  );
}
