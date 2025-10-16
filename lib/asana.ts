import axios from "axios";
import { ProductPlan, PlanTask } from "@/types/plan";

const ASANA_BASE_URL = "https://app.asana.com/api/1.0";

interface AsanaAuthConfig {
  accessToken: string;
  workspaceId: string;
  teamId?: string;
}

interface SyncAsanaOptions {
  auth: AsanaAuthConfig;
  plan: ProductPlan;
}

interface AsanaTaskPayload {
  name: string;
  notes?: string;
  due_on?: string;
  assignee?: string;
}

async function createAsanaProject({ auth, name, notes }: { auth: AsanaAuthConfig; name: string; notes?: string }) {
  const response = await axios.post(
    `${ASANA_BASE_URL}/projects`,
    {
      data: {
        name,
        notes,
        workspace: auth.workspaceId,
        team: auth.teamId
      }
    },
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`
      }
    }
  );

  return response.data.data;
}

async function createAsanaTask({
  auth,
  projectId,
  task
}: {
  auth: AsanaAuthConfig;
  projectId: string;
  task: PlanTask;
}) {
  const payload: AsanaTaskPayload = {
    name: task.title,
    notes: task.description,
    due_on: task.due_date,
    assignee: task.owner
  };

  await axios.post(
    `${ASANA_BASE_URL}/tasks`,
    {
      data: {
        ...payload,
        projects: [projectId]
      }
    },
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`
      }
    }
  );
}

/**
 * Creates an Asana project with tasks mirroring the generated plan.
 */
export async function syncPlanToAsana({ auth, plan }: SyncAsanaOptions) {
  const project = await createAsanaProject({
    auth,
    name: plan.product_summary,
    notes: plan.objectives.join("\n")
  });

  for (const phase of plan.roadmap_phases) {
    for (const task of phase.tasks) {
      await createAsanaTask({ auth, projectId: project.gid, task });
    }
  }

  return project;
}
