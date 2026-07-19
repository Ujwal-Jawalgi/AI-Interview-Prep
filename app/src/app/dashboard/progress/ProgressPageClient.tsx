"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Brain, Star, Target, Calendar, Zap, ArrowRight, TrendingUp, Activity } from "lucide-react";
import Card from "@/components/ui/Card";
import {
  InterviewTrendChart,
  ResumeScoreChart,
  DailyPracticeChart,
  WeeklyProgressChart,
  SkillRadarChart,
  ScoreDistributionChart,
} from "@/components/dashboard/ProgressCharts";

interface Props {
  labels: string[];
  interviewScores: number[];
  resumeScores: number[];
  practiceMinutes: number[];
  skillAvgs: {
    communication: number;
    technical: number;
    grammar: number;
    confidence: number;
    logical: number;
    problemSolving: number;
  };
  scoreDistribution: { excellent: number; good: number; needsWork: number };
  stats: {
    totalPracticeTime: number;
    avgInterviewScore: number;
    bestScore: number;
    activeDays: number;
    totalInterviews: number;
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
};

export default function ProgressPageClient({
  labels, interviewScores, resumeScores, practiceMinutes,
  skillAvgs, scoreDistribution, stats,
}: Props) {
  const hasAnyData = labels.length > 0 || stats.totalInterviews > 0;

  const topStats = [
    { label: "Total Interviews", value: stats.totalInterviews.toString(), icon: Brain, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Avg Score", value: stats.avgInterviewScore > 0 ? `${stats.avgInterviewScore}%` : "—", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Best Score", value: stats.bestScore > 0 ? `${stats.bestScore}%` : "—", icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Practice Time", value: stats.totalPracticeTime > 0 ? `${stats.totalPracticeTime}m` : "—", icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
    { label: "Active Days", value: stats.activeDays > 0 ? `${stats.activeDays}` : "—", icon: Calendar, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">
              Progress <span className="gradient-text">Tracking</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Charts and analytics tracking your improvement across all modules (last 30 days).
            </p>
          </div>
          <Link
            href="/dashboard/interview"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Zap className="w-4 h-4" /> Practice Now
          </Link>
        </div>
      </motion.div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {topStats.map((stat, i) => (
          <motion.div key={stat.label} variants={fadeUp} custom={i} initial="hidden" animate="show">
            <Card className={`p-5 border ${stat.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── No data CTA ── */}
      {!hasAnyData && (
        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show">
          <Card variant="gradient" glow className="p-12 text-center">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-teal-400 opacity-50" />
            <h2 className="text-xl font-bold text-white mb-2">No Progress Data Yet</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Complete your first mock interview to start seeing charts, trends, and skill breakdowns here.
            </p>
            <Link
              href="/dashboard/interview"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Start Interview <ArrowRight className="w-4 h-4" />
            </Link>
          </Card>
        </motion.div>
      )}

      {/* ── Charts Grid ── */}
      {hasAnyData && (
        <>
          {/* Row 1 — Interview Trend + Resume History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show">
              <Card variant="glass" className="p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-400" /> Interview Score Trend
                </h2>
                <InterviewTrendChart labels={labels} scores={interviewScores} />
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} custom={6} initial="hidden" animate="show">
              <Card variant="glass" className="p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" /> Resume Score History
                </h2>
                <ResumeScoreChart labels={labels} scores={resumeScores} />
              </Card>
            </motion.div>
          </div>

          {/* Row 2 — Weekly Progress (full-width) */}
          <motion.div variants={fadeUp} custom={7} initial="hidden" animate="show">
            <Card variant="glass" className="p-6">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Weekly Progress Overview
              </h2>
              <WeeklyProgressChart
                labels={labels}
                interviewScores={interviewScores}
                resumeScores={resumeScores}
                practiceMinutes={practiceMinutes}
              />
            </Card>
          </motion.div>

          {/* Row 3 — Daily Practice + Score Distribution + Skill Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={fadeUp} custom={8} initial="hidden" animate="show">
              <Card variant="glass" className="p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400" /> Daily Practice Time
                </h2>
                <DailyPracticeChart labels={labels} minutes={practiceMinutes} />
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} custom={9} initial="hidden" animate="show">
              <Card variant="glass" className="p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Score Distribution
                </h2>
                <ScoreDistributionChart
                  excellent={scoreDistribution.excellent}
                  good={scoreDistribution.good}
                  needsWork={scoreDistribution.needsWork}
                />
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} custom={10} initial="hidden" animate="show">
              <Card variant="glass" className="p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-400" /> Skill Breakdown
                </h2>
                <SkillRadarChart skills={skillAvgs} />
              </Card>
            </motion.div>
          </div>

          {/* Row 4 — Skill Detail Table */}
          {(skillAvgs.communication > 0 || skillAvgs.technical > 0) && (
            <motion.div variants={fadeUp} custom={11} initial="hidden" animate="show">
              <Card variant="glass" className="p-6">
                <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Average Skill Scores
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: "Communication", value: skillAvgs.communication, color: "text-blue-400", bar: "bg-blue-500" },
                    { label: "Technical", value: skillAvgs.technical, color: "text-emerald-400", bar: "bg-emerald-500" },
                    { label: "Grammar", value: skillAvgs.grammar, color: "text-orange-400", bar: "bg-orange-500" },
                    { label: "Confidence", value: skillAvgs.confidence, color: "text-rose-400", bar: "bg-rose-500" },
                    { label: "Logical", value: skillAvgs.logical, color: "text-cyan-400", bar: "bg-cyan-500" },
                    { label: "Problem Solving", value: skillAvgs.problemSolving, color: "text-violet-400", bar: "bg-violet-500" },
                  ].map(({ label, value, color, bar }) => (
                    <div key={label} className="text-center">
                      <div className={`text-2xl font-black ${color}`}>
                        {value > 0 ? value : "—"}
                        {value > 0 && <span className="text-slate-500 text-xs font-normal">/100</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 mb-2 leading-tight">{label}</div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${bar} transition-all duration-700`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </>
      )}

      {/* ── Shortcut links ── */}
      <motion.div variants={fadeUp} custom={12} initial="hidden" animate="show">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: "/dashboard/evaluation", label: "View All Evaluations", color: "text-violet-400" },
            { href: "/dashboard/feedback", label: "Feedback Reports", color: "text-indigo-400" },
            { href: "/dashboard/interview", label: "New Mock Interview", color: "text-emerald-400" },
            { href: "/dashboard/resume", label: "Analyze Resume", color: "text-cyan-400" },
          ].map(({ href, label, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between gap-2 bg-slate-900/60 border border-slate-800 hover:border-slate-600 rounded-xl px-4 py-3 transition-colors group"
            >
              <span className={`text-sm font-medium ${color}`}>{label}</span>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
