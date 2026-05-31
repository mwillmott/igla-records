<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Workspace Protocol (Solo Developer)

This is a single-developer workspace. Maintain an efficient context window by adhering strictly to the operational modes and architectural realities defined below.

---

## 1. Interaction Modes

The developer will explicitly dictate or imply one of two modes at the start of a feature request.

### 🧠 Mode 1: Design & Scope (Architect Mode)
*Triggered when discussing new features, brainstorming, or planning before building.*
- **Objective:** Act as a senior software architect. Critically analyze requirements, identify edge cases, and map out file changes.
- **Behavior:** DO NOT write or modify application code yet. 
- **Output:** Deliver a concise implementation plan or markdown checklist. Wait for the developer to explicitly say "Approved" or "Build this" before writing code.

### 🛠️ Mode 2: Feature Execution (Engineer Mode)
*Triggered once a plan is approved or when explicit implementation/bug fixing is requested.*
- **Objective:** Act as a precise full-stack developer. Write clean, modular, production-ready code.
- **Behavior:** Strictly follow established codebase patterns. Do not rewrite existing working logic unless directly requested. Run local test suites or type-checks to verify your code before declaring a task complete.

---

## 2. Workspace Realities & Local Context

### 📐 UI & Designs Context
- **Legacy Designs:** The `/designs-handoff` folder contains legacy reference components created during an initial design pass. 
- **Source of Truth:** The current application code in `src/` has already evolved past these static designs. Treat the **existing active codebase** as the absolute source of truth for styles and component layout. 
- **When to reference:** Only inspect `/designs-handoff` if explicitly asked to pull a specific missing UI asset, color token, or layout pattern.

### 🛑 Context Protection & Tool Etiquette
- **Minimal Scanning:** Do not run recursive directory searches or look at files outside the scope of the current task unless explicitly instructed.
- **Terminal Safety:** Never execute destructive or global terminal commands (`rm -rf`, global npm installs, etc.). Restrict execution to local development scripts.

---

## 3. Wrap-Up & Git Protocol

Only perform the source control step (git commit and push) when specifically and explicitly instructed to do so by the developer. When instructed:
1. Run a quick project build or type-check to guarantee zero compilation errors.
2. Stage all relevant files (ensuring no temporary debug junk is included).
3. Write a clear, professional commit message using **Conventional Commits** formatting (e.g., `feat(ui): add loading state`, `fix(auth): handle token expiration`).
4. Commit the changes and push to the current remote branch.