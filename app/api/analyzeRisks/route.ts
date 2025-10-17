import { NextResponse } from "next/server";
import { analyzeRisksWithAI } from "@/lib/openai";
import { parseProductPlan } from "@/lib/planValidation";
import { supabase } from "@/lib/supabase";

interface AnalyzeRisksRequest {
  planId: string;
  changesSummary?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRisksRequest;
    if (!body.planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("plans")
      .select("id, plan_json")
      .eq("id", body.planId)
      .single();

    if (error || !data) {
      throw error ?? new Error("Plan not found");
    }

    const plan = parseProductPlan(data.plan_json);

    const risks = await analyzeRisksWithAI({
      plan,
      changes: body.changesSummary
    });

    await supabase
      .from("risk_logs")
      .insert({
        plan_id: body.planId,
        risks,
        changes_summary: body.changesSummary ?? null
      });

    return NextResponse.json({ risk_register: risks });
  } catch (error) {
    console.error("analyzeRisks error", error);
    return NextResponse.json({ error: "Failed to analyze risks" }, { status: 500 });
  }
}
