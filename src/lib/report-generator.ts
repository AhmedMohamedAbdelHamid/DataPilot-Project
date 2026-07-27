import { jsPDF } from "jspdf";
import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import type { DatasetProfile, ReportSection } from "@/lib/types";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function createPdfWriter(doc: jsPDF) {
  let y = MARGIN;

  function ensureSpace(lineHeight: number) {
    if (y + lineHeight > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  return {
    title(text: string) {
      ensureSpace(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text(text, MARGIN, y);
      y += 10;
    },
    meta(text: string) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
      lines.forEach((line: string) => {
        ensureSpace(6);
        doc.text(line, MARGIN, y);
        y += 5;
      });
      y += 6;
    },
    heading(text: string) {
      y += 4;
      ensureSpace(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);
      doc.text(text, MARGIN, y);
      y += 7;
    },
    subheading(text: string) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
      lines.forEach((line: string) => {
        ensureSpace(6);
        doc.text(line, MARGIN, y);
        y += 5.5;
      });
      y += 1;
    },
    paragraph(text: string) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
      lines.forEach((line: string) => {
        ensureSpace(5.5);
        doc.text(line, MARGIN, y);
        y += 5.2;
      });
      y += 3;
    },
    bullet(text: string) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 5);
      lines.forEach((line: string, i: number) => {
        ensureSpace(5);
        doc.text(i === 0 ? `•  ${line}` : `    ${line}`, MARGIN, y);
        y += 4.8;
      });
      y += 1.5;
    },
  };
}

function buildReportOutline(profile: DatasetProfile, sections: ReportSection[]) {
  const included = new Set(sections.filter((s) => s.included).map((s) => s.id));
  const { summary, issues, chartRecommendations, insights, columns } = profile;
  const summaryInsight = insights.find((i) => i.type === "summary");
  const otherInsights = insights.filter((i) => i.type !== "summary");

  const blocks: {
    id: string;
    heading: string;
    body: { kind: "paragraph" | "subheading" | "bullet"; text: string }[];
  }[] = [];

  if (included.has("sec-1")) {
    blocks.push({
      id: "sec-1",
      heading: "Executive Summary",
      body: [{ kind: "paragraph", text: summaryInsight?.body ?? "No summary available for this dataset." }],
    });
  }

  if (included.has("sec-2")) {
    blocks.push({
      id: "sec-2",
      heading: "Dataset Overview",
      body: [
        { kind: "bullet", text: `Rows: ${summary.rows.toLocaleString()}` },
        { kind: "bullet", text: `Columns: ${summary.columns}` },
        { kind: "bullet", text: `Numerical columns: ${summary.numericalColumns}` },
        { kind: "bullet", text: `Categorical columns: ${summary.categoricalColumns}` },
        { kind: "bullet", text: `Missing values: ${summary.missingValues.toLocaleString()} (${summary.missingPercent}%)` },
        { kind: "bullet", text: `Duplicate rows: ${summary.duplicateRows.toLocaleString()}` },
        { kind: "bullet", text: `Memory usage: ${summary.memoryUsage}` },
        { kind: "bullet", text: `File size: ${summary.fileSize}` },
      ],
    });
  }

  if (included.has("sec-3")) {
    const body: { kind: "paragraph" | "subheading" | "bullet"; text: string }[] =
      issues.length === 0
        ? [{ kind: "paragraph", text: "No data quality issues were detected in this dataset." }]
        : issues.flatMap((issue) => [
            { kind: "subheading" as const, text: `${issue.title} — ${issue.severity}` },
            { kind: "paragraph" as const, text: issue.explanation },
            {
              kind: "bullet" as const,
              text: `Suggested fix: ${issue.suggestedFix} (${
                issue.status === "approved" ? "Approved by user" : issue.status === "rejected" ? "Rejected by user" : "Awaiting review"
              })`,
            },
          ]);
    blocks.push({ id: "sec-3", heading: "Data Quality Findings", body });
  }

  if (included.has("sec-4")) {
    const body: { kind: "paragraph" | "subheading" | "bullet"; text: string }[] =
      chartRecommendations.length === 0
        ? [{ kind: "paragraph", text: "No chart recommendations were generated for this dataset." }]
        : chartRecommendations.flatMap((rec) => [
            { kind: "subheading" as const, text: `${rec.title} — ${rec.confidence}% confidence` },
            { kind: "paragraph" as const, text: rec.reason },
            { kind: "bullet" as const, text: rec.bestUseCase },
          ]);
    blocks.push({ id: "sec-4", heading: "Recommended Visualizations", body });
  }

  if (included.has("sec-5")) {
    const body: { kind: "paragraph" | "subheading" | "bullet"; text: string }[] =
      otherInsights.length === 0
        ? [{ kind: "paragraph", text: "No additional insights were generated for this dataset." }]
        : otherInsights.flatMap((insight) => [
            { kind: "subheading" as const, text: insight.title },
            { kind: "paragraph" as const, text: insight.body },
          ]);
    blocks.push({ id: "sec-5", heading: "AI-Generated Insights", body });
  }

  if (included.has("sec-6")) {
    blocks.push({
      id: "sec-6",
      heading: "Question & Answer Log",
      body: [
        {
          kind: "paragraph",
          text: "No conversation history was recorded for this export. Ask questions on the Ask AI page to build a Q&A log for future reports.",
        },
      ],
    });
  }

  if (included.has("sec-7")) {
    blocks.push({
      id: "sec-7",
      heading: "Appendix: Full Column Reference",
      body: columns.map((col) => ({
        kind: "bullet" as const,
        text: `${col.name} — ${col.type}, ${col.missingCount.toLocaleString()} missing (${col.missingPercent}%), ${col.uniqueCount.toLocaleString()} unique values`,
      })),
    });
  }

  return blocks;
}

export function generatePdfReport(profile: DatasetProfile, sections: ReportSection[]): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = createPdfWriter(doc);

  w.title("DataPilot Report");
  w.meta(
    `${profile.summary.name} · Generated ${profile.summary.uploadedAt} · ${profile.summary.rows.toLocaleString()} rows · ${profile.summary.columns} columns`
  );

  for (const block of buildReportOutline(profile, sections)) {
    w.heading(block.heading);
    for (const item of block.body) {
      if (item.kind === "subheading") w.subheading(item.text);
      else if (item.kind === "bullet") w.bullet(item.text);
      else w.paragraph(item.text);
    }
  }

  return doc.output("blob");
}

export async function generateDocxReport(profile: DatasetProfile, sections: ReportSection[]): Promise<Blob> {
  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      text: "DataPilot Report",
    }),
    new Paragraph({
      text: `${profile.summary.name} · Generated ${profile.summary.uploadedAt} · ${profile.summary.rows.toLocaleString()} rows · ${profile.summary.columns} columns`,
      spacing: { after: 300 },
    }),
  ];

  for (const block of buildReportOutline(profile, sections)) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, text: block.heading, spacing: { before: 300, after: 150 } }));
    for (const item of block.body) {
      if (item.kind === "subheading") {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: item.text, spacing: { before: 150, after: 80 } }));
      } else if (item.kind === "bullet") {
        children.push(new Paragraph({ text: item.text, bullet: { level: 0 }, spacing: { after: 60 } }));
      } else {
        children.push(new Paragraph({ text: item.text, spacing: { after: 120 } }));
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
