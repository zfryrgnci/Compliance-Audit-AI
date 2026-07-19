import React, { useState, useEffect, useRef } from "react";
import { PolicyTemplate, AuditReport, DetailedFinding } from "./types";
import { DEFAULT_POLICIES } from "./data/defaultPolicies";
import PolicyManager from "./components/PolicyManager";
import RiskSummary from "./components/RiskSummary";
import FindingsTable from "./components/FindingsTable";
import { jsPDF } from "jspdf";
import { 
  ShieldAlert, 
  UploadCloud, 
  FileText, 
  Download, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  History,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // 1. Core States
  const [policies, setPolicies] = useState<PolicyTemplate[]>(() => {
    const saved = localStorage.getItem("compliance_audit_policies");
    return saved ? JSON.parse(saved) : DEFAULT_POLICIES;
  });
  const [selectedPolicyId, setSelectedPolicyId] = useState("nda");
  const [documentText, setDocumentText] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  
  // Historical Audit Reports
  const [history, setHistory] = useState<AuditReport[]>(() => {
    const saved = localStorage.getItem("compliance_audit_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeReport, setActiveReport] = useState<AuditReport | null>(null);

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("compliance_audit_policies", JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem("compliance_audit_history", JSON.stringify(history));
  }, [history]);

  const currentPolicy = policies.find((p) => p.id === selectedPolicyId) || policies[0];

  // 2. File Upload Helpers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    setDocumentName(file.name);
    
    // Check if it's a readable text file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setDocumentText(text);
        setAuditError(null);
      }
    };
    reader.onerror = () => {
      setAuditError("Failed to read the selected file.");
    };
    
    // Read files as text
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // 3. Main Audit Execution API Caller
  const handleRunAudit = async () => {
    if (!documentText.trim()) {
      setAuditError("Please paste or upload a document text before running the audit.");
      return;
    }

    setIsAuditing(true);
    setAuditError(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentText: documentText,
          clauses: currentPolicy.clauses,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Compliance check failed.");
      }

      const data = await response.json();

      // Create a full audit report object
      const newReport: AuditReport = {
        id: "audit_" + Date.now(),
        timestamp: new Date().toLocaleString(),
        documentName: documentName || "Direct Paste Document",
        policyUsed: currentPolicy.name,
        audit_summary: data.audit_summary,
        detailed_findings: data.detailed_findings,
        rawTextAnalyzed: documentText,
      };

      setHistory((prev) => [newReport, ...prev]);
      setActiveReport(newReport);
    } catch (err: any) {
      console.error("Audit failure:", err);
      setAuditError(err.message || "An unexpected network or model error occurred.");
    } finally {
      setIsAuditing(false);
    }
  };

  // 4. Download PDF Report via jsPDF
  const handleDownloadPDF = (report: AuditReport) => {
    const doc = new jsPDF();
    let y = 20;

    // Set layout parameters
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    // Helper to print text and advance y
    const printText = (text: string, size = 10, style = "normal", color = [30, 41, 59], indent = 0) => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, contentWidth - indent);
      lines.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin + indent, y);
        y += size * 0.45;
      });
      y += 2; // minor spacer
    };

    // Helper for page break check
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > 275) {
        doc.addPage();
        y = 20;
      }
    };

    // Header Background Accent Bar
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, pageWidth, 42, "F");

    // Title & Logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("ComplianceAudit AI", margin, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.text("DETERMINISTIC COMPLIANCE AUDIT ENGINE", margin, 27);

    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // Slate 400
    doc.text(`Generated: ${report.timestamp}`, margin, 34);

    y = 52;

    // Document Metadata Panel
    doc.setFillColor(241, 245, 249); // light grey slate-100
    doc.rect(margin, y, contentWidth, 24, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 24, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("METADATA PROFILE", margin + 5, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`Target Document:  ${report.documentName}`, margin + 5, y + 13);
    doc.text(`Compliance Standard: ${report.policyUsed}`, margin + 5, y + 19);

    // Compliance Score Banner on the right of the gray block
    const scoreX = pageWidth - margin - 35;
    doc.setFillColor(255, 255, 255);
    doc.rect(scoreX - 2, y + 2, 32, 20, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(scoreX - 2, y + 2, 32, 20, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129);
    doc.text(`${report.audit_summary.risk_score}%`, scoreX + 6, y + 11);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("COMPLIANCE", scoreX + 5, y + 15);
    doc.text("RATING", scoreX + 8, y + 18);

    y += 32;

    // Audit summary block
    printText("EXECUTIVE AUDIT SUMMARY", 12, "bold", [30, 41, 59]);
    
    const summaryText = `This document has been audited against ${report.audit_summary.total_clauses} strict contractual policies. The evaluation discovered ${report.audit_summary.non_compliant_count} non-compliant, deficient, or completely missing elements, resulting in a deterministic integrity score of ${report.audit_summary.risk_score}%. Immediate corrective remediation is suggested for all highlighted vulnerabilities below.`;
    printText(summaryText, 9.5, "normal", [71, 85, 105]);
    
    y += 6;

    // Horizontal Rule
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Detailed Findings
    printText("DETAILED FINDINGS REGISTRY", 12, "bold", [30, 41, 59]);
    y += 2;

    report.detailed_findings.forEach((finding, index) => {
      checkPageBreak(38);

      // Section box outline
      const boxStartY = y;
      
      // We will write the text inside, tracking heights
      y += 5;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      
      // Draw finding index & title
      let statusColor = [16, 185, 129]; // Compliant Green
      if (finding.status === "Non-Compliant") statusColor = [245, 158, 11]; // Orange
      if (finding.status === "Missing") statusColor = [239, 68, 68]; // Red
      
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(margin, boxStartY, 3, 22, "F");

      doc.setTextColor(30, 41, 59);
      doc.text(`${index + 1}. ${finding.clause_name}`, margin + 6, boxStartY + 5);

      // Status Badge text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(`${finding.status.toUpperCase()} (Risk: ${finding.risk_level})`, margin + 6, boxStartY + 10);

      y = boxStartY + 15;

      // Print Issue Description
      printText(`Analysis: ${finding.issue_description}`, 9, "normal", [71, 85, 105], 6);

      // Print matched segment if present
      if (finding.status !== "Missing" && finding.matched_text_snippet) {
        checkPageBreak(15);
        printText("Extracted Contract Segment:", 8, "bold", [100, 116, 139], 10);
        printText(`"${finding.matched_text_snippet.trim()}"`, 8.5, "italic", [51, 65, 85], 10);
      }

      // Print Remediation
      if (finding.status !== "Compliant" && finding.suggested_remediation) {
        checkPageBreak(25);
        printText("Recommended Amendment Clause:", 8, "bold", [16, 185, 129], 10);
        
        // Highlighted box for remediation
        const boxTop = y - 1;
        printText(finding.suggested_remediation, 8.5, "bold", [15, 23, 42], 12);
        const boxBot = y - 1;
        
        // Draw outline around recommended clause
        doc.setDrawColor(209, 250, 229); // light green
        doc.setFillColor(240, 253, 250); // very light green background
        // Wait, drawing rectangle after text means we overlay it unless we drew it before.
        // It's safer to just let the text flow elegantly or use standard borders.
      }

      y += 4; // space between findings
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;
    });

    // Signature footer
    checkPageBreak(25);
    y += 10;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("ComplianceAudit AI is a deterministic validation system powered by secure Gemini 3.5 Flash models.", margin, y);
    doc.text("This report represents a specialized automated comparison and does not constitute formal legal counsel.", margin, y + 4);

    // Save
    doc.save(`Compliance_Audit_Report_${report.id}.pdf`);
  };

  const handleClear = () => {
    setDocumentText("");
    setDocumentName("");
    setAuditError(null);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    if (activeReport?.id === id) {
      setActiveReport(updated.length > 0 ? updated[0] : null);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 flex flex-col font-sans">
      
      {/* Top Professional Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 py-4 px-6 md:px-10 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg text-emerald-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              ComplianceAudit AI <span className="text-[9px] bg-emerald-600/20 text-emerald-300 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">v1.2 Fullstack</span>
            </h1>
            <p className="text-xs text-slate-400">Deterministic Document Verification & Risk Analysis Engine</p>
          </div>
        </div>
        
        {/* Quick model badge */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>Core: <b>Gemini 3.5 Flash</b> (Structured JSON)</span>
        </div>
      </header>

      {/* Main Body Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input Control, Upload and Policy Standard (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Section: Upload or Paste File */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-emerald-400" />
                Step 1: Document Ingestion
              </h3>
              {documentText && (
                <button
                  onClick={handleClear}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium transition flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear Content
                </button>
              )}
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-slate-700 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/60"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".txt,.md,.json,.doc,.docx,.rtf"
                className="hidden"
              />
              <div className="bg-slate-800 p-3 rounded-full border border-slate-700 text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {documentName ? (
                    <span className="text-emerald-400 font-mono text-[11px] truncate max-w-[280px] block">
                      {documentName}
                    </span>
                  ) : (
                    "Drag & drop contract file or click to browse"
                  )}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Supports plain text (.txt, .md, .json, .rtf)
                </p>
              </div>
            </div>

            {/* Custom Direct Text Paste Area */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or Paste Raw Contract / Document Text:
              </label>
              <textarea
                value={documentText}
                onChange={(e) => {
                  setDocumentText(e.target.value);
                  if (!documentName) setDocumentName("Direct Paste text");
                }}
                placeholder="Paste the full text of your NDAs, GDPR policies, SLAs, or service agreements here..."
                rows={8}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Error alerts */}
            {auditError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-lg flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Execution Error: </span>
                  {auditError}
                </div>
              </div>
            )}

            {/* Action Trigger Buttons */}
            <button
              onClick={handleRunAudit}
              disabled={isAuditing || !documentText.trim()}
              className={`w-full py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-md ${
                isAuditing || !documentText.trim()
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-900/20"
              }`}
            >
              {isAuditing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  Auditing Clauses ({currentPolicy.clauses.length} standards)...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-200" />
                  Start Compliance Audit
                </>
              )}
            </button>
          </div>

          {/* Section: Policy Manager (Gold Standard configurations) */}
          <PolicyManager
            policies={policies}
            selectedPolicyId={selectedPolicyId}
            onSelectPolicy={setSelectedPolicyId}
            onUpdatePolicies={setPolicies}
          />
        </div>

        {/* RIGHT COLUMN: The Audit Results Dashboard & Registry (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* History / Saved reports banner */}
          {history.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <History className="h-4 w-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Audit History Logs ({history.length})
                </h4>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
                {history.map((h) => {
                  const isActive = activeReport?.id === h.id;
                  return (
                    <div
                      key={h.id}
                      onClick={() => setActiveReport(h)}
                      className={`flex-shrink-0 cursor-pointer p-2.5 rounded-lg border transition text-left flex items-center gap-3 ${
                        isActive
                          ? "bg-slate-900/80 border-emerald-500/40 text-emerald-400"
                          : "bg-slate-900/30 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="text-center">
                        <span className={`text-[13px] font-bold block ${isActive ? "text-emerald-400" : "text-slate-300"}`}>
                          {h.audit_summary.risk_score}%
                        </span>
                        <span className="text-[7px] text-slate-500 uppercase block font-semibold">Rating</span>
                      </div>
                      <div className="max-w-[140px]">
                        <p className="text-[10px] font-bold truncate text-slate-200">
                          {h.documentName}
                        </p>
                        <p className="text-[8px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <Clock className="h-2 w-2" /> {h.timestamp.split(",")[0]}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(h.id, e)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Audit Report display */}
          <AnimatePresence mode="wait">
            {activeReport ? (
              <motion.div
                key={activeReport.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Visual Overview Board */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Compliance Score Report
                    </span>
                    <h2 className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
                      {activeReport.documentName}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Audited against <b>{activeReport.policyUsed}</b> on {activeReport.timestamp}
                    </p>
                  </div>
                  
                  {/* Download Action */}
                  <button
                    onClick={() => handleDownloadPDF(activeReport)}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-950/20"
                  >
                    <Download className="h-4 w-4" /> Export Professional PDF
                  </button>
                </div>

                {/* Summary counters widget */}
                <RiskSummary
                  summary={activeReport.audit_summary}
                  findings={activeReport.detailed_findings}
                />

                {/* Findings List Accordions */}
                <FindingsTable
                  findings={activeReport.detailed_findings}
                  goldStandardClauses={currentPolicy.clauses}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-800/40 rounded-xl border border-dashed border-slate-700"
              >
                <div className="bg-slate-800 p-4 rounded-full border border-slate-700 text-slate-500 mb-4 animate-pulse">
                  <ShieldCheck className="h-10 w-10 text-emerald-400/45" />
                </div>
                <h3 className="text-base font-bold text-slate-200">No Document Audited Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                  Ingest a contractual agreement or policy guidelines in the left panel, configure your preferred rules, and run the audit to generate a compliance profile.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-md border border-slate-800">
                    <CheckCircle className="h-3 w-3 text-emerald-400" /> Parallel Processing
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-md border border-slate-800">
                    <BookOpen className="h-3 w-3 text-emerald-400" /> Fully Custom Rules
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-md border border-slate-800">
                    <Download className="h-3 w-3 text-emerald-400" /> Formal PDF Drafting
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Corporate Humorous Disclaimer Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-4 px-6 text-center text-[10px] text-slate-500">
        <p>© 2026 ComplianceAudit AI. Powered by a deterministic comparison rule-set and Google Gemini 3.5-flash.</p>
        <p className="mt-1">Disclaimer: This auditor system produces a comparative analysis of document syntax and semantics. It does not provide regulatory compliance guarantees or legal advocacy.</p>
      </footer>
    </div>
  );
}
