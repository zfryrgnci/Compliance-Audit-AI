import React, { useState } from "react";
import { DetailedFinding } from "../types";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ArrowRight, 
  Filter, 
  FileText 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FindingsTableProps {
  findings: DetailedFinding[];
  goldStandardClauses: { name: string; standardText: string; description: string }[];
}

export default function FindingsTable({ findings, goldStandardClauses }: FindingsTableProps) {
  const [filter, setFilter] = useState<"All" | "Compliant" | "Non-Compliant" | "Missing">("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFindings = findings.filter((f) => {
    if (filter === "All") return true;
    return f.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Compliant":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3 w-3" /> Compliant
          </span>
        );
      case "Non-Compliant":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-3 w-3" /> Deficient
          </span>
        );
      case "Missing":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="h-3 w-3" /> Missing
          </span>
        );
    }
  };

  const getRiskBadge = (risk: string, status: string) => {
    if (status === "Compliant") {
      return (
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Safe
        </span>
      );
    }
    switch (risk) {
      case "High":
        return (
          <span className="text-[10px] bg-rose-600/10 text-rose-400 border border-rose-600/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            Critical
          </span>
        );
      case "Medium":
        return (
          <span className="text-[10px] bg-amber-600/10 text-amber-400 border border-amber-600/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            Moderate
          </span>
        );
      case "Low":
      default:
        return (
          <span className="text-[10px] bg-blue-600/10 text-blue-400 border border-blue-600/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            Low
          </span>
        );
    }
  };

  const handleCopyRemediation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg space-y-4">
      {/* Header and Filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-slate-100">Audit Detailed Findings</h3>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-700/60 flex text-xs">
            {(["All", "Compliant", "Non-Compliant", "Missing"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setFilter(opt);
                  setExpandedIndex(null);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  filter === opt
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt === "Non-Compliant" ? "Deficient" : opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main List */}
      {filteredFindings.length === 0 ? (
        <div className="text-center py-8 bg-slate-900/20 rounded-lg border border-dashed border-slate-700">
          <p className="text-sm text-slate-400">No findings match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding, idx) => {
            const isExpanded = expandedIndex === idx;
            // Find corresponding gold standard text
            const goldRule = goldStandardClauses.find(
              (c) => c.name.toLowerCase() === finding.clause_name.toLowerCase()
            );

            return (
              <div
                key={idx}
                className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                  isExpanded
                    ? "bg-slate-900/60 border-slate-600 shadow-md"
                    : "bg-slate-900/20 border-slate-800/80 hover:bg-slate-900/40 hover:border-slate-700"
                }`}
              >
                {/* Accordion Trigger Header */}
                <div
                  onClick={() => toggleExpand(idx)}
                  className="p-4 cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">
                        {finding.clause_name}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(finding.status)}
                        {getRiskBadge(finding.risk_level, finding.status)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {finding.issue_description}
                    </p>
                  </div>

                  <button className="text-slate-400 hover:text-slate-200 p-1">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Expanded Comparative View */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800 bg-slate-900/30 overflow-hidden"
                    >
                      <div className="p-4 space-y-4 text-xs">
                        {/* Issue description statement */}
                        <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
                          <span className="font-bold text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
                            Legal Analysis Summary
                          </span>
                          <p className="text-slate-200 leading-relaxed text-xs">
                            {finding.issue_description}
                          </p>
                        </div>

                        {/* Comparative Layout (Only if not Missing) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Left: Gold Standard */}
                          <div className="bg-slate-900/40 p-3 rounded border border-slate-800 space-y-1.5">
                            <span className="font-bold text-[10px] text-emerald-400 block uppercase tracking-wider">
                              Gold Standard Standard Rule
                            </span>
                            {goldRule ? (
                              <>
                                <p className="text-slate-400 italic text-[10px] mb-1">
                                  {goldRule.description}
                                </p>
                                <div className="bg-slate-950 p-2.5 rounded text-slate-300 font-mono text-[10px] leading-normal overflow-x-auto whitespace-pre-wrap select-all max-h-36 overflow-y-auto">
                                  {goldRule.standardText}
                                </div>
                              </>
                            ) : (
                              <p className="text-slate-400 italic">No standard description loaded.</p>
                            )}
                          </div>

                          {/* Right: Extracted Clause */}
                          <div className="bg-slate-900/40 p-3 rounded border border-slate-800 space-y-1.5">
                            <span className="font-bold text-[10px] text-slate-400 block uppercase tracking-wider flex items-center justify-between">
                              Extracted Clause Segment
                              {finding.status === "Missing" && (
                                <span className="text-[9px] text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded border border-rose-500/25">
                                  Missing in Document
                                </span>
                              )}
                            </span>
                            {finding.status === "Missing" ? (
                              <div className="flex flex-col items-center justify-center h-28 text-slate-500 italic">
                                <XCircle className="h-8 w-8 text-rose-500/35 mb-2" />
                                <span>No matching clause found in your document.</span>
                              </div>
                            ) : (
                              <>
                                <p className="text-slate-400 italic text-[10px] mb-1">
                                  Found paragraph in contract:
                                </p>
                                <div className="bg-slate-950 p-2.5 rounded text-amber-300/90 font-mono text-[10px] leading-normal overflow-x-auto whitespace-pre-wrap select-all max-h-36 overflow-y-auto">
                                  {finding.matched_text_snippet || "Segment not precisely extracted but concept found."}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Suggested Correction Remediation */}
                        {finding.status !== "Compliant" && (
                          <div className="bg-slate-900/80 p-4 rounded-lg border border-emerald-500/20 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[10px] text-emerald-400 block uppercase tracking-wider flex items-center gap-1">
                                <ArrowRight className="h-3.5 w-3.5" /> Recommended Remediation Clause
                              </span>
                              <button
                                onClick={() =>
                                  handleCopyRemediation(
                                    finding.suggested_remediation,
                                    `remedy-${idx}`
                                  )
                                }
                                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded text-[10px] transition font-medium border border-slate-700/60"
                              >
                                {copiedId === `remedy-${idx}` ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-400" /> Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" /> Copy Clause
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                              {finding.suggested_remediation}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
