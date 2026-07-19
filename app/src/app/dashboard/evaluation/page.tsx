import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { Star, ChevronRight, Trophy, Calendar, Building2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Link from "next/link";

export default async function EvaluationListPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!dbUser) redirect("/onboarding");

  // Fetch all interviews for this user that have a score
  const { data: interviews } = await supabaseAdmin
    .from("interviews")
    .select("id, interview_type, difficulty, company, created_at")
    .eq("user_id", dbUser.id)
    .order("created_at", { ascending: false });

  const interviewIds = (interviews ?? []).map((i) => i.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let validScores: any[] = [];

  if (interviewIds.length > 0) {
    const { data: scores } = await supabaseAdmin
      .from("scores")
      .select("*, interviews(id, interview_type, difficulty, company, created_at)")
      .in("interview_id", interviewIds)
      .order("id", { ascending: false });
    validScores = (scores ?? []).filter((s) => s.interviews !== null);
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">
          AI <span className="gradient-text">Evaluations</span>
        </h1>
        <p className="text-slate-400">
          Detailed score breakdowns across all your completed interviews.
        </p>
      </div>

      {validScores.length === 0 ? (
        <Card variant="gradient" glow className="p-12 text-center">
          <Star className="w-16 h-16 mx-auto mb-4 text-yellow-400 opacity-60" />
          <h2 className="text-xl font-bold text-white mb-2">No Evaluations Yet</h2>
          <p className="text-slate-400 text-sm mb-6">
            Complete a mock interview to get your AI-powered score breakdown.
          </p>
          <Link
            href="/dashboard/interview"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Start an Interview
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {validScores.map((score) => {
            const interview = score.interviews;
            const date = interview?.created_at
              ? new Date(interview.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—";

            const finalScore = score.final_score ?? 0;
            const scoreColor =
              finalScore >= 80
                ? "text-emerald-400"
                : finalScore >= 60
                ? "text-yellow-400"
                : "text-red-400";

            return (
              <Link
                key={score.id}
                href={`/dashboard/evaluation/${interview?.id}`}
                className="block group"
              >
                <Card
                  hover
                  className="p-5 flex items-center justify-between gap-4 group-hover:border-violet-500/40 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold">
                          {interview?.interview_type ?? "Interview"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {interview?.difficulty}
                        </span>
                        {interview?.company && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {interview.company}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs">
                        <Calendar className="w-3 h-3" />
                        {date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Mini score preview */}
                    <div className="hidden sm:grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: "Communication", value: score.communication },
                        { label: "Technical", value: score.technical },
                        { label: "Grammar", value: score.grammar },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div className="text-sm font-bold text-white">{value ?? "—"}</div>
                          <div className="text-[10px] text-slate-500">{label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-black ${scoreColor}`}>
                        {finalScore}
                        <span className="text-sm text-slate-500 font-normal">/100</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Final Score</div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-violet-400 transition-colors" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
