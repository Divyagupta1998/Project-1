"use client";

import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";

export default function DashboardPage() {
  const [planId, setPlanId] = useState<string>("");

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">PlanPilot AI Dashboard</h1>
        <p className="text-sm text-slate-300">
          View live project health, risk insights, and change history for your AI-generated product plans.
        </p>
      </header>
      <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900 p-6">
        <label className="text-sm font-medium text-slate-200" htmlFor="plan-id">
          Plan ID
        </label>
        <input
          id="plan-id"
          value={planId}
          onChange={(event) => setPlanId(event.target.value)}
          placeholder="Paste a plan UUID"
          className="rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
        />
      </div>
      <Dashboard planId={planId} />
    </div>
  );
}
