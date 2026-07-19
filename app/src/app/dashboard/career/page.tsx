"use client";
import { Lightbulb } from "lucide-react";
import Card from "@/components/ui/Card";
export default function CareerPage() {
  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-white mb-2">AI Career <span className="gradient-text">Advice</span></h1>
      <p className="text-slate-400 mb-8">Personalized career roadmap and role recommendations.</p>
      <Card variant="gradient" glow className="p-10 text-center">
        <Lightbulb className="w-16 h-16 mx-auto mb-4 text-rose-400" />
        <h2 className="text-xl font-bold text-white mb-2">Coming in Phase 11</h2>
        <p className="text-slate-400 text-sm">Groq-powered personalized career path recommendations.</p>
      </Card>
    </div>
  );
}
