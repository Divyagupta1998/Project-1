import { NextResponse } from "next/server";
import { parseChangeLog, parseRiskRegister } from "@/lib/planValidation";
import { supabase } from "@/lib/supabase";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = params;

    const { data: planData } = await supabase
      .from("plans")
      .select("change_log")
      .eq("id", id)
      .single();

    const { data: riskRows } = await supabase
      .from("risk_logs")
      .select("risks")
      .eq("plan_id", id)
      .order("created_at", { ascending: false });

    const risks = riskRows?.flatMap((row) => parseRiskRegister(row.risks)) ?? [];
    const changeLog = parseChangeLog(planData?.change_log);

    return NextResponse.json({ risks, change_log: changeLog });
  } catch (error) {
    console.error("riskLogs GET error", error);
    return NextResponse.json({ error: "Failed to load risk logs" }, { status: 500 });
  }
}
