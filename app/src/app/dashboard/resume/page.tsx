"use client";

import { useState, useRef } from "react";
import { FileText, UploadCloud, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { analyzeResume, ResumeAnalysisResult } from "@/actions/resume";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("resume", file);
      
      const analysisResult = await analyzeResume(formData);
      setResult(analysisResult);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">
          Resume <span className="gradient-text">Analyzer</span>
        </h1>
        <p className="text-slate-400">
          Upload your resume for ATS scoring, keyword extraction, and AI-driven improvement tips.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card variant="glass" className="p-8">
              <div 
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                  isDragging ? "border-cyan-400 bg-cyan-400/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="application/pdf" 
                  className="hidden" 
                />
                
                <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-cyan-400" : "text-slate-400"}`} />
                
                {file ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-white flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      {file.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-white">
                      Drag & drop your resume here
                    </p>
                    <p className="text-sm text-slate-400">
                      Supports PDF up to 5MB
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-200">{error}</p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <Button 
                  variant="primary" 
                  size="lg" 
                  disabled={!file || isLoading}
                  onClick={handleAnalyze}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    "Analyze Resume"
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="glass" className="p-6 text-center">
                <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">ATS Score</p>
                <div className="flex items-end justify-center gap-1">
                  <span className={`text-5xl font-black ${result.atsScore >= 80 ? "text-emerald-400" : result.atsScore >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                    {result.atsScore}
                  </span>
                  <span className="text-xl text-slate-500 mb-1">/100</span>
                </div>
              </Card>
              
              <Card variant="glass" className="p-6 text-center">
                <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">Missing Sections</p>
                <div className="text-3xl font-black text-rose-400">
                  {result.missingSections.length}
                </div>
              </Card>

              <Card variant="glass" className="p-6 text-center">
                <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">Grammar Errors</p>
                <div className="text-3xl font-black text-rose-400">
                  {result.grammarErrors}
                </div>
              </Card>
            </div>

            {/* Main Feedback Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ATS Detailed Breakdown */}
              <Card variant="glass" className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ATS Rule Checks
                </h2>
                
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Sections Found</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.foundSections.map(s => (
                      <span key={s} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-xs capitalize">
                        {s}
                      </span>
                    ))}
                    {result.missingSections.map(s => (
                      <span key={s} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-full text-xs capitalize flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Tech Skills Match</h3>
                  <p className="text-xs text-slate-400 mb-2">Based on our standard tech stack keyword list.</p>
                  <div className="flex flex-wrap gap-2">
                    {result.foundSkills.slice(0, 10).map(s => (
                      <span key={s} className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-full text-xs capitalize">
                        {s}
                      </span>
                    ))}
                    {result.missingSkills.slice(0, 8).map(s => (
                      <span key={s} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-full text-xs capitalize line-through">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>

              {/* AI Qualitative Feedback */}
              <Card variant="glass" className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  AI Qualitative Feedback
                </h2>
                
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Overall Impression</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{result.overallFeedback}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Project Descriptions</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{result.projectFeedback}</p>
                </div>

                {result.grammarDetails.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-rose-400 mb-2">Grammar & Spelling</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.grammarDetails.map((g, i) => (
                        <li key={i} className="text-sm text-slate-400">{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </div>

            {/* Improvement Tips */}
            <Card variant="gradient" glow className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Top 3 Actionable Tips</h2>
              <ul className="space-y-3">
                {result.improvementTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={resetForm}>
                Analyze Another Resume
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
