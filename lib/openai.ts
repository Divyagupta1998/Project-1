import { OpenAI } from "openai";
import { parseProductPlan, parseRiskRegister } from "@/lib/planValidation";
import { ProductPlan } from "@/types/plan";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface GeneratePlanPayload {
  productSummary: string;
}

export interface AnalyzeRisksPayload {
  plan: ProductPlan;
  changes?: string;
}

/**
 * Calls OpenAI to generate a structured product plan in JSON format.
 */
export async function generatePlanFromIdea({
  productSummary
}: GeneratePlanPayload): Promise<ProductPlan> {
  const prompt = `Analyze the following product description and generate a structured product plan with phases, milestones, detailed tasks, and a risk register formatted in JSON.\n\nProduct description:\n${productSummary}\n\nRespond strictly with valid JSON following this schema:\n{\n  "product_summary": string,\n  "objectives": string[],\n  "roadmap_phases": [\n    {\n      "phase": string,\n      "objectives": string[],\n      "milestones": [{"name": string, "target_date": string, "description": string}],\n      "tasks": [{"title": string, "owner": string, "due_date": string, "description": string}]\n    }\n  ],\n  "risk_register": [{"risk": string, "likelihood": "Low"|"Medium"|"High", "impact": "Low"|"Medium"|"High", "mitigation": string, "owner": string, "status": string}]\n}`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    response_format: { type: "json_object" }
  });

  const content = response.output[0]?.content?.[0];
  if (content?.type !== "output_text") {
    throw new Error("Unexpected OpenAI response format");
  }

  const parsedJson = JSON.parse(content.text) as unknown;
  const plan = parseProductPlan(parsedJson);
  return plan;
}

/**
 * Calls OpenAI to analyze risks based on a plan and latest changes.
 */
export async function analyzeRisksWithAI({
  plan,
  changes
}: AnalyzeRisksPayload): Promise<ProductPlan["risk_register"]> {
  const diffSummary = changes ?? "No external changes detected.";
  const prompt = `You are a project risk analyst. Review the product plan and external changes to identify risks. Return JSON with an array named risk_register with enriched risk details.\n\nPlan JSON:\n${JSON.stringify(plan)}\n\nChanges:\n${diffSummary}`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    response_format: { type: "json_object" }
  });

  const content = response.output[0]?.content?.[0];
  if (content?.type !== "output_text") {
    throw new Error("Unexpected OpenAI response format");
  }

  const parsed = JSON.parse(content.text) as { risk_register?: unknown };
  return parseRiskRegister(parsed.risk_register);
}
