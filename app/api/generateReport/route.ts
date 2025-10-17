import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { parseProductPlan } from "@/lib/planValidation";
import { supabase } from "@/lib/supabase";
import type { ProductPlan } from "@/types/plan";

interface GenerateReportRequest {
  planId: string;
}

function renderPlanToPdf(plan: ProductPlan) {
  const doc = new jsPDF({ unit: "pt" });
  let y = 40;

  doc.setFontSize(18);
  doc.text("PlanPilot AI Report", 40, y);
  y += 30;

  doc.setFontSize(14);
  doc.text("Product Summary", 40, y);
  y += 20;
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(plan.product_summary, 520), 40, y);
  y += 40;

  doc.setFontSize(14);
  doc.text("Objectives", 40, y);
  y += 20;
  plan.objectives.forEach((objective) => {
    doc.setFontSize(12);
    doc.text(`• ${objective}`, 60, y);
    y += 18;
  });

  plan.roadmap_phases.forEach((phase) => {
    y += 20;
    doc.setFontSize(14);
    doc.text(`Phase: ${phase.phase}`, 40, y);
    y += 20;

    doc.setFontSize(12);
    phase.milestones.forEach((milestone) => {
      doc.text(`Milestone: ${milestone.name}`, 60, y);
      y += 16;
      if (milestone.description) {
        doc.text(doc.splitTextToSize(`Notes: ${milestone.description}`, 520), 80, y);
        y += 16;
      }
    });

    phase.tasks.forEach((task) => {
      doc.text(`Task: ${task.title}`, 60, y);
      y += 16;
      if (task.description) {
        doc.text(doc.splitTextToSize(task.description, 520), 80, y);
        y += 16;
      }
    });
  });

  y += 20;
  doc.setFontSize(14);
  doc.text("Risk Register", 40, y);
  y += 20;
  plan.risk_register.forEach((risk) => {
    doc.setFontSize(12);
    doc.text(`Risk: ${risk.risk} (${risk.likelihood}/${risk.impact})`, 60, y);
    y += 16;
    doc.text(doc.splitTextToSize(`Mitigation: ${risk.mitigation}`, 520), 80, y);
    y += 20;
  });

  return doc.output("arraybuffer");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateReportRequest;
    if (!body.planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("plans")
      .select("plan_json")
      .eq("id", body.planId)
      .single();

    if (error || !data) {
      throw error ?? new Error("Plan not found");
    }

    const plan = parseProductPlan(data.plan_json);
    const pdfBuffer = renderPlanToPdf(plan);

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=planpilot-report.pdf"
      }
    });
  } catch (error) {
    console.error("generateReport error", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
