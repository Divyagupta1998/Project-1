import type { ProductPlan } from "@/types/plan";
import { PlanViewer } from "@/components/PlanViewer";

interface PlanPageProps {
  params: {
    id: string;
  };
}

async function fetchPlan(id: string): Promise<ProductPlan | null> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/plan/${id}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { plan: ProductPlan };
  return data.plan;
}

export default async function PlanPage({ params }: PlanPageProps) {
  const plan = await fetchPlan(params.id);

  if (!plan) {
    return <p className="text-sm text-slate-400">Plan not found.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Plan Details</h1>
      <PlanViewer plan={plan} />
    </div>
  );
}
