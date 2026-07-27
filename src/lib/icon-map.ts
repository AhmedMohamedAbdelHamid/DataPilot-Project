import {
  Rows3,
  Columns3,
  CircleSlash2,
  Copy,
  TriangleAlert,
  Hash,
  Tags,
  MemoryStick,
  FileArchive,
  BarChart3,
  AlignEndHorizontal,
  PieChart,
  ScatterChart,
  Grid3x3,
  BoxSelect,
  LineChart,
  FileQuestion,
  Type,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const kpiIconMap: Record<string, LucideIcon> = {
  Rows3,
  Columns3,
  CircleSlash2,
  Copy,
  TriangleAlert,
  Hash,
  Tags,
  MemoryStick,
  FileArchive,
  ShieldCheck,
};

export const issueCategoryIconMap: Record<string, LucideIcon> = {
  missing: CircleSlash2,
  duplicate: Copy,
  outlier: TriangleAlert,
  inconsistent: Type,
  dtype: FileQuestion,
};

export const chartTypeIconMap: Record<string, LucideIcon> = {
  bar: BarChart3,
  histogram: AlignEndHorizontal,
  pie: PieChart,
  scatter: ScatterChart,
  heatmap: Grid3x3,
  boxplot: BoxSelect,
  line: LineChart,
};
