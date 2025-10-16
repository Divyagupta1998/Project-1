"use client";

import { useState } from "react";
import { InputForm } from "@/components/InputForm";
import { PlanViewer } from "@/components/PlanViewer";
import type { ProductPlan } from "@/types/plan";

export default function HomePage() {
  const [plan, setPlan] = useState<ProductPlan | null>(null);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">PlanPilot AI</h1>
        <p className="text-sm text-slate-300">
          Generate AI-driven product roadmaps, sync plans to your favorite workspaces, and track delivery risks in one place.
        </p>
      </header>
      <InputForm onPlanGenerated={setPlan} />
      {plan ? <PlanViewer plan={plan} /> : null}
    </div>
  );
}
