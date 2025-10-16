"use client";

import { useState } from "react";
import type { ProductPlan } from "@/types/plan";

interface InputFormProps {
  onPlanGenerated: (plan: ProductPlan) => void;
}

export function InputForm({ onPlanGenerated }: InputFormProps) {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generatePlan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ idea })
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      const data = (await response.json()) as { plan: ProductPlan };
      onPlanGenerated(data.plan);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">Describe your product or feature</h2>
      <textarea
        className="min-h-[180px] rounded-md border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
        placeholder="Explain the product vision, target users, key features, and desired outcomes."
        value={idea}
        onChange={(event) => setIdea(event.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate Plan"}
      </button>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </form>
  );
}
