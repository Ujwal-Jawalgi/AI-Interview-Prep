"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, Database, Activity, Target, Trophy, Clock } from "lucide-react";
import Link from "next/link";
import { Profile } from "@/lib/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-96 bg-white/5 rounded-xl"></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {profile?.name || "User"} 👋</h1>
        <p className="text-muted-foreground">Here is an overview of your interview preparation progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Activity className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Simulated sessions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/10</div>
            <p className="text-xs text-muted-foreground mt-1">Across all dimensions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-rose-500/10 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Questions Practiced</CardTitle>
            <Database className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">From question bank</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Best Performing</CardTitle>
            <Trophy className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">None</div>
            <p className="text-xs text-muted-foreground mt-1">Top assessed category</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link href="/interview" className="block group">
          <Card className="h-full hover:bg-white/10 transition-colors border-indigo-500/30 group-hover:border-indigo-400 duration-300">
            <CardHeader>
              <div className="bg-indigo-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-indigo-400" />
              </div>
              <CardTitle>Start Mock Interview</CardTitle>
              <CardDescription>Practice with our AI interviewer with real-time feedback and voice mode.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/resume" className="block group">
          <Card className="h-full hover:bg-white/10 transition-colors hover:border-violet-400 duration-300">
            <CardHeader>
              <div className="bg-violet-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-violet-400" />
              </div>
              <CardTitle>Analyze Resume</CardTitle>
              <CardDescription>Upload your PDF resume to get actionable feedback and match score.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/questions" className="block group">
          <Card className="h-full hover:bg-white/10 transition-colors hover:border-emerald-400 duration-300">
            <CardHeader>
              <div className="bg-emerald-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
              <CardTitle>Browse Question Bank</CardTitle>
              <CardDescription>Explore our curated list of technical and behavioral interview questions.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          Recent Activity
        </h2>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[200px]">
            <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p>No recent activity yet.</p>
            <p className="text-sm mt-1">Start a mock interview to see your history here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
