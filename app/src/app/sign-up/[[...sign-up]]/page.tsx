import { SignUp } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="blob w-[500px] h-[500px] -top-20 -right-20 opacity-20"
          style={{ background: "#7c3aed" }}
        />
        <div
          className="blob w-[400px] h-[400px] -bottom-20 -left-20 opacity-20"
          style={{ background: "#ec4899", animationDelay: "-4s" }}
        />
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/40 group-hover:shadow-violet-500/60 transition-shadow">
          <Zap className="w-5 h-5 text-white" fill="white" />
        </div>
        <span className="text-xl font-bold gradient-text">InterviewAI</span>
      </Link>

      {/* Clerk SignUp component */}
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#7c3aed",
              colorBackground: "#0a0f1e",
              colorText: "#f8fafc",
              colorTextSecondary: "#94a3b8",
              colorInputBackground: "rgba(255,255,255,0.05)",
              colorInputText: "#f8fafc",
              borderRadius: "12px",
            },
          }}
        />
      </div>
    </main>
  );
}
