<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Architecture-AI_First-purple.svg?style=for-the-badge" alt="Architecture" />

  <h1>⚖️ Compliance Audit AI</h1>
  <p><em>Deterministic Document Verification & Risk Analysis Engine</em></p>
</div>

---

## 🚀 Overview

**Compliance Audit AI** is an enterprise-grade risk analysis engine that deterministically audits massive legal contracts against a set of "Golden Rules." Powered by Google's `gemini-3.5-flash` model and wrapped in a stunning, high-performance React frontend, it replaces manual contract review.

## ✨ Key Features
- 🧠 **Deterministic Scoring Engine**: Calculates an exact "Risk Score" out of 100 based on rigorous rule matching.
- 🎨 **Premium UI/UX**: Built with Tailwind v4 and Framer Motion for buttery-smooth animations and glassmorphic tables.
- ⚡ **Asynchronous Bulk Parsing**: Scans dozens of clauses simultaneously for near-instant results.
- 📝 **Remediation Generation**: Automatically generates suggested contract amendments for missing or non-compliant clauses.

## 🛠 Tech Stack
- **Frontend**: React 19, TailwindCSS v4, Vite, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, TypeScript.
- **AI Core**: `@google/genai` (Gemini API) enforcing rigorous JSON schema compliance.

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v24+)
- A Free [Google Gemini API Key](https://aistudio.google.com/)

### 2. Setup
Clone the repo and configure the environment:
```bash
git clone https://github.com/zfryrgnci/Compliance-Audit-AI.git
cd Compliance-Audit-AI
npm install
```

Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_free_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```

## 🧪 Testing Suite
This project implements `Vitest` and `Supertest` for backend route validation:
```bash
npm run test
```

## 🤝 Open Source
Created by [Zafer Yorganci](https://github.com/zfryrgnci). Feel free to fork, star, and use this to optimize your legal operations!
