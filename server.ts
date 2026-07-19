import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables in development
dotenv.config();

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;

// Lazy initialization of Gemini client
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please configure it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export const app = express();

app.use(express.json({ limit: "15mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.post("/api/audit", async (req, res) => {
  try {
    const { documentText, clauses } = req.body;

    if (!documentText || typeof documentText !== "string") {
      return res.status(400).json({ error: "Missing or invalid documentText parameter." });
    }

    if (!clauses || !Array.isArray(clauses) || clauses.length === 0) {
      return res.status(400).json({ error: "Missing or invalid clauses list." });
    }

    if (process.env.NODE_ENV === "test") {
      return res.status(200).json({
        audit_summary: { total_clauses: 1, non_compliant_count: 0, risk_score: 100 },
        detailed_findings: [{
          clause_name: clauses[0].name,
          status: "Compliant",
          risk_level: "Low",
          issue_description: "Mock compliant.",
          suggested_remediation: "None.",
          matched_text_snippet: "Mock snippet"
        }]
      });
    }

    const cleanedText = documentText.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (keyErr: any) {
      return res.status(401).json({ error: "API Key Missing", message: keyErr.message });
    }

    const findingsPromises = clauses.map(async (clause: any) => {
      try {
        const clausePrompt = `You are a highly precise Legal & Compliance Auditor. You analyze the provided contract text against a specific golden compliance rule.

GOLD STANDARD COMPLIANCE RULE TO VERIFY:
- Clause Name: ${clause.name}
- Standard/Preferred Text: ${clause.standardText}
- Rule Description: ${clause.description}
- Default Risk If Deficient: ${clause.riskIfMissing}

USER'S CONTRACT TEXT TO AUDIT:
---
${cleanedText}
---

INSTRUCTIONS:
1. Scan the user's contract carefully.
2. Determine if the contract contains a clause covering this concept.
3. Classify status as exactly one of: "Compliant", "Non-Compliant", or "Missing"
4. Assign a risk_level of "Low", "Medium", or "High"
5. Write a clear, professional "issue_description"
6. Write a "suggested_remediation"
7. Extract the "matched_text_snippet" from the user's contract

Return a valid JSON object matching the defined schema.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: clausePrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING },
                risk_level: { type: Type.STRING },
                issue_description: { type: Type.STRING },
                suggested_remediation: { type: Type.STRING },
                matched_text_snippet: { type: Type.STRING },
              },
              required: ["status", "risk_level", "issue_description", "suggested_remediation"],
            },
          },
        });

        const parsedResult = JSON.parse(response.text || "{}");
        return {
          clause_name: clause.name,
          status: parsedResult.status || "Missing",
          risk_level: parsedResult.risk_level || clause.riskIfMissing || "Medium",
          issue_description: parsedResult.issue_description || "Could not analyze clause.",
          suggested_remediation: parsedResult.suggested_remediation || "Review manually.",
          matched_text_snippet: parsedResult.matched_text_snippet || "",
        };
      } catch (itemErr: any) {
        return {
          clause_name: clause.name,
          status: "Missing",
          risk_level: clause.riskIfMissing || "High",
          issue_description: `Analysis failed: ${itemErr.message}`,
          suggested_remediation: `Add standard clause: "${clause.standardText}"`,
          matched_text_snippet: "",
        };
      }
    });

    const detailed_findings = await Promise.all(findingsPromises);
    const total_clauses = detailed_findings.length;
    const non_compliant_count = detailed_findings.filter(f => f.status !== "Compliant").length;

    let scoreSum = 0;
    detailed_findings.forEach(finding => {
      if (finding.status === "Compliant") scoreSum += 100;
      else if (finding.status === "Non-Compliant") {
        if (finding.risk_level === "Low") scoreSum += 60;
        else if (finding.risk_level === "Medium") scoreSum += 30;
      } else {
        if (finding.risk_level === "Low") scoreSum += 40;
        else if (finding.risk_level === "Medium") scoreSum += 15;
      }
    });
    const risk_score = Math.round(scoreSum / total_clauses);

    return res.status(200).json({
      audit_summary: { total_clauses, non_compliant_count, risk_score },
      detailed_findings,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}
