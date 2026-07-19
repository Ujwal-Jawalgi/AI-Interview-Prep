"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, X, Play, Target, Briefcase } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { startInterview } from "@/actions/interview";

const COMPANIES = [
  { id: "Google", name: "Google", desc: "Rigorous DSA, Scalability & Optimal Complexity", color: "text-blue-400" },
  { id: "Amazon", name: "Amazon", desc: "Leadership Principles & Customer Obsession", color: "text-orange-400" },
  { id: "Microsoft", name: "Microsoft", desc: "Problem Solving & System Design", color: "text-emerald-400" },
  { id: "Adobe", name: "Adobe", desc: "DSA, Memory Management & Past Projects", color: "text-red-400" },
  { id: "Infosys", name: "Infosys", desc: "Fresher IT Fundamentals & SDLC", color: "text-cyan-400" },
  { id: "TCS", name: "TCS", desc: "Standard Aptitude & Basic Programming", color: "text-purple-400" },
];

export default function CompaniesPage() {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<typeof COMPANIES[0] | null>(null);
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [type, setType] = useState("Technical");
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    try {
      const id = await startInterview(type, difficulty, selectedCompany.name);
      router.push(`/dashboard/interview/${id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to start company interview.");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Company-Specific <span className="gradient-text">Prep</span></h1>
        <p className="text-slate-400">Tailored interview styles for top tech companies. Choose a company to configure your mock interview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMPANIES.map((company) => (
          <motion.div
            key={company.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCompany(company)}
          >
            <Card variant="glass" hover className="p-6 cursor-pointer h-full border border-white/[0.05]">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-[#0d1224] border border-white/[0.1] flex items-center justify-center ${company.color}`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{company.name}</h3>
              </div>
              <p className="text-sm text-slate-400">{company.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Setup Modal */}
      <AnimatePresence>
        {selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedCompany(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
            >
              <Card variant="solid" className="p-6 border-white/[0.1] shadow-2xl">
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-lg bg-[#0d1224] border border-white/[0.1] flex items-center justify-center ${selectedCompany.color}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedCompany.name} Interview</h2>
                    <p className="text-xs text-slate-400">Configure parameters</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-violet-400" />
                      Interview Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-[#050818] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="Behavioral">Behavioral / HR</option>
                      <option value="Technical">Technical</option>
                      <option value="System Design">System Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-[#050818] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="Beginner">Beginner (Fresher)</option>
                      <option value="Intermediate">Intermediate (Mid-Level)</option>
                      <option value="Advanced">Advanced (Senior)</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={handleStart} 
                  isLoading={isLoading}
                  className="w-full"
                >
                  {!isLoading && <Play className="w-4 h-4 mr-2" />}
                  {isLoading ? "Preparing Environment..." : "Start Interview"}
                </Button>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
