import { NextResponse } from "next/server";
import { parseProductPlan } from "@/lib/planValidation";
import { supabase } from "@/lib/supabase";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("plans")
      .select("id, plan_json, created_at, last_synced_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw error ?? new Error("Plan not found");
    }

    const plan = parseProductPlan(data.plan_json);

    return NextResponse.json({
      plan: {
        ...plan,
        id: data.id,
        created_at: data.created_at,
        last_synced_at: data.last_synced_at
      }
    });
  } catch (error) {
    console.error("plan GET error", error);
    return NextResponse.json({ error: "Failed to load plan" }, { status: 500 });
  }
}
