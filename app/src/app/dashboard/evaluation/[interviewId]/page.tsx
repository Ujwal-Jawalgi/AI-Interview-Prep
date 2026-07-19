import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { Star, MessageSquare, Code2, PenTool, Activity, ShieldCheck, ChevronLeft, Brain, Lightbulb } from "lucide-react";
import Card from "@/components/ui/Card";
import Link from "next/link";

import { type ElementType } from "react";

function ScoreRing({ score, label, icon: Icon, colorClass }: { score: number; label: string; icon: ElementType; colorClass: string }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-white/20 transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 opacity-10 ${colorClass.replace('text-', 'bg-')}`} />
      
      <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
        {/* Background ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-800"
          />
          {/* Progress ring */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`w-5 h-5 mb-0.5 ${colorClass}`} />
          <span className="text-sm font-bold text-white">{score}%</span>
        </div>
      </div>
      <h3 className="text-slate-300 font-medium text-sm">{label}</h3>
    </Card>
  );
}

export default async function EvaluationResultPage({ params }: { params: { interviewId: string } }) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch score for this interview
  const { data: score, error } = await supabaseAdmin
    .from("scores")
    .select("*, interviews(*)")
    .eq("interview_id", params.interviewId)
    .single();

  if (error || !score) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-red-400">Evaluation Not Found</h1>
        <p className="text-slate-400 mt-2">We couldn&apos;t find the score for this interview.</p>
        <Link href="/dashboard" className="text-violet-400 mt-4 inline-block hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <span className="text-slate-700">|</span>
          <Link
            href={`/dashboard/feedback/${params.interviewId}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Star className="w-4 h-4" />
            View Full Feedback Report
          </Link>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">
          Interview <span className="gradient-text">Evaluation</span>
        </h1>
        <p className="text-slate-400">
          Detailed AI analysis for your {score.interviews.difficulty} {score.interviews.interview_type} interview
          {score.interviews.company ? ` at ${score.interviews.company}` : ""}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Final Score Card */}
        <Card variant="gradient" glow className="md:col-span-1 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-violet-500/20 flex items-center justify-center mb-4">
            <Star className="w-12 h-12 text-violet-400" />
          </div>
          <div className="text-5xl font-black text-white mb-2">
            {score.final_score}<span className="text-2xl text-slate-400">/100</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Final Score</h2>
          <p className="text-slate-400 text-sm">Overall performance rating</p>
        </Card>

        {/* Breakdown Grid — 6 categories */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <ScoreRing score={score.communication} label="Communication" icon={MessageSquare} colorClass="text-blue-400" />
          <ScoreRing score={score.technical} label="Technical" icon={Code2} colorClass="text-emerald-400" />
          <ScoreRing score={score.grammar} label="Grammar" icon={PenTool} colorClass="text-orange-400" />
          <ScoreRing score={score.confidence} label="Confidence" icon={ShieldCheck} colorClass="text-rose-400" />
          <ScoreRing score={score.logical_thinking ?? 0} label="Logical Thinking" icon={Brain} colorClass="text-cyan-400" />
          <ScoreRing score={score.problem_solving ?? 0} label="Problem Solving" icon={Lightbulb} colorClass="text-yellow-400" />
        </div>
      </div>

      {/* Text score breakdown */}
      <Card className="p-6 border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">Score Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          {[
            { label: "Confidence",       value: score.confidence },
            { label: "Communication",    value: score.communication },
            { label: "Technical",         value: score.technical },
            { label: "Grammar",           value: score.grammar },
            { label: "Logical Thinking",  value: score.logical_thinking ?? 0 },
            { label: "Problem Solving",   value: score.problem_solving ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-900/50 rounded-xl p-4">
              <div className="text-2xl font-black text-white">{value}<span className="text-slate-400 text-sm">/100</span></div>
              <div className="text-xs text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 md:p-8 border-violet-500/20 bg-violet-500/5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-violet-400" />
          AI Feedback Summary
        </h3>
        <p className="text-slate-300 leading-relaxed">
          {score.feedback || "Your performance has been evaluated. Review the metric scores above to identify your strong and weak areas."}
        </p>
      </Card>
    </div>
  );
}
