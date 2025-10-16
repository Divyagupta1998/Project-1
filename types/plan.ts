export interface PlanTask {
  title: string;
  owner?: string;
  due_date?: string;
  description?: string;
  external_id?: string;
}

export interface PlanMilestone {
  name: string;
  target_date?: string;
  description?: string;
}

export interface PlanPhase {
  phase: string;
  objectives?: string[];
  milestones: PlanMilestone[];
  tasks: PlanTask[];
}

export interface RiskEntry {
  risk: string;
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  mitigation: string;
  owner?: string;
  status?: string;
}

export interface ProductPlan {
  id?: string;
  created_at?: string;
  product_summary: string;
  objectives: string[];
  roadmap_phases: PlanPhase[];
  risk_register: RiskEntry[];
  last_synced_at?: string | null;
}

export interface ChangeLogEntry {
  type: "added" | "removed" | "modified";
  source: "asana" | "jira";
  task: PlanTask;
  previous_task?: PlanTask;
  timestamp: string;
}
