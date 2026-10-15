"use client";

import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mic, FileText, BarChart3, BotMessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const features = [
    {
      icon: <BotMessageSquare className="w-8 h-8 text-indigo-400" />,
      title: "Mock Interviews",
      description: "Practice with our advanced LLM interviewer tailored to your specific tech stack and role."
    },
    {
      icon: <FileText className="w-8 h-8 text-violet-400" />,
      title: "Resume Analyzer",
      description: "Upload your resume and get immediate insights, skill gaps, and ATS optimization suggestions."
    },
    {
      icon: <Mic className="w-8 h-8 text-emerald-400" />,
      title: "Voice Mode",
      description: "Use real-time speech-to-text to practice speaking answers out loud, simulating a real call."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-rose-400" />,
      title: "Analytics",
      description: "Track your progress over time with detailed charts mapping your clarity, technical score & structure."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a14] overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Career Growth</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Master your next Interview with <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-shimmer bg-[length:200%_auto]">
              Artificial Intelligence
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Practice technical, behavioral, and HR questions in realistic mock interviews. 
            Receive real-time feedback, analytics, and perfect candidate answers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105">
                Start Practicing Now
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32 max-w-7xl mx-auto w-full"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={itemVariants} className="glass-panel p-6 hover:bg-white/10 transition-colors duration-300 group cursor-pointer">
              <div className="bg-white/5 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
