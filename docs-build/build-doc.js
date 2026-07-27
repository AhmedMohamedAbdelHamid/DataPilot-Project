const fs = require("fs");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  LevelFormat,
} = require("docx");

const BLUE = "2563EB";
const DARK = "0F172A";
const GRAY = "64748B";
const LIGHTBG = "F1F5F9";
const GREEN = "16A34A";
const AMBER = "D97706";

const FONT = "Calibri";
const BODY = 19; // 9.5pt
const SMALL = 17; // 8.5pt

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 160, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 2 } },
    children: [new TextRun({ text, bold: true, color: BLUE, size: 24, font: FONT })],
  });
}

function h2(text) {
  return new Paragraph({
    spacing: { before: 120, after: 40 },
    children: [new TextRun({ text, bold: true, color: DARK, size: 21, font: FONT })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 70, line: 245 },
    children: [new TextRun({ text, size: opts.size ?? BODY, font: FONT, color: opts.color ?? DARK, italics: opts.italics, bold: opts.bold })],
  });
}

function bullet(text, opts = {}) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 40, line: 235 },
    children: [new TextRun({ text, size: opts.size ?? BODY, font: FONT, color: DARK })],
  });
}

function cell(text, opts = {}) {
  return new TableCell({
    width: { size: opts.width, type: WidthType.DXA },
    shading: opts.shade ? { type: ShadingType.CLEAR, fill: opts.shade === true ? LIGHTBG : opts.shade } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: opts.bold, size: opts.size ?? SMALL, font: FONT, color: opts.color ?? DARK })],
      }),
    ],
  });
}

const pagesTable = new Table({
  columnWidths: [1700, 6000],
  width: { size: 7700, type: WidthType.DXA },
  rows: [
    new TableRow({ children: [cell("Page", { bold: true, shade: true, width: 1700 }), cell("What it does", { bold: true, shade: true, width: 6000 })] }),
    ...[
      ["Landing", "Marketing homepage — pitch, features, workflow diagram."],
      ["Upload Dataset", "Drag-and-drop a CSV/TSV file; parsed fully in your browser."],
      ["Analyzing", "Animated loading screen shown while the file is profiled."],
      ["Dashboard", "KPI cards: rows, columns, missing values, duplicates, outliers, memory, file size."],
      ["Data Quality", "Issue cards (missing data, duplicates, outliers, inconsistent labels, wrong types)."],
      ["Charts", "6 recommended charts per dataset; “Generate” draws a real chart from your data."],
      ["AI Insights", "Summary, findings, patterns, recommendations, risks, opportunities — see below."],
      ["Ask AI", "Chat box to ask about your dataset — see how it actually works below."],
      ["Reports", "Exports a real PDF or Word (.docx) file built from your data."],
      ["Settings", "Profile and preference placeholders."],
    ].map(([a, b]) => new TableRow({ children: [cell(a, { width: 1700 }), cell(b, { width: 6000 })] })),
  ],
});

function summaryTable() {
  const real = [
    "CSV parsing runs fully in your browser — nothing is uploaded to a server",
    "Row/column counts, missing values, duplicates, outliers, column types — all computed",
    "Data quality issues, chart data, and correlations are computed from your real values",
    "PDF / Word downloads are real files built from your data",
    "Ask AI answers a fixed set of question types using your real computed stats",
  ];
  const sim = [
    "AI Insights wording is filled into templates, not written by a language model",
    "Ask AI cannot answer open-ended questions outside its known patterns",
    "There is no backend, database, or account — everything lives in your browser",
    "Chat history is not saved and does not appear in exported reports",
    "Chart library had rendering bugs for 4 of 7 chart types — replaced with hand-written SVG",
  ];
  const rows = [
    new TableRow({
      children: [
        cell("✓ Real", { bold: true, shade: "E7F5EC", width: 3850, color: GREEN }),
        cell("⚠ Simulated / limited", { bold: true, shade: "FEF3E2", width: 3850, color: AMBER }),
      ],
    }),
  ];
  const max = Math.max(real.length, sim.length);
  for (let i = 0; i < max; i++) {
    rows.push(new TableRow({ children: [cell(real[i] ?? "", { width: 3850 }), cell(sim[i] ?? "", { width: 3850 })] }));
  }
  return new Table({ columnWidths: [3850, 3850], width: { size: 7700, type: WidthType.DXA }, rows });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 250, hanging: 170 } } } }] },
    ],
  },
  sections: [
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 560, bottom: 560, left: 680, right: 680 } },
      },
      children: [
        new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: "DataPilot", bold: true, size: 38, font: FONT, color: DARK })] }),
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({ text: "How It Works  ·  ", size: BODY, font: FONT, color: GRAY }),
            new TextRun({ text: "Prepared for Team 7  ·  ", size: BODY, font: FONT, color: GRAY }),
            new TextRun({ text: "July 24, 2026", size: BODY, font: FONT, color: GRAY }),
          ],
        }),

        h1("What Is DataPilot"),
        p("Upload a CSV, and DataPilot profiles it, detects data quality issues, recommends charts, explains findings in plain English, answers questions about your data, and exports a report — no code required. Everything below explains exactly how each of those steps actually works under the hood, in plain language."),

        h1("How Uploading & Analysis Work"),
        h2("1. Reading the file"),
        p("When you drop a CSV/TSV file in, a library called PapaParse reads it directly in your browser and turns it into rows and columns. Your file is never sent to a server — the whole app runs on your machine."),
        h2("2. Figuring out each column's type"),
        p("For every column, DataPilot looks at a sample of its values and classifies it: mostly numbers → numerical; true/false-style values → boolean; date-shaped text → datetime; a small set of repeated words → categorical; otherwise → text. This decides which charts make sense later."),
        h2("3. Finding data quality issues"),
        bullet("Missing values — blanks, \"NA\", \"null\", etc. are counted per column. Over 15% missing is flagged critical, over 3% is a warning, otherwise informational."),
        bullet("Duplicate rows — every column's value is compared row by row; an exact match to an earlier row counts as a duplicate."),
        bullet("Outliers — for number columns, DataPilot uses the interquartile range (IQR) rule: a standard statistics method that flags values far outside the typical middle range."),
        bullet("Inconsistent labels — category columns are checked for near-duplicate spellings (e.g. \"Electronics\" vs \"electronics\" vs \" Electronics \")."),
        bullet("Wrong data types — columns that look like numbers (e.g. zip codes) but were stored as text are flagged, since forcing them to numbers could strip leading zeros."),
        h2("4. Correlations"),
        p("For every pair of number columns, DataPilot computes the real Pearson correlation coefficient (r) — a standard statistic from -1 to 1 that measures how strongly two columns move together. The strongest pairs are surfaced as findings."),
        h2("5. Saving the result"),
        p("All of this — the stats, the issues, the chart data, the correlations — is bundled into one \"profile\" object and saved to your browser's local storage, so it's still there if you reload the page or move between screens. Nothing leaves your browser."),

        h1("How Chart Recommendations & \"Generate\" Work"),
        p("Based on each column's detected type, DataPilot suggests charts that would actually make sense — a bar chart for a category column, a histogram for a number column, a scatter plot when two number columns exist, a correlation heat map when three or more number columns exist, and so on. Nothing here is AI-generated: it's a fixed set of rules matched against your column types."),
        p("When you click \"Generate\", DataPilot takes the real values from your file and draws the chart on the spot, in your browser. Bar and histogram charts use a charting library (Recharts); the donut/pie chart, scatter plot, correlation grid, and box plot are drawn with hand-written SVG code instead, because of rendering bugs found in that library for those specific chart types during testing."),

        h1("How \"AI Insights\" Actually Work"),
        p("There is no live AI model behind this page. DataPilot writes findings into pre-built sentence templates and fills in your real numbers — for example, it only names a column as \"most missing data\" if that column truly has the highest missing count in your file, and the percentage shown is the real, computed percentage. The Executive Summary, risks, and opportunities are built the same way: real statistics, template wording."),

        h1("How the Ask AI Page Actually Works"),
        p("This is not a live conversation with a language model. When you type a question, DataPilot checks its wording against a fixed list of patterns — row/column counts, missing values, duplicates, outliers, correlations, a summary, or column types. If your question matches one of these, it answers using the real numbers from your file. If it doesn't match anything, it says so honestly and lists what it can actually answer, instead of guessing or making something up. Chat history is not saved and does not appear in exported reports."),

        h1("How Report Export (PDF / Word) Works"),
        p("Clicking Download PDF or Download DOCX builds a real file directly in your browser, using two libraries: jsPDF for PDF and docx for Word. The file includes only the sections you've switched on, filled in with your dataset's real stats, issues, chart list, and insights — then your browser downloads it normally. No server is involved at any point."),

        h1("How Data Persists Between Pages"),
        p("There is no database. Your dataset's computed profile is stored in your browser's local storage, so it survives page reloads and navigation. Uploading a new file replaces it; clearing your browser data removes it. Before you upload anything, every page shows a clearly-labeled built-in sample dataset so the app is never empty."),

        h1("Quick Reference: Real vs. Simulated"),
        summaryTable(),

        h1("Pages Built"),
        pagesTable,

        h1("Tech Stack"),
        bullet("Next.js 16 (App Router) + TypeScript"),
        bullet("Tailwind CSS v4 + shadcn/ui for the design system; Framer Motion for animation"),
        bullet("Recharts + hand-written SVG for charts; PapaParse for CSV parsing"),
        bullet("jsPDF and docx (npm) for generating real PDF / Word files — all client-side"),
        bullet("No backend, no database — the entire app runs in your browser"),

        h1("How to Run It"),
        new Paragraph({
          spacing: { after: 60 },
          shading: { type: ShadingType.CLEAR, fill: LIGHTBG },
          children: [new TextRun({ text: "cd DataPilot  →  npm install  →  npm run dev  →  open http://localhost:3000", size: BODY, font: "Consolas", color: DARK })],
        }),

        h1("Known Limitations & Next Steps"),
        bullet("Genuinely free-form AI answers and richer narrative insights need a real backend calling a language model (e.g. the Claude API)."),
        bullet("Very large files (100MB+) may be slow, since all parsing happens in the browser, not on a server."),
        bullet("Chat history in Ask AI is not persisted into exported reports yet."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/Users/omarmetwally/Desktop/DataPilot/docs-build/DataPilot-Build-Documentation.docx", buf);
  console.log("written");
});
