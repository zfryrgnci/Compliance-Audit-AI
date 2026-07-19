import { PolicyTemplate } from "../types";

export const DEFAULT_POLICIES: PolicyTemplate[] = [
  {
    id: "nda",
    name: "Standard NDA (Non-Disclosure Agreement)",
    description: "Rules for mutual protection of confidential information, definition of confidential materials, exclusions, and remedies.",
    clauses: [
      {
        id: "mutual_obligations",
        name: "Mutual Confidentiality Obligations",
        standardText: "Both receiving and disclosing parties shall use the same degree of care to protect confidential information as they use for their own confidential information of a similar nature, but no less than a reasonable degree of care.",
        description: "Requires that confidentiality obligations are fully mutual, protecting both parties equally rather than unilaterally.",
        riskIfMissing: "High"
      },
      {
        id: "confidential_term",
        name: "Confidentiality Term (Duration)",
        standardText: "The obligations under this Agreement shall survive for a period of three (3) years from the date of disclosure of the Confidential Information.",
        description: "Sets a standard, commercially reasonable survival period of at least 3 years for confidential information protection.",
        riskIfMissing: "Medium"
      },
      {
        id: "standard_exclusions",
        name: "Exclusions from Confidential Information",
        standardText: "Confidential Information shall not include information that: (a) is or becomes publicly available through no breach; (b) was already in possession of the receiving party; (c) is received from a third party without restriction; or (d) is independently developed.",
        description: "Excludes public domain, prior knowledge, third-party disclosures, and independent development from confidentiality restrictions.",
        riskIfMissing: "Medium"
      },
      {
        id: "injunctive_relief",
        name: "Remedies and Injunctive Relief",
        standardText: "The receiving party acknowledges that any breach of this Agreement may cause irreparable harm for which monetary damages would be inadequate, and the disclosing party shall be entitled to seek injunctive relief.",
        description: "Ensures the disclosing party can stop unauthorized disclosures immediately via court-ordered injunctions.",
        riskIfMissing: "High"
      },
      {
        id: "governing_law",
        name: "Governing Law & Jurisdiction",
        standardText: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles.",
        description: "Specifies a clear, neutral state or national legal jurisdiction for resolving confidentiality disputes.",
        riskIfMissing: "Low"
      }
    ]
  },
  {
    id: "gdpr",
    name: "GDPR & Privacy Compliance",
    description: "Standard requirements for user data rights under global data protection regulations like GDPR, CCPA, and CPRA.",
    clauses: [
      {
        id: "right_to_be_forgotten",
        name: "Right to Be Forgotten (Data Deletion)",
        standardText: "Users shall have the right to request the erasure of their personal data without undue delay, and the company shall delete such personal data within 30 days of receiving a verified request.",
        description: "Guarantees users the ability to permanently erase their personal information from the systems and databases.",
        riskIfMissing: "High"
      },
      {
        id: "data_portability",
        name: "Data Portability Right",
        standardText: "The data subject shall have the right to receive their personal data in a structured, commonly used, and machine-readable format, and have the right to transmit those data to another controller.",
        description: "Allows users to download and transfer their personal data to other applications or competitors.",
        riskIfMissing: "Medium"
      },
      {
        id: "breach_notification",
        name: "Data Breach Notification (72 Hours)",
        standardText: "In the case of a personal data breach, the company shall without undue delay, and where feasible, not later than 72 hours after having become aware of it, notify the supervisory authority and affected users.",
        description: "Sets a strict compliance timeline of 72 hours for alerting regulators and users of data exposures.",
        riskIfMissing: "High"
      },
      {
        id: "lawful_consent",
        name: "Lawful Basis and Explicit Consent",
        standardText: "The processing of personal data is only lawful if the user has given explicit, affirmative, and unambiguous consent for one or more specific purposes, which can be freely withdrawn at any time.",
        description: "Prohibits pre-ticked consent boxes or forced consent, mandating active opt-in confirmation for users.",
        riskIfMissing: "High"
      }
    ]
  },
  {
    id: "sla",
    name: "SLA (Service Level Agreement)",
    description: "Uptime targets, maintenance notification periods, and credit systems for hosted services.",
    clauses: [
      {
        id: "uptime_target",
        name: "Uptime Guarantee (99.9%)",
        standardText: "The service shall achieve a Monthly Uptime Percentage of at least 99.9% during any billing cycle, excluding scheduled maintenance.",
        description: "Provides a firm commitment on service availability, protecting customers from prolonged unexpected downtime.",
        riskIfMissing: "High"
      },
      {
        id: "maintenance_notice",
        name: "Maintenance Notification Window",
        standardText: "The provider shall notify the client of scheduled maintenance at least seven (7) days in advance, and such maintenance shall be conducted during low-traffic windows (2:00 AM to 5:00 AM UTC).",
        description: "Requires advanced notice of scheduled downtime so clients can plan their business operations accordingly.",
        riskIfMissing: "Medium"
      },
      {
        id: "service_credits",
        name: "Service Credits Remediation",
        standardText: "If the Monthly Uptime Percentage falls below 99.9%, the client shall be entitled to receive service credits equal to 10% of the monthly fee, scaling up to 50% if uptime drops below 99.0%.",
        description: "Defines concrete financial or credit-based penalties when the provider fails to meet their uptime guarantees.",
        riskIfMissing: "Medium"
      }
    ]
  }
];
