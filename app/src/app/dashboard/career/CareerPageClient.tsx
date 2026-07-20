"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Sparkles,
  Loader2,
  Briefcase,
  BookOpen,
  Wrench,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Trophy,
  Brain,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { generateCareerRecommendation } from "@/actions/career";
import type { CareerRecommendation } from "@/lib/career/groq-career";

interface CareerPageClientProps {
  initialData: CareerRecommendation | null;
  totalInterviews: number;
  avgScore: number;
}

const roleColors = [
  "from-violet-500 to-purple-600 shadow-violet-500/20",
  "from-cyan-500 to-blue-600 shadow-cyan-500/20",
  "from-emerald-500 to-teal-600 shadow-emerald-500/20",
  "from-orange-500 to-amber-600 shadow-orange-500/20",
  "from-pink-500 to-rose-600 shadow-pink-500/20",
];

const skillColors = [
  "bg-violet-500/10 border-violet-500/20 text-violet-300",
  "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
  "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  "bg-orange-500/10 border-orange-500/20 text-orange-300",
  "bg-pink-500/10 border-pink-500/20 text-pink-300",
  "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
];

export default function CareerPageClient({
  initialData,
  totalInterviews,
  avgScore,
}: CareerPageClientProps) {
  const [data, setData] = useState<CareerRecommendation | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateCareerRecommendation();
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to generate recommendations.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const hasData = !!data;

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">
            AI Career <span className="gradient-text">Advice</span>
          </h1>
          <p className="text-slate-400">
            Personalized role recommendations, skill gaps, and learning
            resources — generated from your actual interview performance.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleGenerate}
          disabled={loading}
          className="flex-shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : hasData ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Advice
            </>
          )}
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{totalInterviews}</div>
            <div className="text-xs text-slate-500">Interviews Done</div>
          </div>
        </Card>
        <Card variant="glass" className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{avgScore > 0 ? avgScore : "—"}</div>
            <div className="text-xs text-slate-500">Avg Score</div>
          </div>
        </Card>
        <Card
          variant="glass"
          className="p-4 col-span-2 sm:col-span-1 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              {hasData ? "Advice Ready" : "Not Generated"}
            </div>
            <div className="text-xs text-slate-500">
              {hasData ? "Click Regenerate to refresh" : "Hit Generate to start"}
            </div>
          </div>
        </Card>
      </div>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-violet-500/30">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <p className="text-white font-semibold text-lg">
              AI is analyzing your profile…
            </p>
            <p className="text-slate-400 text-sm text-center max-w-xs">
              Groq is reviewing your interview scores and resume data to craft
              personalized recommendations.
            </p>
          </motion.div>
        )}

        {!loading && !hasData && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card variant="gradient" glow className="p-12 text-center">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-amber-400 opacity-70" />
              <h2 className="text-xl font-bold text-white mb-2">
                Your AI Career Roadmap Awaits
              </h2>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                {totalInterviews === 0
                  ? "Complete at least one mock interview first, then generate your personalized career advice."
                  : "Click 'Generate Advice' to get AI-powered role recommendations, skill gaps, and curated learning resources based on your performance."}
              </p>
              {totalInterviews === 0 ? (
                <a
                  href="/dashboard/interview"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Start an Interview
                  <ChevronRight className="w-4 h-4" />
                </a>
              ) : (
                <Button variant="primary" onClick={handleGenerate}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Advice
                </Button>
              )}
            </Card>
          </motion.div>
        )}

        {!loading && hasData && data && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Readiness Summary */}
            <Card variant="gradient" glow className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-2">
                    Placement Readiness Summary
                  </h2>
                  <p className="text-slate-200 leading-relaxed text-sm">
                    {data.readiness_summary}
                  </p>
                </div>
              </div>
            </Card>

            {/* Recommended Roles */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-bold text-white">
                  Recommended Job Roles
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.recommended_roles.map((role, i) => (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Card
                      variant="glass"
                      hover
                      className={`p-5 shadow-xl ${roleColors[i % roleColors.length].split(" ").slice(2).join(" ")}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[i % roleColors.length].split(" ").slice(0, 2).join(" ")} flex items-center justify-center mb-3 shadow-lg`}
                      >
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-sm leading-snug">
                        {role}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Recommended for you
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Skills & Resources Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Suggested Skills */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">
                    Skills to Learn Next
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.suggested_skills.map((skill, i) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium ${skillColors[i % skillColors.length]}`}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </Card>

              {/* Learning Resources */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-bold text-white">
                    Learning Resources
                  </h2>
                </div>
                <div className="space-y-3">
                  {data.learning_resources.map((res, i) => (
                    <motion.a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-cyan-500/5 hover:border-cyan-500/20 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors flex-1 truncate">
                        {res.name}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                    </motion.a>
                  ))}
                </div>
              </Card>
            </div>

            {/* Regen CTA */}
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-400 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate recommendations
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
