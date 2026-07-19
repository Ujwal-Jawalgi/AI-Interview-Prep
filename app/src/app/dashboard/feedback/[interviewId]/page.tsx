import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import {
  ChevronLeft, CheckCircle2, AlertCircle, Lightbulb,
  BookOpen, HelpCircle, Building2, Trophy, FileText,
  TrendingUp, Target, Star, ArrowRight,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import type { ElementType } from "react";

const COMPANY_COLORS: Record<string, { text: string; bg: string; border: string; bar: string }> = {
  Google:    { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    bar: "bg-blue-500" },
  Amazon:    { text: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20",  bar: "bg-orange-500" },
  Microsoft: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500" },
  Adobe:     { text: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     bar: "bg-red-500" },
  Infosys:   { text: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    bar: "bg-cyan-500" },
  TCS:       { text: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20",  bar: "bg-purple-500" },
};

function ReadinessBar({ company, score }: { company: string; score: number }) {
  const colors = COMPANY_COLORS[company] ?? {
    text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", bar: "bg-violet-500",
  };
  const barColor = score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  const label = score >= 75 ? "Ready" : score >= 50 ? "Improving" : "Needs Work";
  const labelColor = score >= 75 ? "text-emerald-400" : score >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <div className={`rounded-xl p-4 border ${colors.bg} ${colors.border}`}>
      <div className="flex justify-between items-center mb-1">
        <span className={`font-bold text-sm ${colors.text}`}>{company}</span>
        <span className={`text-xs font-semibold ${labelColor}`}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-slate-800">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-white font-black text-sm w-10 text-right">{score}%</span>
      </div>
    </div>
  );
}

function ListSection({
  title, icon: Icon, iconClass, bgClass, borderClass, items, numbered = true,
}: {
  title: string;
  icon: ElementType;
  iconClass: string;
  bgClass: string;
  borderClass: string;
  items: string[];
  numbered?: boolean;
}) {
  return (
    <Card className={`p-6 ${bgClass} ${borderClass}`}>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconClass}`} />
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
            <span
              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${iconClass} bg-current/10 text-white opacity-80`}
            >
              {numbered ? i + 1 : "•"}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default async function FeedbackReportPage({ params }: { params: { interviewId: string } }) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  // Fetch the feedback report
  const { data: report, error } = await supabaseAdmin
    .from("feedback_reports")
    .select("*, interviews(id, interview_type, difficulty, company, created_at)")
    .eq("interview_id", params.interviewId)
    .maybeSingle();

  // Fetch the score (to show even if report is missing)
  const { data: score } = await supabaseAdmin
    .from("scores")
    .select("final_score, communication, technical, grammar, confidence, logical_thinking, problem_solving")
    .eq("interview_id", params.interviewId)
    .maybeSingle();

  // Fetch the interview metadata (fallback if report join fails)
  const { data: interview } = await supabaseAdmin
    .from("interviews")
    .select("id, interview_type, difficulty, company, created_at")
    .eq("id", params.interviewId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching report:", error);
  }

  const interviewData = (report?.interviews as {
    interview_type: string;
    difficulty: string;
    company: string | null;
    created_at: string;
  } | null) ?? interview;

  // No interview at all — show 404
  if (!interviewData) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-red-400">Interview Not Found</h1>
        <p className="text-slate-400 mt-2">This interview does not exist or you don&apos;t have access to it.</p>
        <Link href="/dashboard/feedback" className="text-violet-400 mt-4 inline-block hover:underline">
          Back to Reports
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(interviewData.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Score exists but report doesn't — show a "report is being generated" page
  if (!report && score) {
    return (
      <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <Link href="/dashboard/feedback" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" /> All Reports
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">
            Feedback <span className="gradient-text">Report</span>
          </h1>
          <p className="text-slate-400">
            {interviewData.difficulty} {interviewData.interview_type} Interview
            {interviewData.company ? ` — ${interviewData.company}` : ""} · {formattedDate}
          </p>
        </div>

        {/* Score Summary (show even without report) */}
        {score && (
          <Card className="p-6 border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Your Scores
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: "Final Score", value: score.final_score, highlight: true },
                { label: "Communication", value: score.communication },
                { label: "Technical", value: score.technical },
                { label: "Grammar", value: score.grammar },
                { label: "Confidence", value: score.confidence },
                { label: "Logical", value: score.logical_thinking },
                { label: "Problem Solving", value: score.problem_solving },
              ].map(({ label, value, highlight }) => (
                <div key={label} className={`rounded-xl p-3 ${highlight ? "bg-violet-500/10 border border-violet-500/20" : "bg-slate-900/50"}`}>
                  <div className={`text-2xl font-black ${highlight ? "text-violet-400" : "text-white"}`}>
                    {value ?? "—"}
                    <span className="text-slate-500 text-xs font-normal">/100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card variant="gradient" glow className="p-10 text-center">
          <FileText className="w-14 h-14 mx-auto mb-4 text-indigo-400 opacity-60" />
          <h2 className="text-xl font-bold text-white mb-2">Report Generating...</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Your AI feedback report is being generated. This happens automatically after each interview completes.
            Try refreshing this page in a moment.
          </p>
          <Link
            href={`/dashboard/evaluation/${params.interviewId}`}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            View Score Breakdown
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>
    );
  }

  // No report AND no score — truly not found
  if (!report) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-red-400">Report Not Found</h1>
        <p className="text-slate-400 mt-2">
          We couldn&apos;t find the feedback report for this interview. Complete the interview first to generate one.
        </p>
        <Link href="/dashboard/feedback" className="text-violet-400 mt-4 inline-block hover:underline">
          Back to Reports
        </Link>
      </div>
    );
  }

  const companyReadiness = report.company_readiness as Record<string, number> | null;

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Link
            href="/dashboard/feedback"
            className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> All Reports
          </Link>
          <span className="text-slate-700">|</span>
          <Link
            href={`/dashboard/evaluation/${params.interviewId}`}
            className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-semibold"
          >
            <TrendingUp className="w-4 h-4" />
            View Score Breakdown
          </Link>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">
          Feedback <span className="gradient-text">Report</span>
        </h1>
        <p className="text-slate-400">
          {interviewData.difficulty} {interviewData.interview_type} Interview
          {interviewData.company ? ` — ${interviewData.company}` : ""} · {formattedDate}
        </p>
      </div>

      {/* ── Executive Summary ── */}
      <Card variant="gradient" glow className="p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full -mr-16 -mt-16" />
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-violet-400" />
          Executive Summary
        </h2>
        <p className="text-slate-200 leading-relaxed text-base relative z-10">
          {report.executive_summary}
        </p>
      </Card>

      {/* ── Overall Score Bar (if available) ── */}
      {score && (
        <Card className="p-6 border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Performance Scores
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 text-center">
            {[
              { label: "Final", value: score.final_score, color: "text-violet-400" },
              { label: "Communication", value: score.communication, color: "text-blue-400" },
              { label: "Technical", value: score.technical, color: "text-emerald-400" },
              { label: "Grammar", value: score.grammar, color: "text-orange-400" },
              { label: "Confidence", value: score.confidence, color: "text-rose-400" },
              { label: "Logical", value: score.logical_thinking, color: "text-cyan-400" },
              { label: "Problem Solving", value: score.problem_solving, color: "text-yellow-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-900/60 rounded-xl p-3">
                <div className={`text-xl font-black ${color}`}>
                  {value ?? "—"}<span className="text-slate-500 text-xs font-normal">/100</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Strengths & Weaknesses ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-emerald-500/20 bg-emerald-500/5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Strengths
          </h3>
          <ul className="space-y-3">
            {(report.strengths as string[]).map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 border-red-500/20 bg-red-500/5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            Areas to Improve
          </h3>
          <ul className="space-y-3">
            {(report.weaknesses as string[]).map((w, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ── Improvement Tips & Recommended Topics ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListSection
          title="Improvement Tips"
          icon={Lightbulb}
          iconClass="text-yellow-400"
          bgClass="bg-yellow-500/5"
          borderClass="border-yellow-500/20"
          items={report.improvement_tips as string[]}
        />
        <ListSection
          title="Recommended Topics to Study"
          icon={BookOpen}
          iconClass="text-cyan-400"
          bgClass="bg-cyan-500/5"
          borderClass="border-cyan-500/20"
          items={report.recommended_topics as string[]}
        />
      </div>

      {/* ── Practice Questions ── */}
      <Card className="p-6 border-violet-500/20 bg-violet-500/5">
        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-violet-400" />
          Sample Practice Questions
        </h3>
        <div className="space-y-3">
          {(report.practice_questions as string[]).map((q, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/30 transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                Q{i + 1}
              </span>
              <p className="text-slate-300 text-sm leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Company Readiness ── */}
      {companyReadiness && Object.keys(companyReadiness).length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-400" />
            Expected Company Readiness
          </h3>
          <p className="text-slate-400 text-sm mb-5">
            AI-estimated readiness percentages based on your performance compared to typical hiring bars.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(companyReadiness).map(([company, readinessScore]) => (
              <ReadinessBar key={company} company={company} score={readinessScore} />
            ))}
          </div>
        </div>
      )}

      {/* ── CTA Footer ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 text-center border-slate-800 hover:border-violet-500/30 transition-all group">
          <Target className="w-8 h-8 text-violet-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-white font-bold mb-1">Practice Again</h3>
          <p className="text-slate-400 text-xs mb-4">Apply the feedback and take another mock interview.</p>
          <Link
            href="/dashboard/interview"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Start Interview <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>

        <Card className="p-6 text-center border-slate-800 hover:border-emerald-500/30 transition-all group">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-white font-bold mb-1">Track Progress</h3>
          <p className="text-slate-400 text-xs mb-4">See how your scores have improved over time.</p>
          <Link
            href="/dashboard/progress"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            View Progress <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
