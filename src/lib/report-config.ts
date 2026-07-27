import type { ReportSection } from "@/lib/types";

// Default set of sections a user can toggle on/off before exporting a
// report. This is UI configuration, not sample data — update this list
// as new report sections are added to the pipeline.
export const reportSections: ReportSection[] = [
  { id: "sec-1", title: "Executive Summary", description: "High-level overview of the dataset and key takeaways.", included: true },
  { id: "sec-2", title: "Dataset Overview", description: "Rows, columns, types, memory usage and file metadata.", included: true },
  { id: "sec-3", title: "Data Quality Findings", description: "Missing values, duplicates, outliers, and inconsistencies.", included: true },
  { id: "sec-4", title: "Recommended Visualizations", description: "Suggested charts with rationale and confidence scores.", included: true },
  { id: "sec-5", title: "AI-Generated Insights", description: "Key findings, patterns, risks, and opportunities.", included: true },
  { id: "sec-6", title: "Question & Answer Log", description: "Your conversation history with DataPilot's AI.", included: false },
  { id: "sec-7", title: "Appendix: Full Column Reference", description: "Data dictionary listing every column and its type.", included: false },
];
