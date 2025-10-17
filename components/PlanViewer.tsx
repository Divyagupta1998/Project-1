"use client";

import { useState } from "react";
import type { ProductPlan } from "@/types/plan";

interface PlanViewerProps {
  plan: ProductPlan;
}

export function PlanViewer({ plan }: PlanViewerProps) {
  const [status, setStatus] = useState<string | null>(null);

  const handleAction = async (endpoint: string, payload: Record<string, unknown>) => {
    setStatus("Processing...");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Action failed");
      }

      setStatus("Success");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  return (
    <section className="space-y-6 rounded-lg border border-slate-800 bg-slate-900 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Generated Plan</h2>
          <p className="text-sm text-slate-300">Created {plan.created_at ? new Date(plan.created_at).toLocaleString() : "recently"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md bg-sky-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-400"
            onClick={() =>
              handleAction("/api/syncAsana", {
                planId: plan.id,
                accessToken: "ASANA_ACCESS_TOKEN",
                workspaceId: "ASANA_WORKSPACE_ID"
              })
            }
          >
            Sync to Asana
          </button>
          <button
            className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-400"
            onClick={() =>
              handleAction("/api/syncJira", {
                planId: plan.id,
                baseUrl: "https://your-domain.atlassian.net",
                email: "jira-user@example.com",
                apiToken: "JIRA_API_TOKEN",
                projectKey: "PLAN"
              })
            }
          >
            Sync to Jira
          </button>
          <button
            className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-amber-400"
            onClick={() =>
              handleAction("/api/analyzeRisks", {
                planId: plan.id,
                changesSummary: "No new changes"
              })
            }
          >
            Reanalyze Risks
          </button>
        </div>
      </header>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Product Summary</h3>
          <p className="text-sm text-slate-300">{plan.product_summary}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Objectives</h3>
          <ul className="list-disc space-y-1 pl-6 text-sm text-slate-300">
            {plan.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-6">
          {plan.roadmap_phases.map((phase) => (
            <div key={phase.phase} className="rounded-md border border-slate-800 p-4">
              <h4 className="text-base font-semibold">{phase.phase}</h4>
              {phase.objectives?.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-6 text-xs text-slate-400">
                  {phase.objectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div>
                  <h5 className="font-medium">Milestones</h5>
                  <ul className="mt-1 space-y-2">
                    {phase.milestones.map((milestone) => (
                      <li key={milestone.name} className="rounded border border-slate-800 p-2">
                        <p className="font-medium">{milestone.name}</p>
                        {milestone.description ? <p className="text-xs text-slate-400">{milestone.description}</p> : null}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium">Tasks</h5>
                  <ul className="mt-1 space-y-2">
                    {phase.tasks.map((task) => (
                      <li key={task.title} className="rounded border border-slate-800 p-2">
                        <p className="font-medium">{task.title}</p>
                        {task.owner ? <p className="text-xs text-slate-400">Owner: {task.owner}</p> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold">Risk Register</h3>
          <ul className="space-y-2">
            {plan.risk_register.map((risk) => (
              <li key={risk.risk} className="rounded border border-slate-800 p-3 text-sm text-slate-300">
                <p className="font-semibold">
                  {risk.risk} <span className="text-xs text-slate-400">({risk.likelihood} / {risk.impact})</span>
                </p>
                <p className="text-xs text-slate-400">Mitigation: {risk.mitigation}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {status ? <p className="text-sm text-slate-400">{status}</p> : null}
    </section>
  );
}
