import { NextResponse } from "next/server";
import { syncPlanToAsana } from "@/lib/asana";
import { parseProductPlan } from "@/lib/planValidation";
import { supabase } from "@/lib/supabase";

interface SyncAsanaRequest {
  planId: string;
  accessToken: string;
  workspaceId: string;
  teamId?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SyncAsanaRequest;
    if (!body.planId || !body.accessToken || !body.workspaceId) {
      return NextResponse.json({ error: "Missing Asana configuration" }, { status: 400 });
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

    const project = await syncPlanToAsana({
      auth: {
        accessToken: body.accessToken,
        workspaceId: body.workspaceId,
        teamId: body.teamId
      },
      plan
    });

    await supabase
      .from("plans")
      .update({
        last_synced_at: new Date().toISOString()
      })
      .eq("id", body.planId);

    return NextResponse.json({ project });
  } catch (error) {
    console.error("syncAsana error", error);
    return NextResponse.json({ error: "Failed to sync to Asana" }, { status: 500 });
  }
}
