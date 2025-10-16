import { NextResponse } from "next/server";
import { generatePlanFromIdea } from "@/lib/openai";
import { supabase } from "@/lib/supabase";
import type { ProductPlan } from "@/types/plan";

interface GeneratePlanRequest {
  idea: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GeneratePlanRequest;
    const idea = body.idea?.trim();

    if (!idea) {
      return NextResponse.json({ error: "Missing idea" }, { status: 400 });
    }

    const plan = await generatePlanFromIdea({ productSummary: idea });

    const { data, error } = await supabase
      .from("plans")
      .insert({
        idea,
        plan_json: plan
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const responsePlan: ProductPlan = {
      ...plan,
      id: data.id,
      created_at: data.created_at
    };

    return NextResponse.json({ plan: responsePlan });
  } catch (error) {
    console.error("generatePlan error", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
