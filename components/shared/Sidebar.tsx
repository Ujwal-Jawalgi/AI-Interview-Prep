"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, LayoutDashboard, MessageSquare, FileText, Database, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/interview", label: "Mock Interview", icon: <MessageSquare className="w-5 h-5" /> },
    { href: "/resume", label: "Resume Analyzer", icon: <FileText className="w-5 h-5" /> },
    { href: "/questions", label: "Question Bank", icon: <Database className="w-5 h-5" /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="w-64 h-screen border-r border-border/40 bg-background/80 backdrop-blur-md flex flex-col fixed left-0 top-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
          <BrainCircuit className="text-indigo-500" />
          <span>PrepAI</span>
        </Link>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400 font-medium" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <div className={cn(
                "transition-colors",
                isActive ? "text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {link.icon}
              </div>
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/40">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
