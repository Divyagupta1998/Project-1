import type { ChangeLogEntry, PlanMilestone, PlanPhase, PlanTask, ProductPlan, RiskEntry } from "@/types/plan";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function ensureString(value: unknown, fallbackMessage: string): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  throw new Error(fallbackMessage);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function parseTask(value: unknown): PlanTask {
  if (!isRecord(value)) {
    throw new Error("Invalid task entry");
  }

  return {
    title: ensureString(value.title, "Task title is required"),
    owner: optionalString(value.owner),
    due_date: optionalString(value.due_date),
    description: optionalString(value.description),
    external_id: optionalString(value.external_id)
  };
}

function parseMilestone(value: unknown): PlanMilestone {
  if (!isRecord(value)) {
    throw new Error("Invalid milestone entry");
  }

  return {
    name: ensureString(value.name, "Milestone name is required"),
    target_date: optionalString(value.target_date),
    description: optionalString(value.description)
  };
}

function parsePhase(value: unknown): PlanPhase {
  if (!isRecord(value)) {
    throw new Error("Invalid roadmap phase");
  }

  const milestonesRaw = Array.isArray(value.milestones) ? value.milestones : [];
  const tasksRaw = Array.isArray(value.tasks) ? value.tasks : [];

  return {
    phase: ensureString(value.phase, "Roadmap phase name is required"),
    objectives: Array.isArray(value.objectives)
      ? value.objectives.filter((objective): objective is string => typeof objective === "string" && objective.trim().length > 0)
      : undefined,
    milestones: milestonesRaw.map(parseMilestone),
    tasks: tasksRaw.map(parseTask)
  };
}

function parseRisk(value: unknown): RiskEntry {
  if (!isRecord(value)) {
    throw new Error("Invalid risk entry");
  }

  const likelihood = ensureString(value.likelihood, "Risk likelihood is required");
  const impact = ensureString(value.impact, "Risk impact is required");

  if (!(["Low", "Medium", "High"] as const).includes(likelihood as RiskEntry["likelihood"])) {
    throw new Error("Risk likelihood must be Low, Medium, or High");
  }

  if (!(["Low", "Medium", "High"] as const).includes(impact as RiskEntry["impact"])) {
    throw new Error("Risk impact must be Low, Medium, or High");
  }

  return {
    risk: ensureString(value.risk, "Risk description is required"),
    likelihood: likelihood as RiskEntry["likelihood"],
    impact: impact as RiskEntry["impact"],
    mitigation: ensureString(value.mitigation, "Risk mitigation is required"),
    owner: optionalString(value.owner),
    status: optionalString(value.status)
  };
}

export function parseProductPlan(raw: unknown): ProductPlan {
  if (!isRecord(raw)) {
    throw new Error("Plan payload must be an object");
  }

  const objectives = Array.isArray(raw.objectives)
    ? raw.objectives.filter((objective): objective is string => typeof objective === "string" && objective.trim().length > 0)
    : [];

  const phasesRaw = Array.isArray(raw.roadmap_phases) ? raw.roadmap_phases : [];
  const risksRaw = Array.isArray(raw.risk_register) ? raw.risk_register : [];

  const plan: ProductPlan = {
    id: optionalString(raw.id),
    created_at: optionalString(raw.created_at),
    last_synced_at: typeof raw.last_synced_at === "string" ? raw.last_synced_at : null,
    product_summary: ensureString(raw.product_summary, "Product summary is required"),
    objectives,
    roadmap_phases: phasesRaw.map(parsePhase),
    risk_register: risksRaw.map(parseRisk)
  };

  return plan;
}

export function parseRiskRegister(raw: unknown): RiskEntry[] {
  const risks = Array.isArray(raw) ? raw : [];
  return risks.map(parseRisk);
}

export function parseChangeLog(raw: unknown): ChangeLogEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }

      const type = ensureString(entry.type, "Change log type is required");
      const source = ensureString(entry.source, "Change log source is required");
      const task = parseTask(entry.task);

      if (!(["added", "removed", "modified"] as const).includes(type as ChangeLogEntry["type"])) {
        throw new Error("Invalid change log type");
      }

      if (!(["asana", "jira"] as const).includes(source as ChangeLogEntry["source"])) {
        throw new Error("Invalid change log source");
      }

      return {
        type: type as ChangeLogEntry["type"],
        source: source as ChangeLogEntry["source"],
        task,
        previous_task: entry.previous_task ? parseTask(entry.previous_task) : undefined,
        timestamp: ensureString(entry.timestamp, "Change log timestamp is required")
      } satisfies ChangeLogEntry;
    })
    .filter((entry): entry is ChangeLogEntry => entry !== null);
}
