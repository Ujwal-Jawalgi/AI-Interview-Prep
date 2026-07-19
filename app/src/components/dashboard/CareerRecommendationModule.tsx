import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { BrainCircuit, Briefcase, Code, Link as LinkIcon, RefreshCw } from "lucide-react";
import { generateCareerRecommendation } from "@/actions/career";
import type { CareerRecommendation } from "@/lib/career/groq-career";

export default function CareerRecommendationModule({ initialData }: { initialData: CareerRecommendation | null }) {
  const [data, setData] = useState<CareerRecommendation | null>(initialData);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generateCareerRecommendation();
      setData(result);
    } catch (error) {
      console.error("Failed to generate career recommendation:", error);
      alert("Failed to generate career recommendation. Ensure you have completed at least one interview.");
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <Card variant="gradient" className="p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
          <BrainCircuit className="w-12 h-12 text-violet-400" />
          <div>
            <h3 className="text-lg font-bold text-white">AI Career Profile</h3>
            <p className="text-slate-400 text-sm max-w-sm mt-2">
              Generate a personalized career profile with recommended roles, skills to learn, and study resources based on your mock interviews and resume.
            </p>
          </div>
          <Button variant="primary" onClick={handleGenerate} disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
            {loading ? "Analyzing Profile..." : "Generate AI Career Profile"}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-violet-400" /> AI Career Recommendation
        </h3>
        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
          {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Update Profile
        </Button>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <p className="text-sm text-slate-300 leading-relaxed">
          {data.readiness_summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Recommended Roles
          </h4>
          <ul className="space-y-2">
            {data.recommended_roles.map((role, idx) => (
              <li key={idx} className="text-slate-300 text-sm bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {role}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
            <Code className="w-4 h-4" /> Suggested Skills to Learn
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.suggested_skills.map((skill, idx) => (
              <span key={idx} className="text-xs font-medium bg-cyan-500/10 text-cyan-300 px-3 py-1.5 rounded-full border border-cyan-500/20">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {data.learning_resources && data.learning_resources.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Recommended Resources
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.learning_resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-300 bg-slate-900/50 px-4 py-3 rounded-xl border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all flex items-center justify-between group"
              >
                <span className="truncate pr-4">{res.name}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function ArrowUpRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
