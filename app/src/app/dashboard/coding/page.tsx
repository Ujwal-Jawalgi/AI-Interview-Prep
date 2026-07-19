"use client";

import { useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Code2, Play, CheckCircle2, XCircle, Bot, LayoutTemplate } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { evaluateCode } from "@/actions/coding";
import { executeCode } from "@/actions/execute";

const LANGUAGES = [
  { id: "python", name: "Python", defaultCode: "def twoSum(nums, target):\n    # Write your code here\n    pass\n\n# Do not change the input reading logic below\nimport sys\ninput_data = sys.stdin.read().strip().split('\\n')\nif len(input_data) >= 2:\n    nums = list(map(int, input_data[0].strip('[]').split(',')))\n    target = int(input_data[1])\n    print(twoSum(nums, target))" },
  { id: "javascript", name: "JavaScript", defaultCode: "function twoSum(nums, target) {\n    // Write your code here\n    \n}\n\n// Do not change the input reading logic below\nconst fs = require('fs');\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\nif(input.length >= 2) {\n    const nums = JSON.parse(input[0]);\n    const target = parseInt(input[1]);\n    console.log(JSON.stringify(twoSum(nums, target)));\n}" },
  { id: "cpp", name: "C++", defaultCode: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}\n\nint main() {\n    // Input logic would go here\n    return 0;\n}" },
  { id: "java", name: "Java", defaultCode: "import java.util.*;\n\nclass Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n    \n    public static void main(String[] args) {\n        // Input logic would go here\n    }\n}" }
];

const PROBLEM = {
  title: "Two Sum",
  description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
  testCases: [
    { id: 1, stdin: "[2,7,11,15]\n9", expectedOutput: "[0, 1]" },
    { id: 2, stdin: "[3,2,4]\n6", expectedOutput: "[1, 2]" },
    { id: 3, stdin: "[3,3]\n6", expectedOutput: "[0, 1]" }
  ]
};

interface AiReview {
  timeComplexity: string;
  timeExplanation: string;
  spaceComplexity: string;
  spaceExplanation: string;
  review: string;
}

export default function CodingPage() {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(language.defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{ id: number; passed: boolean; output: string }[]>([]);
  const [aiReview, setAiReview] = useState<AiReview | null>(null);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = LANGUAGES.find((l) => l.id === e.target.value) || LANGUAGES[0];
    setLanguage(lang);
    setCode(lang.defaultCode);
    setResults([]);
    setAiReview(null);
  };

  const runCode = async () => {
    setIsRunning(true);
    setResults([]);
    setAiReview(null);

    const newResults = [];

    try {
      // Run each test case via the Groq code execution simulator
      for (const tc of PROBLEM.testCases) {
        const response = await executeCode(code, language.id, tc.stdin);
        const actualOutput = response.stdout ? response.stdout.trim() : "";
        const expected = tc.expectedOutput.trim();
        
        // Very basic string comparison for checking pass/fail
        // (In a real system, you'd parse JSON arrays to ignore whitespace differences)
        const passed = actualOutput.replace(/\s+/g, '') === expected.replace(/\s+/g, '');
        
        newResults.push({
          id: tc.id,
          passed,
          output: response.error || response.stderr || actualOutput || "No output"
        });
      }

      setResults(newResults);

      // If finished running, trigger AI review
      const review = await evaluateCode(code, language.id, PROBLEM.title, PROBLEM.description);
      setAiReview(review);

    } catch (error) {
      console.error(error);
      alert("An error occurred during execution.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
      
      {/* Left Panel: Problem & Results */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto">
        <Card variant="solid" className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">{PROBLEM.title}</h2>
          <p className="text-slate-300 text-sm whitespace-pre-wrap">{PROBLEM.description}</p>
        </Card>

        {/* Test Cases */}
        <Card variant="glass" className="p-6 flex-1">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-violet-400" />
            Test Cases
          </h3>
          <div className="space-y-4">
            {PROBLEM.testCases.map((tc) => {
              const res = results.find((r) => r.id === tc.id);
              return (
                <div key={tc.id} className="bg-[#0d1224] rounded-lg p-4 border border-white/[0.05]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-400">Case {tc.id}</span>
                    {res ? (
                      res.passed ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Passed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 text-sm font-medium">
                          <XCircle className="w-4 h-4" /> Failed
                        </span>
                      )
                    ) : (
                      <span className="text-slate-600 text-sm">Pending</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 mb-1">
                    <span className="text-slate-500">Input:</span> {tc.stdin.replace('\n', ' | ')}
                  </div>
                  {res && !res.passed && (
                    <>
                      <div className="text-xs text-rose-300 mt-2">
                        <span className="text-rose-500/70">Output:</span> {res.output}
                      </div>
                      <div className="text-xs text-emerald-300 mt-1">
                        <span className="text-emerald-500/70">Expected:</span> {tc.expectedOutput}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* AI Review */}
        {aiReview && (
          <Card variant="gradient" glow className="p-6 border-violet-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-pink-400" />
              AI Code Review
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#070d1c]/50 p-3 rounded-lg border border-white/[0.05]">
                <div className="text-xs text-slate-400 mb-1">Time Complexity</div>
                <div className="font-mono text-emerald-400 font-bold">{aiReview.timeComplexity}</div>
                <div className="text-xs text-slate-300 mt-1">{aiReview.timeExplanation}</div>
              </div>
              <div className="bg-[#070d1c]/50 p-3 rounded-lg border border-white/[0.05]">
                <div className="text-xs text-slate-400 mb-1">Space Complexity</div>
                <div className="font-mono text-cyan-400 font-bold">{aiReview.spaceComplexity}</div>
                <div className="text-xs text-slate-300 mt-1">{aiReview.spaceExplanation}</div>
              </div>
            </div>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{aiReview.review}</p>
          </Card>
        )}
      </div>

      {/* Right Panel: Editor */}
      <Card variant="glass" className="w-full lg:w-2/3 flex flex-col overflow-hidden border-white/[0.1]">
        
        {/* Editor Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-[#0d1224]/50">
          <div className="flex items-center gap-3">
            <Code2 className="w-5 h-5 text-violet-400" />
            <select
              value={language.id}
              onChange={handleLanguageChange}
              className="bg-[#050818] border border-white/[0.1] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500 transition-colors"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={runCode} isLoading={isRunning} size="sm" className="gap-2">
            {!isRunning && <Play className="w-4 h-4" />}
            {isRunning ? "Running..." : "Run Code"}
          </Button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-[500px]">
          <Editor
            height="100%"
            language={language.id === "c" || language.id === "cpp" ? "cpp" : language.id}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
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
      </Card>
    </div>
  );
}
