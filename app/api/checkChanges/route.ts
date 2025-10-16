import { NextResponse } from "next/server";
import { parseChangeLog, parseProductPlan } from "@/lib/planValidation";
import { supabase } from "@/lib/supabase";
import type { ChangeLogEntry, PlanTask } from "@/types/plan";

interface CheckChangesRequest {
  planId: string;
}

function diffTasks(originalTasks: PlanTask[], currentTasks: PlanTask[], source: ChangeLogEntry["source"]): ChangeLogEntry[] {
  const logs: ChangeLogEntry[] = [];
  const originalByTitle = new Map(originalTasks.map((task) => [task.title, task]));
  const currentByTitle = new Map(currentTasks.map((task) => [task.title, task]));

  for (const [title, task] of currentByTitle.entries()) {
    if (!originalByTitle.has(title)) {
      logs.push({ type: "added", source, task, timestamp: new Date().toISOString() });
    } else {
      const previous = originalByTitle.get(title)!;
      if (JSON.stringify(previous) !== JSON.stringify(task)) {
        logs.push({
          type: "modified",
          source,
          task,
          previous_task: previous,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  for (const [title, task] of originalByTitle.entries()) {
    if (!currentByTitle.has(title)) {
      logs.push({ type: "removed", source, task, timestamp: new Date().toISOString() });
    }
  }

  return logs;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckChangesRequest;
    if (!body.planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("plans")
      .select("id, plan_json, change_log")
      .eq("id", body.planId)
      .single();

    if (error || !data) {
      throw error ?? new Error("Plan not found");
    }

    const plan = parseProductPlan(data.plan_json);

    // Placeholder: Replace with actual Asana/Jira API pulls.
    const latestAsanaTasks = plan.roadmap_phases.flatMap((phase) => phase.tasks);
    const latestJiraTasks = plan.roadmap_phases.flatMap((phase) => phase.tasks);

    const diff: ChangeLogEntry[] = [
      ...diffTasks(plan.roadmap_phases.flatMap((phase) => phase.tasks), latestAsanaTasks, "asana"),
      ...diffTasks(plan.roadmap_phases.flatMap((phase) => phase.tasks), latestJiraTasks, "jira")
    ];

    const existingChangeLog = parseChangeLog(data.change_log);
    const changeLog = [...existingChangeLog, ...diff];

    await supabase
      .from("plans")
      .update({
        change_log: changeLog
      })
      .eq("id", body.planId);

    return NextResponse.json({ change_log: changeLog });
  } catch (error) {
    console.error("checkChanges error", error);
    return NextResponse.json({ error: "Failed to check changes" }, { status: 500 });
  }
}
