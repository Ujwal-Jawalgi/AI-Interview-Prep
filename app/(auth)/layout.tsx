import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a14] relative p-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/" className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500 mb-8 z-10">
        <BrainCircuit className="text-indigo-500 w-8 h-8" />
        <span>PrepAI</span>
      </Link>

      <div className="w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}
