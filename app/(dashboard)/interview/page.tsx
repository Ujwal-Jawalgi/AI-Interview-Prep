"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, Send, Square, Bot, User, CheckCircle2, ChevronRight, Play, AlertCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AnswerScore } from "@/lib/types";

type Message = { role: "user" | "assistant"; content: string };

export default function InterviewPage() {
  const [step, setStep] = useState<"setup" | "interview" | "feedback" | "complete">("setup");
  
  // Setup state
  const [role, setRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [type, setType] = useState("Technical");
  const [voiceMode, setVoiceMode] = useState(false);

  // Interview state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const MAX_QUESTIONS = 5;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio/Voice state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Feedback state
  const [currentFeedback, setCurrentFeedback] = useState<AnswerScore | null>(null);
  const [allFeedback, setAllFeedback] = useState<AnswerScore[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Setup Speech Recognition
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInput(prev => prev + ' ' + finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const startInterview = async () => {
    setStep("interview");
    setMessages([]);
    setQuestionCount(0);
    setAllFeedback([]);
    await askNextQuestion([]);
  };

  const askNextQuestion = async (currentMessages: Message[]) => {
    setIsTyping(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
          role,
          difficulty: difficulty.toLowerCase(),
          type: type.toLowerCase()
        })
      });

      if (!res.ok) throw new Error("Failed to get question");

      const data = await res.json();
      setMessages([...currentMessages, { role: "assistant", content: data.text }]);
      setQuestionCount(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to generate question. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const submitAnswer = async () => {
    if (!input.trim() || isTyping) return;
    
    if (isRecording) toggleRecording();

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    const questionText = messages[messages.length - 1]?.content;

    try {
      // Get feedback for the answer
      const feedbackRes = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          answer: input,
          role,
          type: type.toLowerCase()
        })
      });

      if (!feedbackRes.ok) throw new Error("Failed to get feedback");

      const feedbackData: AnswerScore = await feedbackRes.json();
      setCurrentFeedback(feedbackData);
      setAllFeedback([...allFeedback, feedbackData]);
      setStep("feedback");
      setIsTyping(false);

    } catch (error) {
      toast.error("Failed to analyze answer.");
      setIsTyping(false);
    }
  };

  const nextAction = async () => {
    if (questionCount >= MAX_QUESTIONS) {
      // Complete interview
      const avgScore = Math.round(allFeedback.reduce((acc, curr) => acc + curr.overall, 0) / allFeedback.length);
      setOverallScore(avgScore);
      setStep("complete");
    } else {
      setStep("interview");
      await askNextQuestion(messages);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {step === "setup" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto w-full mt-12">
          <Card className="glass-panel border-indigo-500/20">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-indigo-400" />
              </div>
              <CardTitle className="text-3xl">Set up your Interview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Target Role</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Software Engineer", "Frontend Dev", "Backend Dev", "Data Scientist", "Product Manager", "UI/UX Designer"].map(r => (
                    <div 
                      key={r}
                      onClick={() => setRole(r)}
                      className={`px-4 py-3 rounded-xl border text-sm text-center cursor-pointer transition-all ${role === r ? "border-indigo-500 bg-indigo-500/20 text-indigo-100" : "border-white/10 hover:border-white/20 bg-white/5"}`}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option className="bg-[#0a0a14]">Easy</option>
                    <option className="bg-[#0a0a14]">Medium</option>
                    <option className="bg-[#0a0a14]">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Interview Type</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option className="bg-[#0a0a14]">Technical</option>
                    <option className="bg-[#0a0a14]">HR</option>
                    <option className="bg-[#0a0a14]">Behavioral</option>
                    <option className="bg-[#0a0a14]">Mixed</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 border border-white/10 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={voiceMode} 
                  onChange={(e) => setVoiceMode(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 text-indigo-600 focus:ring-indigo-500/20 bg-black/20"
                />
                <div>
                  <div className="font-medium">Enable Voice Mode</div>
                  <div className="text-xs text-muted-foreground">Use your microphone to answer questions naturally.</div>
                </div>
              </label>

              <Button onClick={startInterview} className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 mt-4 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                Start Interview
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === "interview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative glass-panel">
          
          {/* Header */}
          <div className="h-16 border-b border-white/10 bg-black/20 flex items-center justify-between px-6 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-medium text-sm text-green-400">Live Interview</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="text-muted-foreground">Question {questionCount} of {MAX_QUESTIONS}</span>
              <Progress value={(questionCount / MAX_QUESTIONS) * 100} className="w-32 h-2" />
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex gap-4 max-w-[80%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-indigo-600" : "bg-white/10 border border-white/20"}`}>
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-indigo-400" />}
                  </div>
                  <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap text-[15px] ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"}`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[80%]">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/20 border-t border-white/10 shrink-0">
             <div className="flex gap-3 items-end max-w-4xl mx-auto w-full relative">
                 <textarea 
                   disabled={messages.length === 0 || messages[messages.length-1].role === "user" || isTyping}
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => {
                     if(e.key === "Enter" && !e.shiftKey) {
                       e.preventDefault();
                       submitAnswer();
                     }
                   }}
                   placeholder={isRecording ? "Listening..." : "Type your answer here..."}
                   className={`w-full bg-white/5 border rounded-xl p-4 pr-16 text-[15px] resize-none focus:outline-none transition-colors max-h-48 min-h-[60px] ${isRecording ? "border-red-500/50 bg-red-500/5 placeholder:text-red-300" : "border-white/20 focus:border-indigo-500"}`}
                   rows={input.split('n').length > 1 ? Math.min(input.split('n').length, 5) : 1}
                 />
                 
                 <div className="absolute right-4 bottom-4 flex gap-2">
                   {voiceMode && (
                     <Button 
                       disabled={messages.length === 0 || messages[messages.length-1].role === "user" || isTyping}
                       onClick={toggleRecording}
                       size="icon" 
                       variant="ghost" 
                       className={`rounded-full ${isRecording ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse" : "text-muted-foreground hover:text-white"}`}
                     >
                       {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                     </Button>
                   )}
                 </div>
             </div>
             
             <div className="flex justify-between items-center max-w-4xl mx-auto w-full mt-3 px-1">
                <div className="text-xs text-muted-foreground">
                  {voiceMode ? "Click the microphone to use voice input." : "Press Enter to submit, Shift+Enter for new line."}
                </div>
                <Button 
                  onClick={submitAnswer}
                  disabled={!input.trim() || isTyping || (messages.length > 0 && messages[messages.length-1].role === "user")}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Answer
                </Button>
             </div>
          </div>
        </motion.div>
      )}

      {step === "feedback" && currentFeedback && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full overflow-y-auto pb-8">
           <div className="max-w-4xl mx-auto space-y-6 mt-4">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="text-green-500 w-8 h-8" />
                  Answer Evaluation
                </h2>
                <Button onClick={nextAction} className="bg-indigo-600 hover:bg-indigo-700">
                  {questionCount >= MAX_QUESTIONS ? "View Final Summary" : "Next Question"} <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {[
                 { label: "Overall", score: currentFeedback.overall, color: "text-indigo-400" },
                 { label: "Clarity", score: currentFeedback.clarity, color: "text-blue-400" },
                 { label: "Technical", score: currentFeedback.technical, color: "text-emerald-400" },
                 { label: "Structure", score: currentFeedback.structure, color: "text-violet-400" },
               ].map(s => (
                 <Card key={s.label} className="glass-panel text-center py-6">
                   <div className="text-muted-foreground text-sm font-medium mb-2">{s.label} Score</div>
                   <div className={`text-4xl font-bold ${s.color}`}>{s.score}<span className="text-lg text-muted-foreground">/10</span></div>
                 </Card>
               ))}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="glass-panel bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-lg text-green-400 flex items-center gap-2">
                     <CheckCircle2 className="w-5 h-5" /> Strengths
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <ul className="space-y-3">
                     {currentFeedback.strengths.map((s, i) => (
                       <li key={i} className="flex gap-2 text-sm text-green-100/80">
                         <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> {s}
                       </li>
                     ))}
                   </ul>
                 </CardContent>
               </Card>
               
               <Card className="glass-panel bg-gradient-to-br from-orange-500/5 to-rose-500/5 border-orange-500/20">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-lg text-orange-400 flex items-center gap-2">
                     <AlertCircle className="w-5 h-5" /> Improvements
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <ul className="space-y-3">
                     {currentFeedback.improvements.map((s, i) => (
                       <li key={i} className="flex gap-2 text-sm text-orange-100/80">
                         <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" /> {s}
                       </li>
                     ))}
                   </ul>
                 </CardContent>
               </Card>
             </div>

             <Card className="glass-panel border-indigo-500/30 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 pt-0 pointer-events-none opacity-5">
                 <Bot className="w-64 h-64 text-indigo-500" />
               </div>
               <CardHeader>
                 <CardTitle className="text-xl flex items-center gap-2 text-indigo-300">
                   <SparklesIcon className="w-5 h-5" /> Ideal Answer
                 </CardTitle>
               </CardHeader>
               <CardContent className="relative z-10">
                 <div className="p-6 bg-black/40 rounded-xl whitespace-pre-wrap leading-relaxed text-slate-300 border border-white/5">
                   {currentFeedback.sample_answer}
                 </div>
               </CardContent>
             </Card>
           </div>
        </motion.div>
      )}

      {step === "complete" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto w-full mt-8">
           <Card className="glass-panel text-center p-8 bg-gradient-to-b from-indigo-500/10 to-transparent">
             <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
               <Trophy className="w-12 h-12 text-white" />
             </div>
             
             <h2 className="text-4xl font-extrabold mb-4">Interview Complete!</h2>
             <p className="text-xl text-muted-foreground max-w-lg mx-auto mb-8">
               You successfully answered {MAX_QUESTIONS} questions. Here is your overall performance summary.
             </p>

             <div className="flex justify-center mb-8">
               <div className="text-center">
                 <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Overall Score</div>
                 <div className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                   {overallScore}<span className="text-3xl text-muted-foreground">/10</span>
                 </div>
               </div>
             </div>

             <div className="flex gap-4 justify-center mt-12">
               <Button onClick={() => window.location.href='/dashboard'} variant="outline" className="border-white/20 h-12 px-6">
                 Back to Dashboard
               </Button>
               <Button onClick={() => setStep("setup")} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                 Start Another Interview
               </Button>
             </div>
           </Card>
        </motion.div>
      )}
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
