export interface PolicyClause {
  id: string;
  name: string;
  standardText: string;
  description: string;
  riskIfMissing: "Low" | "Medium" | "High";
}

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  clauses: PolicyClause[];
}

export interface AuditSummary {
  total_clauses: number;
  non_compliant_count: number;
  risk_score: number; // 0 to 100
}

export interface DetailedFinding {
  clause_name: string;
  status: "Compliant" | "Non-Compliant" | "Missing";
  risk_level: "Low" | "Medium" | "High";
  issue_description: string;
  suggested_remediation: string;
  matched_text_snippet?: string;
}

export interface AuditReport {
  id: string;
  timestamp: string;
  documentName: string;
  policyUsed: string;
  audit_summary: AuditSummary;
  detailed_findings: DetailedFinding[];
  rawTextAnalyzed: string;
}
