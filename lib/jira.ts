import axios from "axios";
import { ProductPlan, PlanTask } from "@/types/plan";

interface JiraAuthConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

interface SyncJiraOptions {
  auth: JiraAuthConfig;
  plan: ProductPlan;
}

async function createJiraIssue({
  auth,
  issueType,
  summary,
  description,
  parentId
}: {
  auth: JiraAuthConfig;
  issueType: string;
  summary: string;
  description?: string;
  parentId?: string;
}) {
  const payload = {
    fields: {
      project: {
        key: auth.projectKey
      },
      summary,
      description,
      issuetype: {
        name: issueType
      },
      ...(parentId && {
        parent: {
          id: parentId
        }
      })
    }
  };

  const response = await axios.post(`${auth.baseUrl}/rest/api/3/issue`, payload, {
    auth: {
      username: auth.email,
      password: auth.apiToken
    },
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });

  return response.data;
}

function buildTaskDescription(task: PlanTask) {
  const details = [task.description, task.owner ? `Owner: ${task.owner}` : undefined, task.due_date ? `Due: ${task.due_date}` : undefined]
    .filter(Boolean)
    .join("\n");
  return details || undefined;
}

/**
 * Creates Jira epics and tasks that mirror the generated plan structure.
 */
export async function syncPlanToJira({ auth, plan }: SyncJiraOptions) {
  const createdIssues: Array<{ key: string; id: string }> = [];

  for (const phase of plan.roadmap_phases) {
    const epic = await createJiraIssue({
      auth,
      issueType: "Epic",
      summary: `${plan.product_summary} - ${phase.phase}`,
      description: phase.objectives?.join("\n")
    });
    createdIssues.push(epic);

    for (const task of phase.tasks) {
      const story = await createJiraIssue({
        auth,
        issueType: "Story",
        summary: task.title,
        description: buildTaskDescription(task),
        parentId: epic.id
      });
      createdIssues.push(story);
    }
  }

  return createdIssues;
}
