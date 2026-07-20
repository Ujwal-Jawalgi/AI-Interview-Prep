"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { completeOnboarding } from "@/actions/user";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { GraduationCap, BookOpen, Loader2 } from "lucide-react";
import Image from "next/image";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#050818] flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob w-[500px] h-[500px] -top-40 -left-40 bg-violet-600/20" />
        <div className="blob w-[400px] h-[400px] bottom-0 right-0 bg-cyan-500/10" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-white/[0.06] bg-[#070d1c]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Image 
            src="/logo.svg" 
            alt="PrepMind" 
            width={32} 
            height={32} 
            className="w-8 h-8 rounded-lg shadow-lg shadow-violet-500/30"
          />
          <span className="font-bold gradient-text text-lg">PrepMind</span>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-4">
        <Card variant="glass" glow className="w-full max-w-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-3">Welcome Aboard! 👋</h1>
            <p className="text-slate-400">
              Let&apos;s personalize your experience. Where are you studying?
            </p>
          </div>

          <form
            action={async (formData) => {
              setLoading(true);
              try {
                await completeOnboarding(formData);
              } catch (error) {
                console.error(error);
                setLoading(false);
                // Optionally show toast error here
              }
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label htmlFor="college" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-violet-400" />
                College / University
              </label>
              <input
                id="college"
                name="college"
                required
                placeholder="e.g. IIT Delhi"
                className="w-full px-4 py-3 bg-[#0d1224] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="branch" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Branch / Major
              </label>
              <input
                id="branch"
                name="branch"
                required
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-3 bg-[#0d1224] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
