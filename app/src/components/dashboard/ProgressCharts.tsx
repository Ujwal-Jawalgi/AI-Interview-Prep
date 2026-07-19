"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line, Bar, Radar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// ── Shared chart style helpers ─────────────────────────────────────────────────
const gridColor = "rgba(255,255,255,0.05)";
const tickColor = "rgba(255,255,255,0.4)";
const tooltipStyle = {
  backgroundColor: "rgba(7,13,28,0.92)",
  titleColor: "#fff",
  bodyColor: "rgba(255,255,255,0.7)",
  borderColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  padding: 12,
  boxPadding: 6,
  usePointStyle: true,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const baseLineOpts = (label: string): any => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { ...tooltipStyle },
    title: { display: true, text: label, color: "rgba(255,255,255,0.6)", font: { size: 12 }, padding: { bottom: 12 } },
  },
  scales: {
    y: { min: 0, max: 100, grid: { color: gridColor }, ticks: { color: tickColor, stepSize: 25 }, border: { dash: [4, 4] } },
    x: { grid: { display: false }, ticks: { color: tickColor } },
  },
  interaction: { mode: "index", intersect: false },
});

// ── Empty-state helper ────────────────────────────────────────────────────────
function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-600 text-sm">
      <span className="text-2xl mb-2">📈</span>
      No {label} data yet — complete an interview to start tracking!
    </div>
  );
}

// ── 1. Interview Score Trend ─────────────────────────────────────────────────
export function InterviewTrendChart({ labels, scores }: { labels: string[]; scores: number[] }) {
  if (!labels.length) return <EmptyChart label="interview score" />;
  return (
    <div className="h-[220px]">
      <Line
        data={{
          labels,
          datasets: [{
            label: "Interview Score",
            data: scores,
            borderColor: "rgb(139,92,246)",
            backgroundColor: "rgba(139,92,246,0.12)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgb(139,92,246)",
            pointRadius: 5,
            pointHoverRadius: 7,
          }],
        }}
        options={baseLineOpts("Interview Score Over Time")}
      />
    </div>
  );
}

// ── 2. Resume Score History ───────────────────────────────────────────────────
export function ResumeScoreChart({ labels, scores }: { labels: string[]; scores: number[] }) {
  if (!labels.length) return <EmptyChart label="resume score" />;
  return (
    <div className="h-[220px]">
      <Line
        data={{
          labels,
          datasets: [{
            label: "Resume ATS Score",
            data: scores,
            borderColor: "rgb(6,182,212)",
            backgroundColor: "rgba(6,182,212,0.12)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgb(6,182,212)",
            pointRadius: 5,
            pointHoverRadius: 7,
          }],
        }}
        options={baseLineOpts("Resume Score History")}
      />
    </div>
  );
}

// ── 3. Daily Practice (minutes bar chart) ────────────────────────────────────
export function DailyPracticeChart({ labels, minutes }: { labels: string[]; minutes: number[] }) {
  if (!labels.length) return <EmptyChart label="practice time" />;
  return (
    <div className="h-[220px]">
      <Bar
        data={{
          labels,
          datasets: [{
            label: "Minutes Practiced",
            data: minutes,
            backgroundColor: "rgba(16,185,129,0.7)",
            borderColor: "rgb(16,185,129)",
            borderWidth: 1,
            borderRadius: 6,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipStyle },
            title: { display: true, text: "Daily Practice Time (minutes)", color: "rgba(255,255,255,0.6)", font: { size: 12 }, padding: { bottom: 12 } },
          },
          scales: {
            y: { min: 0, grid: { color: gridColor }, ticks: { color: tickColor }, border: { dash: [4, 4] } },
            x: { grid: { display: false }, ticks: { color: tickColor } },
          },
        }}
      />
    </div>
  );
}

// ── 4. Weekly Progress (combined line) ───────────────────────────────────────
export function WeeklyProgressChart({
  labels, interviewScores, resumeScores, practiceMinutes,
}: {
  labels: string[];
  interviewScores: number[];
  resumeScores: number[];
  practiceMinutes: number[];
}) {
  if (!labels.length) return <EmptyChart label="weekly progress" />;
  return (
    <div className="h-[240px]">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Interview Score",
              data: interviewScores,
              borderColor: "rgb(139,92,246)",
              backgroundColor: "rgba(139,92,246,0.05)",
              fill: false,
              tension: 0.4,
              pointRadius: 4,
              yAxisID: "y",
            },
            {
              label: "Resume Score",
              data: resumeScores,
              borderColor: "rgb(6,182,212)",
              backgroundColor: "rgba(6,182,212,0.05)",
              fill: false,
              tension: 0.4,
              pointRadius: 4,
              yAxisID: "y",
            },
            {
              label: "Practice (min)",
              data: practiceMinutes,
              borderColor: "rgb(16,185,129)",
              backgroundColor: "rgba(16,185,129,0.05)",
              fill: false,
              tension: 0.4,
              pointRadius: 4,
              yAxisID: "y2",
              borderDash: [5, 3],
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top" as const,
              labels: { color: "rgba(255,255,255,0.6)", usePointStyle: true, font: { size: 11 } },
            },
            tooltip: { ...tooltipStyle },
            title: { display: true, text: "Weekly Progress Overview", color: "rgba(255,255,255,0.6)", font: { size: 12 }, padding: { bottom: 8 } },
          },
          scales: {
            y: { min: 0, max: 100, position: "left" as const, grid: { color: gridColor }, ticks: { color: tickColor, stepSize: 25 }, border: { dash: [4, 4] } },
            y2: { min: 0, position: "right" as const, grid: { drawOnChartArea: false }, ticks: { color: "rgba(16,185,129,0.6)" } },
            x: { grid: { display: false }, ticks: { color: tickColor } },
          },
          interaction: { mode: "index" as const, intersect: false },
        }}
      />
    </div>
  );
}

// ── 5. Skill Radar ────────────────────────────────────────────────────────────
export function SkillRadarChart({ skills }: {
  skills: { communication: number; technical: number; grammar: number; confidence: number; logical: number; problemSolving: number };
}) {
  const vals = [skills.communication, skills.technical, skills.grammar, skills.confidence, skills.logical, skills.problemSolving];
  const hasData = vals.some(v => v > 0);
  if (!hasData) return <EmptyChart label="skill breakdown" />;

  return (
    <div className="h-[260px] flex items-center justify-center">
      <Radar
        data={{
          labels: ["Communication", "Technical", "Grammar", "Confidence", "Logical", "Problem Solving"],
          datasets: [{
            label: "Avg Score",
            data: vals,
            backgroundColor: "rgba(139,92,246,0.15)",
            borderColor: "rgb(139,92,246)",
            pointBackgroundColor: "rgb(139,92,246)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgb(139,92,246)",
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltipStyle },
          },
          scales: {
            r: {
              min: 0,
              max: 100,
              grid: { color: gridColor },
              angleLines: { color: gridColor },
              pointLabels: { color: "rgba(255,255,255,0.6)", font: { size: 11 } },
              ticks: { color: "transparent", stepSize: 25, backdropColor: "transparent" },
            },
          },
        }}
      />
    </div>
  );
}

// ── 6. Score Distribution Doughnut ────────────────────────────────────────────
export function ScoreDistributionChart({ excellent, good, needsWork }: { excellent: number; good: number; needsWork: number }) {
  const total = excellent + good + needsWork;
  if (total === 0) return <EmptyChart label="score distribution" />;
  return (
    <div className="h-[220px] flex items-center justify-center">
      <Doughnut
        data={{
          labels: ["Excellent (80+)", "Good (60-79)", "Needs Work (<60)"],
          datasets: [{
            data: [excellent, good, needsWork],
            backgroundColor: ["rgba(16,185,129,0.8)", "rgba(234,179,8,0.8)", "rgba(239,68,68,0.8)"],
            borderColor: ["rgb(16,185,129)", "rgb(234,179,8)", "rgb(239,68,68)"],
            borderWidth: 2,
            hoverOffset: 8,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: {
              position: "bottom" as const,
              labels: { color: "rgba(255,255,255,0.6)", usePointStyle: true, font: { size: 11 }, padding: 16 },
            },
            tooltip: { ...tooltipStyle },
          },
        }}
      />
    </div>
  );
}
