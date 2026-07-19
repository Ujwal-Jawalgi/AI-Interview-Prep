"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BrainCircuit, Briefcase, ChevronRight, Loader2, Target } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { startInterview } from "@/actions/interview";

const INTERVIEW_TYPES = [
  { id: "HR", label: "HR Interview", icon: Briefcase },
  { id: "Technical", label: "Technical Interview", icon: BrainCircuit },
  { id: "Behavioral", label: "Behavioral Interview", icon: Target },
  { id: "Aptitude", label: "Aptitude Test", icon: BrainCircuit },
  { id: "Coding", label: "Coding Interview", icon: Code2 },
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Code2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export default function InterviewConfigPage() {
  const router = useRouter();
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !difficulty) {
      setError("Please select both Interview Type and Difficulty.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const interviewId = await startInterview(type, difficulty, company);
      router.push(`/dashboard/interview/${interviewId}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to start interview.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configure Mock Interview</h1>
        <p className="text-slate-400">Set up your AI-powered interview environment.</p>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleStart} className="space-y-8">
          {/* Interview Type */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-300">Interview Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    type === t.id
                      ? "border-violet-500 bg-violet-500/10 text-white"
                      : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <t.icon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-300">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`p-3 rounded-xl border transition-all text-sm font-medium ${
                    difficulty === d
                      ? "border-violet-500 bg-violet-500/10 text-white"
                      : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Company (Optional) */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-300">Target Company (Optional)</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Amazon, TCS..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20"
            >
              {error}
            </motion.div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !type || !difficulty}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  Start Interview
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
