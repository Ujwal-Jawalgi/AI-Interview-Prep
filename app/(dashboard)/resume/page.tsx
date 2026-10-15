"use client";

import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, ArrowRight, Star, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ResumeAnalysis {
  overall_score: number;
  missing_skills: string[];
  weak_bullets: { original: string; improved: string }[];
  strong_points: string[];
  keyword_gaps: string[];
  ats_score: number;
  summary: string;
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractingText, setExtractingText] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }
    setFile(selectedFile);
    setAnalysis(null);
  };

  const extractTextFromPDF = async (pdfData: ArrayBuffer): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    }
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const analyzeResume = async () => {
    if (!file) return toast.error("Please upload a resume.");
    if (!targetRole) return toast.error("Please specify a target role.");

    try {
      setLoading(true);
      setExtractingText(true);
      
      // Extract Text Client-Side
      const arrayBuffer = await file.arrayBuffer();
      const text = await extractTextFromPDF(arrayBuffer);
      setExtractingText(false);

      if (!text || text.trim().length < 50) {
        throw new Error("Could not extract sufficient text from this PDF. It might be an image-based PDF.");
      }

      // Send to API
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text, targetRole })
      });

      if (!res.ok) throw new Error("Failed to analyze resume.");

      const data = await res.json();
      setAnalysis(data);
      toast.success("Analysis complete!");

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
      setExtractingText(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Resume Analyzer</h1>
        <p className="text-muted-foreground">Get AI-powered feedback on your resume to boost your interview chances.</p>
      </div>

      {!analysis ? (
        <Card className="glass-panel border-indigo-500/20">
          <CardContent className="pt-6 space-y-8">
            <div className="space-y-4">
              <Label htmlFor="targetRole" className="text-base">Target Role</Label>
              <Input 
                id="targetRole"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                className="max-w-md h-12 bg-black/20"
              />
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[300px]
                ${isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/20 hover:border-indigo-400 hover:bg-white/5"}
                ${file ? "bg-white/5 border-emerald-500/50" : ""}
              `}
            >
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {file ? (
                <>
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{file.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
                  
                  <div className="flex gap-4" onClick={e => e.stopPropagation()}>
                    <Button variant="outline" onClick={() => setFile(null)}>Remove</Button>
                    <Button onClick={analyzeResume} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 w-32">
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Analyze"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Upload your Resume</h3>
                  <p className="text-muted-foreground mb-4">Drag & drop your PDF file here, or click to browse.</p>
                  <p className="text-xs text-muted-foreground">Max file size: 5MB</p>
                </>
              )}
            </div>

            {loading && (
              <div className="text-center py-4 text-sm text-indigo-300 animate-pulse">
                {extractingText ? "Extracting text from PDF (Client-side)..." : "Analyzing with AI... This may take a moment."}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold flex items-center gap-2">
               Analysis Results for "{targetRole}"
             </h2>
             <Button onClick={() => { setAnalysis(null); setFile(null); }} variant="outline" className="border-white/20">
               Analyze Another
             </Button>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-panel text-center p-8 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/30">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Overall Match</div>
              <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400 mb-2">
                {analysis.overall_score}%
              </div>
              <Progress value={analysis.overall_score} className="h-2 max-w-[200px] mx-auto mt-4 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-violet-500" />
            </Card>
            <Card className="glass-panel text-center p-8 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">ATS Readiness</div>
              <div className="text-6xl font-black text-emerald-400 mb-2">
                {analysis.ats_score}%
              </div>
              <Progress value={analysis.ats_score} className="h-2 max-w-[200px] mx-auto mt-4 [&>div]:bg-emerald-500" />
            </Card>
          </div>

          <Card className="glass-panel border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-2 text-indigo-300">Executive Summary</h3>
              <p className="text-slate-300 leading-relaxed text-[15px]">{analysis.summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-panel border-green-500/30 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5 fill-green-400" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.strong_points.map((pt, i) => (
                    <li key={i} className="flex gap-3 text-sm text-green-100">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> {pt}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-panel border-red-500/30 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2 text-lg">
                  <X className="w-5 h-5" /> Missing Skills / Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {analysis.missing_skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium border border-red-400/30">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-red-200">
                  <span className="font-semibold text-red-300">Keyword Gaps:</span> {analysis.keyword_gaps.join(", ")}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-panel border-orange-500/30">
             <CardHeader>
               <CardTitle className="text-orange-400 flex items-center gap-2 text-lg">
                 <AlertTriangle className="w-5 h-5" /> Bullet Point Improvements
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {analysis.weak_bullets.map((wb, i) => (
                 <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                   <div className="text-sm text-red-300/80 line-through decoration-red-500/50">
                     {wb.original}
                   </div>
                   <div className="flex items-center gap-2 text-indigo-400 font-medium">
                     <ArrowRight className="w-4 h-4" /> Recommended Change:
                   </div>
                   <div className="text-[15px] text-green-400 font-medium bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                     {wb.improved}
                   </div>
                 </div>
               ))}
               {analysis.weak_bullets.length === 0 && (
                 <div className="text-muted-foreground text-center py-4">No major bullet point improvements found. Great job!</div>
               )}
             </CardContent>
          </Card>

        </motion.div>
      )}
    </div>
  );
}
