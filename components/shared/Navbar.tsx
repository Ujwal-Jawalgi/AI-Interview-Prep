import Link from "next/link";
import { Button } from "../ui/button";
import { BrainCircuit } from "lucide-react";

export function Navbar() {
  return (
    <nav className="w-full border-b border-border/40 backdrop-blur-md bg-background/80 fixed top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
          <BrainCircuit className="text-indigo-500" />
          <span>PrepAI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
