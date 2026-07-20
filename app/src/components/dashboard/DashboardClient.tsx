"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  FileText,
  Code2,
  Mic,
  Building2,
  Star,
  Clock,
  Target,
  Zap,
  ArrowRight,
  Activity,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressChart from "./ProgressChart";
import UpcomingSchedule from "./UpcomingSchedule";
import CareerRecommendationModule from "./CareerRecommendationModule";
import type { CareerRecommendation } from "@/lib/career/groq-career";

export interface DashboardData {
  firstName: string;
  totalInterviews: number;
  avgScore: number;
  totalPracticeTime: number;
  resumeScore: number;
  chartData: {
    labels: string[];
    interviewScores: number[];
    resumeScores: number[];
  };
  strengths: string[];
  weaknesses: string[];
  careerRecommendation: CareerRecommendation | null;
}

const modules = [
  {
    href: "/dashboard/interview",
    icon: Brain,
    label: "AI Mock Interview",
    desc: "Start an HR, Technical, or Behavioral round",
    color: "from-violet-500 to-purple-600",
    badge: "Popular",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  {
    href: "/dashboard/resume",
    icon: FileText,
    label: "Resume Analyzer",
    desc: "Get ATS score and AI improvement tips",
    color: "from-cyan-500 to-blue-600",
    badge: null,
    badgeColor: "",
  },
  {
    href: "/dashboard/coding",
    icon: Code2,
    label: "Coding Round",
    desc: "Live code execution with LeetCode-style problems",
    color: "from-emerald-500 to-teal-600",
    badge: "New",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/dashboard/voice",
    icon: Mic,
    label: "Voice Interview",
    desc: "Speak your answers using your browser mic",
    color: "from-pink-500 to-rose-600",
    badge: null,
    badgeColor: "",
  },
  {
    href: "/dashboard/companies",
    icon: Building2,
    label: "Company-Specific Prep",
    desc: "Google, Amazon, TCS, Infosys and 45+ more",
    color: "from-orange-500 to-amber-600",
    badge: null,
    badgeColor: "",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06 },
  }),
};

export default function DashboardClient({ data }: { data: DashboardData }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const quickStats = [
    { label: "Interviews Done", value: data.totalInterviews.toString(), icon: Brain, color: "text-violet-400" },
    { label: "Avg Score", value: data.avgScore > 0 ? `${data.avgScore}%` : "—", icon: Star, color: "text-amber-400" },
    { label: "Practice Time", value: `${data.totalPracticeTime} min`, icon: Clock, color: "text-cyan-400" },
    { label: "Resume Score", value: data.resumeScore > 0 ? `${data.resumeScore}%` : "—", icon: Target, color: "text-emerald-400" },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">
              Your Dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              {greeting} <span className="gradient-text">, {data.firstName}</span>👋
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Here is your progress.
            </p>
          </div>

          <Link href="/dashboard/interview">
            <Button variant="primary" size="md">
              <Zap className="w-4 h-4" />
              Start Interview
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div key={stat.label} variants={fadeUp} custom={i} initial="hidden" animate="show">
            <Card variant="glass" hover={false} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                  {stat.label}
                </span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mb-10">
        <CareerRecommendationModule initialData={data.careerRecommendation} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* ── Main Chart Area ── */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="lg:col-span-2 space-y-6">
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-violet-400" />
                Performance Over Time
              </h2>
            </div>
            <ProgressChart data={data.chartData} />
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="glass" className="p-5">
              <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" /> Top Strengths
              </h3>
              {data.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {data.strengths.map(s => (
                    <li key={s} className="text-slate-300 text-sm bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20">{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm">Not enough data to determine strengths.</p>
              )}
            </Card>

            <Card variant="glass" className="p-5">
              <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400" /> Needs Improvement
              </h3>
              {data.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {data.weaknesses.map(w => (
                    <li key={w} className="text-slate-300 text-sm bg-rose-500/10 px-3 py-1.5 rounded-md border border-rose-500/20">{w}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm">Not enough data to determine weaknesses.</p>
              )}
            </Card>
          </div>
        </motion.div>

        {/* ── Sidebar (Schedule) ── */}

      </div>

      {/* ── Modules Grid ── */}
      <motion.div variants={fadeUp} custom={6} initial="hidden" animate="show" className="pt-6">
        <h2 className="text-xl font-bold text-white mb-4">Practice Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {modules.map((mod) => (
            <Link key={mod.href} href={mod.href} className="block group">
              <Card variant="glass" hover className="p-4 h-full cursor-pointer flex flex-col">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <mod.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{mod.label}</h3>
                <p className="text-slate-400 text-xs flex-1">{mod.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
