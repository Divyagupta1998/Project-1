import { NextResponse } from "next/server";
import { parseProductPlan } from "@/lib/planValidation";
import { syncPlanToJira } from "@/lib/jira";
import { supabase } from "@/lib/supabase";

interface SyncJiraRequest {
  planId: string;
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SyncJiraRequest;
    if (!body.planId || !body.baseUrl || !body.email || !body.apiToken || !body.projectKey) {
      return NextResponse.json({ error: "Missing Jira configuration" }, { status: 400 });
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

    const issues = await syncPlanToJira({
      auth: {
        baseUrl: body.baseUrl,
        email: body.email,
        apiToken: body.apiToken,
        projectKey: body.projectKey
      },
      plan
    });

    await supabase
      .from("plans")
      .update({
        last_synced_at: new Date().toISOString()
      })
      .eq("id", body.planId);

    return NextResponse.json({ issues });
  } catch (error) {
    console.error("syncJira error", error);
    return NextResponse.json({ error: "Failed to sync to Jira" }, { status: 500 });
  }
}
