"use client";
import { Mic, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function VoicePage() {
  const router = useRouter();
  
  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-white mb-2">Voice <span className="gradient-text">Interview</span></h1>
      <p className="text-slate-400 mb-8">Speak your answers using your browser&apos;s microphone.</p>
      <Card variant="gradient" glow className="p-10 text-center">
        <Mic className="w-16 h-16 mx-auto mb-4 text-pink-400" />
        <h2 className="text-2xl font-bold text-white mb-2">Voice Mode is Live!</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
          We have integrated the Web Speech API directly into the core Mock Interview experience. 
          You can now toggle Voice Mode ON at the start of any interview to hear the AI speak and answer using your microphone.
        </p>
        <Button onClick={() => router.push('/dashboard/interview')} variant="primary" className="mx-auto">
          Start an Interview
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>
    </div>
  );
}
