"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ChevronRight, Loader2, Send, Mic, MicOff, Volume2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getNextQuestion, submitAnswer, completeInterview } from "@/actions/interview";

const MAX_QUESTIONS = 5;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

export default function ActiveInterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<{ id: string; text: string } | null>(null);
  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; rating: number } | null>(null);
  const [error, setError] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Voice mode states
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  // Accumulates confirmed final segments between onresult calls
  const finalTranscriptRef = useRef("");

  // Create the recognition instance ONCE on mount (empty dep array).
  // Using refs inside handlers avoids stale closure bugs.
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prefer the standard API, fall back to webkit prefix (required for Chrome)
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;      // keep mic open between pauses
    recognition.interimResults = true;  // show words as they are spoken
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      // Build transcript from the latest batch only.
      // event.resultIndex marks where new results start this call.
      // Final results are appended to our persistent ref;
      // interim results are shown live but not persisted yet.
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      // Update the answer field: committed finals + live interim preview
      setAnswer(finalTranscriptRef.current + interimTranscript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      // Surface ALL errors visibly instead of swallowing them
      const errorMessages: Record<string, string> = {
        "not-allowed":    "Microphone access denied. Click the 🔒 icon in the address bar and allow microphone access, then refresh.",
        "no-speech":      "No speech detected. Make sure your microphone is working and try again.",
        "audio-capture":  "No microphone found. Please connect a microphone and try again.",
        "network":        "Speech recognition requires an internet connection.",
        "aborted":        "Microphone was interrupted. Click the mic button to try again.",
        "service-not-allowed": "Speech service blocked. Ensure the page is served over HTTPS or localhost.",
      };
      const msg = errorMessages[event.error] ||
        `Speech recognition error: ${event.error}. Please try again.`;
      setVoiceError(msg);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setIsVoiceMode(false);
      }
    };

    recognition.onend = () => {
      // Only mark as not-listening; don't auto-restart (user controls it)
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- empty dep array: create once, never recreate

  // Initial load: get first question
  useEffect(() => {
    fetchNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop any active speech if unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  const speakQuestion = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis && isVoiceMode) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const fetchNextQuestion = async () => {
    setIsGenerating(true);
    setError("");
    setVoiceError("");
    setFeedback(null);
    setAnswer("");
    finalTranscriptRef.current = ""; // reset accumulated transcript for new question
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      setIsListening(false);
    }

    try {
      const q = await getNextQuestion(params.id);
      setCurrentQuestion(q);
      setQuestionCount((prev) => prev + 1);
      
      // Auto-speak the question if voice mode is on
      if (isVoiceMode) {
        // slight delay to ensure UI updates before speaking
        setTimeout(() => speakQuestion(q.text), 300);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to load question");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setVoiceError("Speech recognition not available. Please use Chrome or Edge.");
      return;
    }
    setVoiceError("");

    if (isListening) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      setIsListening(false);
    } else {
      // Reset accumulated transcript so we start fresh for this mic session
      finalTranscriptRef.current = "";
      setAnswer("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition:", err);
        setVoiceError("Could not start microphone. Try clicking the mic button again.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim() || !currentQuestion) return;
    setIsSubmitting(true);
    setError("");

    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      setIsListening(false);
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      const result = await submitAnswer(currentQuestion.id, answer);
      setFeedback({ text: result.feedback, rating: result.rating });
      
      if (isVoiceMode) {
        speakQuestion(`I've evaluated your answer. You scored ${result.rating} out of 10. ${result.feedback}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (questionCount >= MAX_QUESTIONS) {
      setIsEvaluating(true);
      try {
        await completeInterview(params.id);
        router.push(`/dashboard/evaluation/${params.id}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to complete interview");
        setIsEvaluating(false);
      }
    } else {
      fetchNextQuestion();
    }
  };

  const toggleVoiceMode = () => {
    if (!speechSupported) {
      setError("Your browser does not support Voice Mode. Please use Chrome or Edge.");
      return;
    }
    const newMode = !isVoiceMode;
    setIsVoiceMode(newMode);
    
    if (newMode && currentQuestion && !feedback) {
      speakQuestion(currentQuestion.text);
    } else if (!newMode) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (isListening && recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
        setIsListening(false);
      }
    }
  };

  if (isEvaluating) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 pt-20 flex flex-col items-center">
        <Loader2 className="w-16 h-16 text-violet-500 animate-spin" />
        <h1 className="text-3xl font-bold text-white">Generating AI Evaluation...</h1>
        <p className="text-slate-400">
          We are analyzing your interview performance. Hang tight!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            Mock Interview
            <button
              onClick={toggleVoiceMode}
              className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-2 transition-all ${
                isVoiceMode 
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" 
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              {isVoiceMode ? "Voice Mode: ON" : "Voice Mode: OFF"}
            </button>
          </h1>
          <p className="text-slate-400 text-sm">
            Please provide detailed answers. AI will evaluate your responses.
          </p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg text-slate-300 font-medium">
          Question {questionCount} of {MAX_QUESTIONS}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
            <p className="text-slate-400 animate-pulse">Generating your next question...</p>
          </motion.div>
        ) : currentQuestion ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Question Card */}
            <Card className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex flex-shrink-0 items-center justify-center text-violet-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white leading-relaxed">
                    {currentQuestion.text}
                  </h3>
                </div>
              </div>
            </Card>

            {/* Answer Input */}
            {!feedback && (
              <Card className="p-4 bg-slate-900/30 border-slate-800">
                {isVoiceMode && (
                  <div className="flex flex-col items-center mb-6 mt-4 gap-3">
                    <button
                      onClick={toggleListening}
                      title={isListening ? "Click to stop" : "Click to start speaking"}
                      className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
                        isListening 
                          ? "bg-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] border border-red-500/50" 
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                      }`}
                    >
                      {isListening ? (
                        <>
                          <div className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
                          <Mic className="w-8 h-8 relative z-10" />
                        </>
                      ) : (
                        <MicOff className="w-8 h-8" />
                      )}
                    </button>
                    <p className="text-xs text-slate-500">
                      {isListening
                        ? "🔴 Listening — speak now, then click again to stop"
                        : "Click to start speaking"}
                    </p>
                    {/* Voice-specific error — shown under the mic button */}
                    {voiceError && (
                      <div className="w-full max-w-sm px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
                        {voiceError}
                      </div>
                    )}
                  </div>
                )}

                <textarea
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    // If user edits manually, sync the finalTranscriptRef so
                    // subsequent speech continues from where the user left off
                    finalTranscriptRef.current = e.target.value;
                  }}
                  placeholder={
                    isVoiceMode && isListening 
                      ? "Listening… speak your answer" 
                      : isVoiceMode 
                        ? "Click the microphone above to start speaking, or type your answer here…"
                        : "Type your answer here…"
                  }
                  className="w-full h-40 bg-transparent text-white placeholder:text-slate-600 focus:outline-none resize-none p-2"
                  disabled={isSubmitting}
                />
                
                {error && <p className="text-red-400 text-sm p-2">{error}</p>}

                <div className="flex justify-end pt-2 border-t border-slate-800/50 mt-2 gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !answer.trim()}
                    className={isVoiceMode ? "w-full sm:w-auto" : ""}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Answer
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* AI Feedback */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-6"
              >
                <Card className="p-6 md:p-8 border-violet-500/20 bg-violet-500/5">
                  <h4 className="text-violet-400 font-medium mb-3 flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    AI Evaluation (Rating: {feedback.rating}/10)
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    {feedback.text}
                  </p>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleNext} variant="primary">
                    {questionCount >= MAX_QUESTIONS ? "Finish Interview" : "Next Question"}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
