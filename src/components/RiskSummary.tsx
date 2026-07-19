import React from "react";
import { AuditSummary, DetailedFinding } from "../types";
import { 
  Shield, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Percent 
} from "lucide-react";
import { motion } from "motion/react";

interface RiskSummaryProps {
  summary: AuditSummary;
  findings: DetailedFinding[];
}

export default function RiskSummary({ summary, findings }: RiskSummaryProps) {
  const compliantCount = findings.filter((f) => f.status === "Compliant").length;
  const nonCompliantCount = findings.filter((f) => f.status === "Non-Compliant").length;
  const missingCount = findings.filter((f) => f.status === "Missing").length;

  // Compute breakdown of risk issues
  const highRiskIssues = findings.filter((f) => f.status !== "Compliant" && f.risk_level === "High").length;
  const mediumRiskIssues = findings.filter((f) => f.status !== "Compliant" && f.risk_level === "Medium").length;
  const lowRiskIssues = findings.filter((f) => f.status !== "Compliant" && f.risk_level === "Low").length;

  // Find overall color based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 85) return "text-emerald-400 stroke-emerald-400";
    if (score >= 60) return "text-amber-400 stroke-amber-400";
    return "text-rose-500 stroke-rose-500";
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 85) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    if (score >= 60) return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    return "bg-rose-500/10 border-rose-500/20 text-rose-400";
  };

  // SVG parameters for circular progress
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (summary.risk_score / 100) * circumference;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg space-y-5">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-slate-100">Audit Compliance Dashboard</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Compliance Circular Chart - 4 cols */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
          <div className="relative flex items-center justify-center">
            {/* SVG Circle */}
            <svg className="w-32 h-32 transform -rotate-90">
              {/* Outer background circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Foreground animated value circle */}
              <motion.circle
                cx="64"
                cy="64"
                r={radius}
                className={`transition-all duration-1000 ${getScoreColorClass(summary.risk_score)}`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-bold text-slate-100 tracking-tight">
                {summary.risk_score}
              </span>
              <span className="text-xs text-slate-400 block -mt-1">%</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-300 mt-2">Compliance Score</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 border ${getScoreBgClass(summary.risk_score)}`}>
            {summary.risk_score >= 85 ? "Optimal Integrity" : summary.risk_score >= 60 ? "Moderate Risks" : "Critical Actions Needed"}
          </span>
        </div>

        {/* Counts & Stats Grid - 8 cols */}
        <div className="md:col-span-8 grid grid-cols-2 gap-3">
          {/* Card: Total Rules */}
          <div className="bg-slate-900/30 border border-slate-700/60 rounded-lg p-3 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Checked
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-slate-200">
                {summary.total_clauses}
              </span>
              <span className="text-xs font-medium text-slate-400">rules</span>
            </div>
          </div>

          {/* Card: Compliant (Safe) */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Compliant
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-emerald-400">
                {compliantCount}
              </span>
              <span className="text-xs font-medium text-emerald-500/80">
                {Math.round((compliantCount / (summary.total_clauses || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* Card: Non-Compliant */}
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Deficient
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-amber-400">
                {nonCompliantCount}
              </span>
              <span className="text-xs font-medium text-amber-500/80">
                {Math.round((nonCompliantCount / (summary.total_clauses || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* Card: Missing Required */}
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Missing
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-rose-400">
                {missingCount}
              </span>
              <span className="text-xs font-medium text-rose-500/80">
                {Math.round((missingCount / (summary.total_clauses || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution breakout */}
      {(nonCompliantCount > 0 || missingCount > 0) && (
        <div className="bg-slate-900/40 border border-slate-700/60 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Outstanding Risk Exposure Breakout
            </span>
            <span className="text-[10px] text-slate-400">Deficient & Missing only</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* High */}
            <div className="bg-rose-950/20 border border-rose-900/30 p-2.5 rounded text-center">
              <div className="text-xs font-bold text-rose-400">{highRiskIssues}</div>
              <div className="text-[10px] text-slate-400 font-medium">High Risk</div>
            </div>
            {/* Medium */}
            <div className="bg-amber-950/20 border border-amber-900/30 p-2.5 rounded text-center">
              <div className="text-xs font-bold text-amber-400">{mediumRiskIssues}</div>
              <div className="text-[10px] text-slate-400 font-medium">Medium Risk</div>
            </div>
            {/* Low */}
            <div className="bg-blue-950/20 border border-blue-900/30 p-2.5 rounded text-center">
              <div className="text-xs font-bold text-blue-400">{lowRiskIssues}</div>
              <div className="text-[10px] text-slate-400 font-medium">Low Risk</div>
            </div>
          </div>

          {/* Quick bar chart visualizer */}
          <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
            {highRiskIssues > 0 && (
              <div 
                className="h-full bg-rose-500" 
                style={{ flexGrow: highRiskIssues }} 
                title={`${highRiskIssues} High Risk`}
              />
            )}
            {mediumRiskIssues > 0 && (
              <div 
                className="h-full bg-amber-500" 
                style={{ flexGrow: mediumRiskIssues }} 
                title={`${mediumRiskIssues} Medium Risk`}
              />
            )}
            {lowRiskIssues > 0 && (
              <div 
                className="h-full bg-blue-400" 
                style={{ flexGrow: lowRiskIssues }} 
                title={`${lowRiskIssues} Low Risk`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
