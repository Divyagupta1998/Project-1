"use client";

import { useEffect, useState } from "react";
import type { ChangeLogEntry, ProductPlan, RiskEntry } from "@/types/plan";

interface DashboardProps {
  planId?: string;
}

interface DashboardState {
  plan: ProductPlan | null;
  risks: RiskEntry[];
  changeLog: ChangeLogEntry[];
  loading: boolean;
}

export function Dashboard({ planId }: DashboardProps) {
  const [state, setState] = useState<DashboardState>({
    plan: null,
    risks: [],
    changeLog: [],
    loading: true
  });

  useEffect(() => {
    async function loadData() {
      if (!planId) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      const [planResponse, riskResponse] = await Promise.all([
        fetch(`/api/plan/${planId}`),
        fetch(`/api/riskLogs/${planId}`)
      ]);

      const planData = planResponse.ok ? ((await planResponse.json()) as { plan: ProductPlan }) : { plan: null };
      const riskData = riskResponse.ok
        ? ((await riskResponse.json()) as { risks: RiskEntry[]; change_log: ChangeLogEntry[] })
        : { risks: [], change_log: [] };

      setState({
        plan: planData.plan,
        risks: riskData.risks,
        changeLog: riskData.change_log,
        loading: false
      });
    }

    void loadData();
  }, [planId]);

  const handleGenerateReport = async () => {
    if (!planId) return;
    const response = await fetch("/api/generateReport", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ planId })
    });

    if (!response.ok) {
      console.error("Failed to generate report");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "planpilot-report.pdf";
    link.click();
  };

  if (state.loading) {
    return <p className="text-sm text-slate-400">Loading dashboard...</p>;
  }

  if (!state.plan) {
    return <p className="text-sm text-slate-400">No plan selected yet.</p>;
  }

  return (
    <section className="space-y-6 rounded-lg border border-slate-800 bg-slate-900 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Dashboard</h2>
          <p className="text-sm text-slate-400">Plan synced on {state.plan.last_synced_at ?? "Not synced yet"}</p>
        </div>
        <button
          className="rounded-md bg-sky-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-400"
          onClick={handleGenerateReport}
        >
          Generate Report
        </button>
      </header>

      <section>
        <h3 className="text-lg font-semibold">Risk Register</h3>
        <ul className="mt-3 space-y-2">
          {state.risks.map((risk) => (
            <li key={risk.risk} className="rounded border border-slate-800 p-3 text-sm text-slate-300">
              <p className="font-semibold">
                {risk.risk} <span className="text-xs text-slate-400">({risk.likelihood} / {risk.impact})</span>
              </p>
              <p className="text-xs text-slate-400">Mitigation: {risk.mitigation}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold">Change Log</h3>
        <ul className="mt-3 space-y-2">
          {state.changeLog.map((item, index) => (
            <li key={`${item.timestamp}-${index}`} className="rounded border border-slate-800 p-3 text-sm text-slate-300">
              <p className="font-semibold">{item.type.toUpperCase()} ({item.source})</p>
              <p className="text-xs text-slate-400">Task: {item.task.title}</p>
              <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
