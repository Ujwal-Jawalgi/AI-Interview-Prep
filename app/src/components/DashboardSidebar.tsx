"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Brain,
  FileText,
  Code2,
  Mic,
  Building2,
  TrendingUp,
  Star,
  MessageSquare,
  Lightbulb,
  ChevronLeft,
  ChevronRight,

  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppFooter from "@/components/AppFooter";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/interview", icon: Brain, label: "Mock Interview" },
  { href: "/dashboard/resume", icon: FileText, label: "Resume Analyzer" },
  { href: "/dashboard/coding", icon: Code2, label: "Coding Round" },
  { href: "/dashboard/voice", icon: Mic, label: "Voice Interview" },
  { href: "/dashboard/companies", icon: Building2, label: "Company Prep" },
  { href: "/dashboard/evaluation", icon: Star, label: "AI Evaluation" },
  { href: "/dashboard/feedback", icon: MessageSquare, label: "Feedback Report" },
  { href: "/dashboard/progress", icon: TrendingUp, label: "Progress" },
  { href: "/dashboard/career", icon: Lightbulb, label: "Career Advice" },
];

function SidebarContent({
  collapsed,
  pathname,
  setMobileOpen
}: {
  collapsed: boolean;
  pathname: string;
  setMobileOpen: (open: boolean) => void
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]", collapsed && "justify-center")}>
        <Image 
          src="/logo.svg" 
          alt="PrepMind" 
          width={32} 
          height={32} 
          className="w-8 h-8 rounded-lg shadow-lg shadow-violet-500/30 flex-shrink-0"
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              key="logo-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold gradient-text text-base overflow-hidden whitespace-nowrap"
            >
              PrepMind
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-cyan-500/10 border border-violet-500/30 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-violet-400" : "group-hover:text-violet-400 transition-colors"
                  )}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      key="nav-label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className={cn("border-t border-white/[0.06] p-4 flex items-center gap-3", collapsed && "justify-center")}>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 ring-2 ring-violet-500/40",
            },
          }}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              key="user-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-slate-500"></p>
              <p className="text-sm font-medium text-white"> </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col relative bg-[#070d1c] border-r border-white/[0.06] flex-shrink-0"
      >
        <SidebarContent collapsed={collapsed} pathname={pathname} setMobileOpen={setMobileOpen} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-[#0d1224] border border-white/[0.12] flex items-center justify-center text-slate-400 hover:text-white hover:border-violet-500/50 transition-all z-10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-[240px] bg-[#070d1c] border-r border-white/[0.06] z-50 flex flex-col"
            >
              <SidebarContent collapsed={collapsed} pathname={pathname} setMobileOpen={setMobileOpen} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-white/[0.06] bg-[#070d1c]">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-400 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt="PrepMind" 
              width={24} 
              height={24} 
              className="w-6 h-6 rounded-lg"
            />
            <span className="font-bold gradient-text text-sm">PrepMind</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#050818] flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <AppFooter />
        </main>
      </div>
    </div>
  );
}
