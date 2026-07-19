"use client";

import Link from "next/link";
import {
  Brain,
  FileText,
  Code2,
  Mic,
  Building2,
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  Trophy,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { SignUpButton } from "@clerk/nextjs";

/* ─── Data ─────────────────────────────────────────────────── */
const features = [
  {
    icon: Brain,
    title: "AI Mock Interviews",
    desc: "Real-time AI-powered HR, Technical, Behavioral & Aptitude rounds with instant feedback.",
    color: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
    delay: "0ms",
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    desc: "ATS scoring, keyword matching, and AI-powered suggestions to make your resume stand out.",
    color: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
    delay: "80ms",
  },
  {
    icon: Code2,
    title: "Coding Round",
    desc: "LeetCode-style problems with live code execution. Python, Java, C++ and more.",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
    delay: "160ms",
  },
  {
    icon: Mic,
    title: "Voice Interview",
    desc: "Speak your answers naturally using your browser's microphone. No extra apps needed.",
    color: "from-pink-500 to-rose-600",
    glow: "shadow-pink-500/20",
    delay: "240ms",
  },
  {
    icon: Building2,
    title: "Company-Specific Prep",
    desc: "Tailored question banks and interview styles for Google, Amazon, TCS, Infosys & more.",
    color: "from-orange-500 to-amber-600",
    glow: "shadow-orange-500/20",
    delay: "320ms",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    desc: "Track your improvement over time with detailed charts, scores, and personalized tips.",
    color: "from-indigo-500 to-violet-600",
    glow: "shadow-indigo-500/20",
    delay: "400ms",
  },
];

const companies = [
  "Google", "Amazon", "Microsoft", "Meta", "Adobe",
  "Infosys", "TCS", "Accenture", "Wipro", "Cognizant",
];

const steps = [
  {
    step: "01",
    title: "Sign Up & Set Your Goal",
    desc: "Create your profile and tell us which company and role you're targeting.",
  },
  {
    step: "02",
    title: "Upload Your Resume",
    desc: "Get an instant ATS score and AI-powered suggestions to improve your resume.",
  },
  {
    step: "03",
    title: "Practice Mock Interviews",
    desc: "Choose your round type, difficulty, and company. Let AI ask the questions.",
  },
  {
    step: "04",
    title: "Get Detailed Feedback",
    desc: "Review scores on communication, grammar, confidence, and technical accuracy.",
  },
];

const stats = [
  { label: "Mock Interviews", value: "50K+", icon: Brain },
  { label: "Students Helped", value: "12K+", icon: Users },
  { label: "Companies Covered", value: "50+", icon: Building2 },
  { label: "Avg Score Improvement", value: "38%", icon: Trophy },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "SDE @ Amazon",
    text: "InterviewAI's mock interviews felt so real. I practiced 30+ sessions and got my dream offer in 6 weeks!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "CS Final Year, IIT Delhi",
    text: "The resume analyzer caught 12 issues I never noticed. My ATS score jumped from 42 to 87.",
    rating: 5,
  },
  {
    name: "Aisha Khan",
    role: "MBA Student, IIM Bangalore",
    text: "The behavioral interview module with AI feedback on grammar and confidence is game-changing.",
    rating: 5,
  },
];

/* ─── Component ────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navbar />

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="blob w-[600px] h-[600px] -top-40 -left-40"
          style={{ background: "#7c3aed" }}
        />
        <div
          className="blob w-[500px] h-[500px] top-1/2 -right-60"
          style={{ background: "#06b6d4", animationDelay: "-3s" }}
        />
        <div
          className="blob w-[400px] h-[400px] bottom-0 left-1/3"
          style={{ background: "#ec4899", animationDelay: "-6s" }}
        />
      </div>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium mb-8 animate-fade-in-up"
          style={{ animationDelay: "0ms", animationFillMode: "both" }}
        >
          <Zap className="w-3.5 h-3.5" fill="currentColor" />
          Powered by Groq AI — Blazing Fast Responses
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 animate-fade-in-up"
          style={{ animationDelay: "100ms", animationFillMode: "both" }}
        >
          Ace Every Interview
          <br />
          <span className="gradient-text">with AI at Your Side</span>
        </h1>

        {/* Sub-headline */}
        <p
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "200ms", animationFillMode: "both" }}
        >
          AI mock interviews, resume analysis, coding rounds, voice practice, and
          company-specific prep — all in one platform. From campus to career.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "300ms", animationFillMode: "both" }}
        >
          <SignUpButton mode="modal">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Start Practicing Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </SignUpButton>
          <Link href="#features">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              See All Features
            </Button>
          </Link>
        </div>

        {/* Trust line */}
        <div
          className="flex items-center justify-center gap-6 mt-10 text-sm text-slate-500 animate-fade-in-up"
          style={{ animationDelay: "400ms", animationFillMode: "both" }}
        >
          {["No credit card", "Free to start", "50+ companies"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="relative py-12 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              <div className="text-3xl sm:text-4xl font-black gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Everything you need
          </p>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            One Platform, Complete{" "}
            <span className="gradient-text">Interview Prep</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From your first mock interview to your final offer letter &mdash; we&apos;ve got every stage covered.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="animate-fade-in-up"
              style={{ animationDelay: f.delay, animationFillMode: "both" }}
            >
              <Card
                variant="glass"
                hover
                className={`p-6 h-full cursor-pointer group shadow-xl ${f.glow}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-violet-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPANIES ── */}
      <section id="companies" className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-slate-500 text-sm uppercase tracking-widest mb-3">
              Prepare for interviews at
            </p>
            <h2 className="text-3xl sm:text-4xl font-black">
              Top <span className="gradient-text">Companies</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {companies.map((company, i) => (
              <div
                key={company}
                className="px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 text-sm font-medium hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300 transition-all duration-200 cursor-pointer hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-cyan-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="text-4xl sm:text-5xl font-black">
            Get Started in{" "}
            <span className="gradient-text">4 Steps</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className="relative animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%-12px)] w-6 h-px bg-gradient-to-r from-violet-500/50 to-transparent z-10" />
              )}
              <Card variant="glass" hover className="p-6 h-full">
                <div className="text-5xl font-black gradient-text mb-4 opacity-40 font-code">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-black">
            Students <span className="gradient-text">Love It</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
            >
              <Card variant="glass" hover className="p-6 h-full">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{t.role}</div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Card
            variant="gradient"
            glow
            className="p-12 sm:p-16 gradient-border"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Ready to Land Your{" "}
              <span className="gradient-text">Dream Job?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Join 12,000+ students already preparing smarter with InterviewAI.
            </p>
            <SignUpButton mode="modal">
              <Button variant="primary" size="lg">
                Start for Free Today
                <ArrowRight className="w-5 h-5" />
              </Button>
            </SignUpButton>
          </Card>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative border-t border-white/[0.06] py-10 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" fill="white" />
          </div>
          <span className="font-bold gradient-text">InterviewAI</span>
        </div>
        <p className="text-slate-600 text-sm">
          © 2025 InterviewAI. Built with Next.js, Groq AI & ❤️
        </p>
      </footer>
    </main>
  );
}
