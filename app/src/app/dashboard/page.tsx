import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import DashboardClient, { DashboardData } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const firstName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "there";

  // Fetch the Supabase user ID based on Clerk ID
  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!dbUser) redirect("/onboarding");

  // Fetch stats using Promise.all for parallelism
  const [
    { count: totalInterviews },
    { data: resumes },
    { data: progressRecords },
    { data: careerRecs },
  ] = await Promise.all([
    supabaseAdmin.from("interviews").select("id", { count: "exact", head: true }).eq("user_id", dbUser.id),
    supabaseAdmin.from("resumes").select("ats_score").eq("user_id", dbUser.id).order("created_at", { ascending: false }).limit(1),
    supabaseAdmin.from("progress").select("date, practice_time, interview_score, resume_score").eq("user_id", dbUser.id).order("date", { ascending: true }),
    supabaseAdmin.from("career_recommendations").select("recommended_roles, suggested_skills, learning_resources, readiness_summary").eq("user_id", dbUser.id).maybeSingle(),
  ]);

  // Fix scores fetch (since scores are by interview_id)
  // Let's just fetch all interviews first to get their IDs
  const { data: interviews } = await supabaseAdmin
    .from("interviews")
    .select("id")
    .eq("user_id", dbUser.id);
    
  const interviewIds = interviews?.map((i) => i.id) || [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userScores: any[] = [];
  if (interviewIds.length > 0) {
    const { data: fetchedScores } = await supabaseAdmin
      .from("scores")
      .select("communication, technical, grammar, confidence, final_score")
      .in("interview_id", interviewIds);
      
    userScores = fetchedScores || [];
  }

  // Calculate Average Score
  const avgScore = userScores.length > 0
    ? Math.round(userScores.reduce((acc, curr) => acc + (curr.final_score || 0), 0) / userScores.length)
    : 0;

  // Calculate Strengths & Weaknesses based on sub-scores
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (userScores.length > 0) {
    const avgComm = userScores.reduce((acc, curr) => acc + (curr.communication || 0), 0) / userScores.length;
    const avgTech = userScores.reduce((acc, curr) => acc + (curr.technical || 0), 0) / userScores.length;
    
    if (avgComm > 70) strengths.push("Communication");
    else if (avgComm > 0) weaknesses.push("Communication");
    
    if (avgTech > 70) strengths.push("Technical Depth");
    else if (avgTech > 0) weaknesses.push("Technical Depth");
  }

  const resumeScore = resumes?.[0]?.ats_score || 0;
  
  // Progress calculations
  const totalPracticeTime = progressRecords?.reduce((acc, curr) => acc + (curr.practice_time || 0), 0) || 0;

  // Formatting chart data
  const chartData = {
    labels: progressRecords?.map(r => r.date) || [],
    interviewScores: progressRecords?.map(r => r.interview_score || 0) || [],
    resumeScores: progressRecords?.map(r => r.resume_score || 0) || [],
  };

  const dashboardData: DashboardData = {
    firstName,
    totalInterviews: totalInterviews || 0,
    avgScore,
    totalPracticeTime,
    resumeScore,
    chartData,
    strengths,
    weaknesses,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    careerRecommendation: careerRecs as any,
  };

  return <DashboardClient data={dashboardData} />;
}
