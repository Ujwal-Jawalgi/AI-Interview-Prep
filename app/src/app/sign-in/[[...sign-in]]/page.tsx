import { SignIn } from "@clerk/nextjs";

import Link from "next/link";
import { clerkAppearance } from "@/lib/clerkAppearance";
import AppFooter from "@/components/AppFooter";
import Image from "next/image";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="blob w-[500px] h-[500px] -top-20 -left-20 opacity-20"
          style={{ background: "#7c3aed" }}
        />
        <div
          className="blob w-[400px] h-[400px] -bottom-20 -right-20 opacity-20"
          style={{ background: "#06b6d4", animationDelay: "-4s" }}
        />
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <Image
          src="/logo.svg"
          alt="PrepMind"
          width={36}
          height={36}
          className="w-9 h-9 rounded-xl shadow-lg shadow-violet-500/40 group-hover:shadow-violet-500/60 transition-shadow"
        />
        <span className="text-xl font-bold gradient-text">PrepMind</span>
      </Link>

      {/* Clerk SignIn component */}
      <div className="w-full max-w-md">
        <SignIn appearance={clerkAppearance} />
      </div>

      <AppFooter />
    </main>
  );
}

