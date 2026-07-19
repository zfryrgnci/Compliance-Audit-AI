import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server.js";

describe("POST /api/audit", () => {
  it("should return 400 if documentText is missing", async () => {
    const response = await request(app)
      .post("/api/audit")
      .send({ clauses: [{ name: "Test" }] });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return mocked successful audit data", async () => {
    const response = await request(app)
      .post("/api/audit")
      .send({ 
        documentText: "Mock contract text.",
        clauses: [{ name: "Confidentiality" }] 
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("audit_summary");
    expect(response.body).toHaveProperty("detailed_findings");
    expect(response.body.audit_summary.risk_score).toBe(100);
  });
});
