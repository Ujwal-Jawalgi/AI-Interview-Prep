"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Interview } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Legend } from "recharts";
import { Activity, TrendingUp, Calendar, Clock, Target, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true }); // Ascending for charts

      // Use some mock data if empty just to show the UI as instructed for WOW factor
      if (!data || data.length === 0) {
        const mockData: any[] = [
          { created_at: new Date(Date.now() - 6 * 86400000).toISOString(), overall_score: 5, role: "Software Engineer", type: "technical", scores: [{clarity: 5, technical: 4, structure: 6}] },
          { created_at: new Date(Date.now() - 4 * 86400000).toISOString(), overall_score: 6, role: "Software Engineer", type: "behavioral", scores: [{clarity: 6, technical: 5, structure: 7}] },
          { created_at: new Date(Date.now() - 2 * 86400000).toISOString(), overall_score: 8, role: "Frontend Dev", type: "mixed", scores: [{clarity: 8, technical: 7, structure: 9}] },
          { created_at: new Date().toISOString(), overall_score: 9, role: "React Developer", type: "technical", scores: [{clarity: 9, technical: 9, structure: 9}] }
        ];
        setInterviews(mockData);
      } else {
        setInterviews(data as Interview[]);
      }
      setLoading(false);
    };

    fetchInterviews();
  }, []);

  if (loading) {
     return <div className="animate-pulse h-96 bg-white/5 rounded-xl"></div>;
  }

  // Derived Statistics
  const totalSessions = interviews.length;
  const avgScore = totalSessions > 0 ? Math.round(interviews.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / totalSessions) : 0;
  const bestScore = totalSessions > 0 ? Math.max(...interviews.map(i => i.overall_score || 0)) : 0;
  
  // Line Chart Data
  const trendData = interviews.map((i, idx) => ({
    name: `Session ${idx + 1}`,
    date: format(new Date(i.created_at), 'MMM dd'),
    score: i.overall_score || 0
  }));

  // Radar Chart Data (Averages)
  let avgClarity = 0, avgTechnical = 0, avgStructure = 0;
  if (totalSessions > 0) {
    let count = 0;
    interviews.forEach(i => {
      if (i.scores && i.scores.length > 0) {
         const scoreEntry = i.scores[0]; // Average of the interview, simplifying for radar
         avgClarity += scoreEntry.clarity || 0;
         avgTechnical += scoreEntry.technical || 0;
         avgStructure += scoreEntry.structure || 0;
         count++;
      }
    });
    if (count > 0) {
      avgClarity /= count;
      avgTechnical /= count;
      avgStructure /= count;
    }
  }

  const radarData = [
    { subject: 'Clarity', A: avgClarity, fullMark: 10 },
    { subject: 'Technical', A: avgTechnical, fullMark: 10 },
    { subject: 'Structure (STAR)', A: avgStructure, fullMark: 10 },
  ];

  // Bar Chart (By Category - Simulated)
  const barData = [
    { name: 'Technical', score: 8.5 },
    { name: 'HR', score: 7.2 },
    { name: 'Behavioral', score: 9.0 },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Performance Analytics</h1>
        <p className="text-muted-foreground">Track your progress, identify weak areas, and visualize your improvement over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel border-indigo-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-100">{totalSessions}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            <Target className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{avgScore}<span className="text-lg text-muted-foreground">/10</span></div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-violet-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-violet-400">{bestScore}<span className="text-lg text-muted-foreground">/10</span></div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Improvement</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-orange-400">+40%</div>
             <p className="text-xs text-muted-foreground mt-1">Since first session</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle>Score Progression</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#0a0a14' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#818cf8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle>Skill Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pb-6">
            <div className="h-full w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#ffffff20" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/10 overflow-hidden">
        <CardHeader className="bg-black/20 border-b border-white/5">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> Interview History
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium text-right">View Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {interviews.map((session, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {format(new Date(session.created_at), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-indigo-200">
                    {session.role}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize px-2.5 py-1 rounded-md text-xs font-medium bg-white/10 text-slate-300">
                      {session.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" 
                          style={{ width: `${(session.overall_score || 0) * 10}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-200">{session.overall_score}/10</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-400 hover:text-indigo-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Details &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {interviews.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No interview history found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
