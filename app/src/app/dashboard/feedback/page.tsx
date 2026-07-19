import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { MessageSquare, ChevronRight, Calendar, Building2, FileText, Star } from "lucide-react";
import Card from "@/components/ui/Card";
import Link from "next/link";

export default async function FeedbackListPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!dbUser) redirect("/onboarding");

  // Step 1: Get all interviews for this user
  const { data: interviews } = await supabaseAdmin
    .from("interviews")
    .select("id, interview_type, difficulty, company, created_at")
    .eq("user_id", dbUser.id)
    .order("created_at", { ascending: false });

  const interviewIds = (interviews ?? []).map((i) => i.id);

  // Step 2: Get all feedback reports for those interviews
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reports: any[] = [];
  if (interviewIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("feedback_reports")
      .select("id, interview_id, executive_summary, created_at, interviews(id, interview_type, difficulty, company, created_at)")
      .in("interview_id", interviewIds)
      .order("created_at", { ascending: false });
    reports = data ?? [];
  }

  // Step 3: Find interviews that have scores but no feedback report yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let scoredWithoutReport: any[] = [];
  if (interviewIds.length > 0) {
    const reportedIds = new Set(reports.map((r) => r.interview_id));
    const { data: scores } = await supabaseAdmin
      .from("scores")
      .select("interview_id")
      .in("interview_id", interviewIds);
    const scoredIds = new Set((scores ?? []).map((s) => s.interview_id));
    scoredWithoutReport = (interviews ?? []).filter(
      (i) => scoredIds.has(i.id) && !reportedIds.has(i.id)
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">
          Feedback <span className="gradient-text">Reports</span>
        </h1>
        <p className="text-slate-400">
          Detailed AI-generated performance reports: strengths, weaknesses, study topics, and company readiness.
        </p>
      </div>

      {/* Interviews with scores but no report yet */}
      {scoredWithoutReport.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Awaiting Report Generation
          </h2>
          <div className="space-y-3">
            {scoredWithoutReport.map((interview) => {
              const date = new Date(interview.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              });
              return (
                <Card key={interview.id} className="p-5 flex items-center justify-between gap-4 border-yellow-500/20 bg-yellow-500/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {interview.difficulty} {interview.interview_type} Interview
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {date}
                        </span>
                        {interview.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {interview.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/feedback/${interview.id}`}
                    className="flex-shrink-0 text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-xl hover:bg-yellow-500/30 transition-colors"
                  >
                    View Report →
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated Reports */}
      {reports.length === 0 && scoredWithoutReport.length === 0 ? (
        <Card variant="gradient" glow className="p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-indigo-400 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">No Reports Yet</h2>
          <p className="text-slate-400 text-sm mb-6">
            Complete a mock interview session to generate your first detailed feedback report.
          </p>
          <Link
            href="/dashboard/interview"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Start an Interview
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Card>
      ) : reports.length > 0 ? (
        <div>
          {scoredWithoutReport.length > 0 && (
            <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Generated Reports
            </h2>
          )}
          <div className="space-y-4">
            {reports.map((report) => {
              const interview = report.interviews as {
                interview_type: string;
                difficulty: string;
                company: string | null;
                created_at: string;
              };
              const date = new Date(interview.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              });
              return (
                <Link key={report.id} href={`/dashboard/feedback/${report.interview_id}`}>
                  <Card hover className="p-5 flex items-center justify-between gap-4 group cursor-pointer hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {interview.difficulty} {interview.interview_type} Interview
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {date}
                          </span>
                          {interview.company && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {interview.company}
                            </span>
                          )}
                        </div>
                        {report.executive_summary && (
                          <p className="text-slate-500 text-xs mt-1 line-clamp-1 max-w-sm">
                            {report.executive_summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
