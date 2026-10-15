"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Question } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Database, ChevronDown, ChevronUp, Tag, PlusSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data } = await supabase.from('questions').select('*').order('category');
      if (data) setQuestions(data);
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase()) || 
                          q.topic.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || q.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "medium": return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "hard": return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      default: return "";
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "dsa": return "Data Structures & Algos";
      case "core-cs": return "Core CS Subjects";
      case "hr": return "HR Questions";
      case "behavioral": return "Behavioral & Experience";
      default: return cat;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Question Bank</h1>
          <p className="text-muted-foreground">Browse and study our curated database of technical and behavioral questions.</p>
        </div>
      </div>

      <Card className="glass-panel border-white/10 p-2">
        <div className="flex flex-col md:flex-row gap-4 p-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search questions by keyword or topic..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-black/20 border-white/10"
            />
          </div>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="dsa">DSA</option>
            <option value="core-cs">Core CS</option>
            <option value="hr">HR</option>
            <option value="behavioral">Behavioral</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No questions found matching your criteria.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={q.id}
              >
                <Card className="glass-panel overflow-hidden border-white/5 hover:border-white/20 transition-colors">
                  <div 
                    className="p-6 cursor-pointer flex gap-4 items-start"
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty.toUpperCase()}
                        </span>
                        <span className="text-xs font-medium text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
                          {getCategoryLabel(q.category)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                          <Tag className="w-3 h-3" /> {q.topic}
                        </div>
                      </div>
                      <h3 className="text-lg font-medium leading-tight text-indigo-100/90">{q.question}</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground rounded-full hover:bg-white/10">
                      {expandedId === q.id ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {expandedId === q.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="px-6 pb-6 pt-0 border-t border-white/5 bg-black/20">
                           <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                             <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Sample Answer</div>
                             <p className="text-sm leading-relaxed text-slate-300">{q.sample_answer}</p>
                           </div>
                           <div className="mt-4 flex justify-end">
                             <Link href="/interview">
                               <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                                 <PlusSquare className="w-4 h-4 mr-2" /> Start Mock Interview
                               </Button>
                             </Link>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
