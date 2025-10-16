# PlanPilot AI

PlanPilot AI is an MVP web application that uses GPT-4 to convert product ideas into structured execution plans. It synchronizes AI-generated tasks with Asana or Jira, tracks changes over time, and continuously analyzes delivery risks.

## Tech Stack
- **Frontend:** Next.js 13 (App Router) + Tailwind CSS + TypeScript
- **Backend:** Next.js API routes with Node.js
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4 Responses API
- **Integrations:** Asana REST API, Jira Cloud REST API

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in the required API keys and credentials in `.env.local`.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Visit [http://localhost:3000](http://localhost:3000) to access the PlanPilot AI UI.

## Supabase Schema
Apply the schema in `sql/schema.sql` to your Supabase project to provision the required tables.

## Folder Structure
```
app/                # Next.js routes (pages + API)
components/         # Reusable UI components
lib/                # Integration helpers (OpenAI, Supabase, Asana, Jira)
styles/             # Tailwind base styles
sql/                # Database schema
```

## Key API Routes
- `POST /api/generatePlan` – Generate a structured plan using GPT-4 and persist it to Supabase.
- `POST /api/syncAsana` – Create a project and tasks in Asana for the selected plan.
- `POST /api/syncJira` – Mirror plan structure as Jira epics and stories.
- `POST /api/checkChanges` – Compare remote tasks with the original plan and update the change log.
- `POST /api/analyzeRisks` – Ask GPT-4 to reassess project risks using the latest changes.
- `POST /api/generateReport` – Export a PDF summary of the plan and risk register.

## Development Notes
- All integration credentials are loaded from environment variables.
- The Asana and Jira utilities provide structured helper methods for OAuth-authenticated API calls.
- Risk analysis and plan generation leverage the OpenAI Responses API with JSON mode for deterministic parsing.
- Dashboard views are client-side and fetch supporting data from API routes for simplicity.

## Next Steps
- Implement secure OAuth flows for Asana and Jira and persist tokens per user.
- Replace placeholder change detection with real Asana/Jira API polling.
- Harden error handling and add unit/integration tests.
- Expand the PDF report to include timeline charts and resource allocations.
