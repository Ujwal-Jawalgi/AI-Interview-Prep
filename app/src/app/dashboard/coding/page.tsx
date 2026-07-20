"use client";

import { useState } from "react";
import { Editor } from "@monaco-editor/react";
import {
  Code2, Play, CheckCircle2, XCircle, Bot, LayoutTemplate,
  ChevronRight, Trophy, Zap, TrendingUp, ArrowRight, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { evaluateBothSolutions, CombinedReview } from "@/actions/coding";
import { executeCode } from "@/actions/execute";

// ─── Problem bank ────────────────────────────────────────────────────────────
// Each language gets unique starter code for each problem.

const PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    difficultyColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    description:
      "Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers that add up to `target`.\n\nEach input has exactly one solution. You may not use the same element twice.",
    testCases: [
      { id: 1, stdin: "[2,7,11,15]\n9",  expectedOutput: "[0, 1]" },
      { id: 2, stdin: "[3,2,4]\n6",       expectedOutput: "[1, 2]" },
      { id: 3, stdin: "[3,3]\n6",          expectedOutput: "[0, 1]" },
    ],
    defaultCode: {
      python: `def twoSum(nums, target):
    # Write your solution here
    pass

import sys
data = sys.stdin.read().strip().split('\\n')
nums = list(map(int, data[0].strip('[]').split(',')))
target = int(data[1])
print(twoSum(nums, target))`,
      javascript: `function twoSum(nums, target) {
    // Write your solution here
}

const fs = require('fs');
const lines = fs.readFileSync('/dev/stdin','utf-8').trim().split('\\n');
const nums = JSON.parse(lines[0]);
const target = parseInt(lines[1]);
console.log(JSON.stringify(twoSum(nums, target)));`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your solution here
    return {};
}

int main() {
    // Input parsing omitted for brevity — focus on the algorithm above
    return 0;
}`,
      java: `import java.util.*;

class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }

    public static void main(String[] args) {
        // Input parsing omitted — focus on the algorithm above
    }
}`,
    },
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    difficultyColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    description:
      "Given a string `s` containing only `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is **valid**.\n\nAn input string is valid if:\n- Open brackets must be closed by the same type of brackets.\n- Open brackets must be closed in the correct order.\n- Every close bracket has a corresponding open bracket.",
    testCases: [
      { id: 1, stdin: "()",       expectedOutput: "true"  },
      { id: 2, stdin: "()[]{}", expectedOutput: "true"  },
      { id: 3, stdin: "(]",      expectedOutput: "false" },
    ],
    defaultCode: {
      python: `def isValid(s):
    # Write your solution here
    pass

import sys
s = sys.stdin.read().strip()
print(str(isValid(s)).lower())`,
      javascript: `function isValid(s) {
    // Write your solution here
}

const fs = require('fs');
const s = fs.readFileSync('/dev/stdin','utf-8').trim();
console.log(String(isValid(s)).toLowerCase());`,
      cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isValid(string s) {
    // Write your solution here
    return false;
}

int main() {
    string s;
    cin >> s;
    cout << (isValid(s) ? "true" : "false") << endl;
    return 0;
}`,
      java: `import java.util.*;

class Solution {
    public static boolean isValid(String s) {
        // Write your solution here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        System.out.println(isValid(s));
    }
}`,
    },
  },
];

type LangId = "python" | "javascript" | "cpp" | "java";

const LANGUAGES: { id: LangId; name: string }[] = [
  { id: "python",     name: "Python"     },
  { id: "javascript", name: "JavaScript" },
  { id: "cpp",        name: "C++"        },
  { id: "java",       name: "Java"       },
];

interface TestResult {
  id: number;
  passed: boolean;
  output: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CodingPage() {
  const [langId, setLangId]     = useState<LangId>("python");
  const [problemIdx, setProblemIdx] = useState(0); // 0 or 1
  const [codes, setCodes]       = useState<[string, string]>([
    PROBLEMS[0].defaultCode["python"],
    PROBLEMS[1].defaultCode["python"],
  ]);
  const [isRunning, setIsRunning]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<[TestResult[], TestResult[]]>([[], []]);
  const [p1Done, setP1Done]   = useState(false); // ran at least once
  const [combinedReview, setCombinedReview] = useState<CombinedReview | null>(null);
  const [runError, setRunError] = useState("");

  const problem   = PROBLEMS[problemIdx];
  // otherDone unused — submit gate is checked inline in JSX

  // ── Language change ─────────────────────────────────────────────────────────
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value as LangId;
    setLangId(id);
    setCodes([PROBLEMS[0].defaultCode[id], PROBLEMS[1].defaultCode[id]]);
    setResults([[], []]);
    setP1Done(false);
    setCombinedReview(null);
    setProblemIdx(0);
  };

  // ── Code change for current problem ────────────────────────────────────────
  const handleCodeChange = (val: string | undefined) => {
    const updated = [...codes] as [string, string];
    updated[problemIdx] = val || "";
    setCodes(updated);
  };

  // ── Run current problem ─────────────────────────────────────────────────────
  const runCode = async () => {
    setIsRunning(true);
    setRunError("");
    const updated = [...results] as [TestResult[], TestResult[]];
    updated[problemIdx] = [];
    setResults(updated);

    try {
      const newResults: TestResult[] = [];
      for (const tc of problem.testCases) {
        const res = await executeCode(codes[problemIdx], langId, tc.stdin);
        const actual   = (res.stdout || "").trim();
        const expected = tc.expectedOutput.trim();
        newResults.push({
          id: tc.id,
          passed: actual.replace(/\s+/g, "") === expected.replace(/\s+/g, ""),
          output: res.error || res.stderr || actual || "No output",
        });
      }
      const out = [...results] as [TestResult[], TestResult[]];
      out[problemIdx] = newResults;
      setResults(out);

      if (problemIdx === 0) setP1Done(true);
    } catch (err) {
      console.error(err);
      setRunError("Execution failed. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  // ── Submit both ─────────────────────────────────────────────────────────────
  const handleSubmitBoth = async () => {
    setIsSubmitting(true);
    setRunError("");
    try {
      const review = await evaluateBothSolutions(
        langId,
        { title: PROBLEMS[0].title, description: PROBLEMS[0].description, code: codes[0] },
        { title: PROBLEMS[1].title, description: PROBLEMS[1].description, code: codes[1] }
      );
      setCombinedReview(review);
    } catch (err) {
      console.error(err);
      setRunError("Failed to get AI analysis. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scoreColor = (s: number) =>
    s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-rose-400";

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col gap-0">

      {/* ── Top bar: problem tabs + language ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-[#070d1c]">
        {/* Problem tabs */}
        <div className="flex items-center gap-2">
          {PROBLEMS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => { setProblemIdx(i); setRunError(""); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                problemIdx === i
                  ? "bg-violet-600/20 border border-violet-500/40 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span className="font-mono text-xs text-slate-500">P{p.id}</span>
              {p.title}
              {results[i].length > 0 && (
                results[i].every(r => r.passed)
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  : <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
            </button>
          ))}
        </div>

        {/* Language selector + actions */}
        <div className="flex items-center gap-3">
          <select
            value={langId}
            onChange={handleLanguageChange}
            className="bg-[#050818] border border-white/[0.1] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500 transition-colors"
          >
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>

          <Button onClick={runCode} disabled={isRunning || isSubmitting} size="sm" className="gap-2">
            {isRunning
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
              : <><Play className="w-4 h-4" /> Run P{problemIdx + 1}</>}
          </Button>

          {/* Show Next Problem button after P1 is run */}
          {problemIdx === 0 && p1Done && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setProblemIdx(1); setRunError(""); }}
              className="gap-2"
            >
              Problem 2 <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          {/* Submit Both — visible once on P2 tab and P1 was solved */}
          {problemIdx === 1 && p1Done && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitBoth}
              disabled={isRunning || isSubmitting}
              className="gap-2"
            >
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                : <><Trophy className="w-4 h-4" /> Submit Both</>}
            </Button>
          )}
        </div>
      </div>

      {/* ── Main split ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left: problem statement + test cases */}
        <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col overflow-y-auto border-r border-white/[0.06] bg-[#070d1c]">

          {/* Problem statement */}
          <AnimatePresence mode="wait">
            <motion.div
              key={problemIdx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="p-5 border-b border-white/[0.06]"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs text-slate-500">Problem {problem.id}/2</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${problem.difficultyColor}`}>
                  {problem.difficulty}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-3">{problem.title}</h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {problem.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Test cases */}
          <div className="p-5 flex-1">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4" /> Test Cases
            </h3>
            <div className="space-y-3">
              {problem.testCases.map(tc => {
                const res = results[problemIdx].find(r => r.id === tc.id);
                return (
                  <div key={tc.id} className="bg-[#0d1224] rounded-lg p-3 border border-white/[0.05]">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-slate-500">Case {tc.id}</span>
                      {res
                        ? res.passed
                          ? <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Passed</span>
                          : <span className="flex items-center gap-1 text-rose-400 text-xs font-medium"><XCircle className="w-3.5 h-3.5" /> Failed</span>
                        : <span className="text-slate-600 text-xs">Pending</span>
                      }
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      <span className="text-slate-600">in: </span>{tc.stdin.replace("\n", " | ")}
                    </div>
                    {res && !res.passed && (
                      <>
                        <div className="text-xs text-rose-300 mt-1 font-mono"><span className="text-rose-600">got: </span>{res.output}</div>
                        <div className="text-xs text-emerald-300 mt-0.5 font-mono"><span className="text-emerald-600">exp: </span>{tc.expectedOutput}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Run error */}
            {runError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {runError}
              </div>
            )}

            {/* Progress hint */}
            {!combinedReview && (
              <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs text-slate-500">
                {!p1Done
                  ? "① Solve Problem 1 and click Run P1"
                  : problemIdx === 0
                  ? "✓ Problem 1 run. Click \u2018Problem 2\u2019 to continue."
                  : "② Solve Problem 2, run it, then click \u2018Submit Both\u2019 for AI analysis."}
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor + combined review */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Monaco Editor */}
          <div className="flex-1 min-h-[400px]">
            <Editor
              height="100%"
              language={langId === "cpp" ? "cpp" : langId}
              theme="vs-dark"
              value={codes[problemIdx]}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
              }}
            />
          </div>

          {/* ── Combined AI Review (appears after Submit Both) ── */}
          <AnimatePresence>
            {combinedReview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border-t border-white/[0.06] overflow-y-auto max-h-[55vh] bg-[#070d1c]"
              >
                <div className="p-5 space-y-5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Bot className="w-5 h-5 text-violet-400" />
                      Combined AI Analysis
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Overall Score</span>
                      <span className={`text-2xl font-black ${scoreColor(combinedReview.overallScore)}`}>
                        {combinedReview.overallScore}
                        <span className="text-sm text-slate-500 font-normal">/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Overall assessment */}
                  <Card variant="gradient" glow className="p-4">
                    <p className="text-sm text-slate-200 leading-relaxed">{combinedReview.overallAssessment}</p>
                  </Card>

                  {/* Per-problem breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {([combinedReview.problem1, combinedReview.problem2] as const).map((p, i) => (
                      <Card key={i} variant="glass" className="p-4 space-y-3">
                        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
                          <Code2 className="w-4 h-4 text-violet-400" />
                          <span className="text-sm font-bold text-white">{p.title}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#070d1c]/70 p-2 rounded-lg">
                            <div className="text-[10px] text-slate-500 mb-0.5">Time</div>
                            <div className="font-mono text-emerald-400 text-sm font-bold">{p.timeComplexity}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{p.timeExplanation}</div>
                          </div>
                          <div className="bg-[#070d1c]/70 p-2 rounded-lg">
                            <div className="text-[10px] text-slate-500 mb-0.5">Space</div>
                            <div className="font-mono text-cyan-400 text-sm font-bold">{p.spaceComplexity}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{p.spaceExplanation}</div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{p.review}</p>
                      </Card>
                    ))}
                  </div>

                  {/* Strengths + Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card variant="glass" className="p-4">
                      <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mb-3">
                        <TrendingUp className="w-4 h-4" /> Strengths
                      </h4>
                      <ul className="space-y-1.5">
                        {combinedReview.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <Card variant="glass" className="p-4">
                      <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-1.5 mb-3">
                        <Zap className="w-4 h-4" /> Areas to Improve
                      </h4>
                      <ul className="space-y-1.5">
                        {combinedReview.improvements.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
