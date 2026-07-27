"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChartRecommendation } from "@/lib/types";

const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

interface TooltipPayloadItem {
  name?: string;
  dataKey?: string | number;
  value?: number | string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-[12px] shadow-md">
      {label && <p className="font-medium text-foreground">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground">
          {String(p.name ?? p.dataKey)}: <span className="font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function CategoricalBarChart({ items }: { items: { label: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={items} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--secondary)" }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--primary)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HistogramChart({ bins }: { bins: { range: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={bins} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="range"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--secondary)" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="var(--accent)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeDonutSlice(cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    "M", startOuter.x, startOuter.y,
    "A", outerR, outerR, 0, largeArc, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerR, innerR, 0, largeArc, 1, startInner.x, startInner.y,
    "Z",
  ].join(" ");
}

function PieChartView({ items }: { items: { label: string; value: number }[] }) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const total = items.reduce((s, item) => s + item.value, 0);
  const cx = 140;
  const cy = 140;
  const outerR = 118;
  const innerR = 68;

  const slices = items.reduce<
    { label: string; value: number; startAngle: number; endAngle: number; index: number }[]
  >((acc, item, index) => {
    const previousEnd = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
    const angleSpan = total === 0 ? 0 : (item.value / total) * 360;
    acc.push({ ...item, startAngle: previousEnd, endAngle: previousEnd + angleSpan, index });
    return acc;
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-4 sm:flex-row sm:justify-center">
      <div className="relative shrink-0">
        <svg width={280} height={280} viewBox="0 0 280 280">
          {slices.map((s) => (
            <path
              key={s.label}
              d={describeDonutSlice(cx, cy, outerR, innerR, s.startAngle, s.endAngle)}
              fill={PALETTE[s.index % PALETTE.length]}
              opacity={activeIndex === null || activeIndex === s.index ? 1 : 0.35}
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => setActiveIndex(s.index)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {activeIndex !== null ? (
            <>
              <span className="max-w-24 truncate text-[11.5px] font-medium text-muted-foreground">
                {items[activeIndex].label}
              </span>
              <span className="text-lg font-semibold text-foreground">
                {items[activeIndex].value.toLocaleString()}
              </span>
            </>
          ) : (
            <>
              <span className="text-[11.5px] font-medium text-muted-foreground">Total</span>
              <span className="text-lg font-semibold text-foreground">{total.toLocaleString()}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <div
            key={item.label}
            className="flex items-center gap-2 text-[12.5px]"
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
            <span className="text-foreground">{item.label}</span>
            <span className="text-muted-foreground">
              {total === 0 ? 0 : Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatAxisNumber(n: number): string {
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString();
  return Number(n.toFixed(1)).toString();
}

function ScatterChartView({ points, columns }: { points: { x: number; y: number }[]; columns: string[] }) {
  const width = 560;
  const height = 320;
  const padding = { top: 16, right: 20, bottom: 40, left: 56 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const toX = (v: number) => padding.left + ((v - xMin) / xRange) * innerWidth;
  const toY = (v: number) => padding.top + innerHeight - ((v - yMin) / yRange) * innerHeight;

  const xTicks = [xMin, xMin + xRange / 2, xMax];
  const yTicks = [yMin, yMin + yRange / 2, yMax];

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <svg width={width} height={height} className="max-w-full">
        {yTicks.map((t, i) => (
          <line
            key={`gy-${i}`}
            x1={padding.left}
            y1={toY(t)}
            x2={width - padding.right}
            y2={toY(t)}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
        ))}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="var(--border)"
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="var(--border)"
        />
        {yTicks.map((t, i) => (
          <text
            key={`yl-${i}`}
            x={padding.left - 8}
            y={toY(t)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={10}
            fill="var(--muted-foreground)"
          >
            {formatAxisNumber(t)}
          </text>
        ))}
        {xTicks.map((t, i) => (
          <text
            key={`xl-${i}`}
            x={toX(t)}
            y={height - padding.bottom + 18}
            textAnchor="middle"
            fontSize={10}
            fill="var(--muted-foreground)"
          >
            {formatAxisNumber(t)}
          </text>
        ))}
        {points.map((p, i) => (
          <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r={3.5} fill="var(--primary)" fillOpacity={0.65}>
            <title>{`${columns[0]}: ${formatAxisNumber(p.x)}\n${columns[1]}: ${formatAxisNumber(p.y)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex w-full justify-between px-2 text-[11px] text-muted-foreground">
        <span>{columns[0]}</span>
        <span>{columns[1]}</span>
      </div>
    </div>
  );
}

function HeatmapView({ columns, matrix }: { columns: string[]; matrix: number[][] }) {
  const cellSize = Math.min(80, Math.floor(420 / columns.length));
  return (
    <div className="flex justify-center overflow-x-auto py-4">
      <div>
        <div className="flex" style={{ marginLeft: 120 }}>
          {columns.map((c) => (
            <div
              key={c}
              style={{ width: cellSize }}
              className="truncate px-1 text-center text-[10px] font-medium text-muted-foreground"
            >
              {c}
            </div>
          ))}
        </div>
        {matrix.map((row, i) => (
          <div key={i} className="flex items-center">
            <div style={{ width: 120 }} className="truncate pr-2 text-right text-[11px] font-medium text-muted-foreground">
              {columns[i]}
            </div>
            {row.map((v, j) => {
              const intensity = Math.round(Math.abs(v) * 100);
              const color = v >= 0 ? "--primary" : "--destructive";
              return (
                <div
                  key={j}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: `color-mix(in oklch, var(${color}) ${intensity}%, transparent)`,
                  }}
                  className="flex items-center justify-center border border-background text-[11px] font-medium text-foreground"
                >
                  {v.toFixed(2)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function BoxplotView({
  groups,
}: {
  groups: { label: string; min: number; q1: number; median: number; q3: number; max: number }[];
}) {
  const allValues = groups.flatMap((g) => [g.min, g.max]);
  const domainMin = Math.min(...allValues);
  const domainMax = Math.max(...allValues);
  const range = domainMax - domainMin || 1;
  const height = 260;
  const toY = (v: number) => height - ((v - domainMin) / range) * (height - 20) - 10;

  return (
    <div className="flex justify-center gap-10 overflow-x-auto py-6">
      {groups.map((g) => (
        <div key={g.label} className="flex flex-col items-center">
          <svg width={64} height={height + 24}>
            <line x1={32} y1={toY(g.min)} x2={32} y2={toY(g.max)} stroke="var(--muted-foreground)" strokeWidth={1.5} />
            <rect
              x={12}
              y={toY(g.q3)}
              width={40}
              height={Math.max(2, toY(g.q1) - toY(g.q3))}
              fill="var(--primary)"
              fillOpacity={0.25}
              stroke="var(--primary)"
              strokeWidth={1.5}
              rx={4}
            />
            <line x1={12} y1={toY(g.median)} x2={52} y2={toY(g.median)} stroke="var(--primary)" strokeWidth={2} />
            <line x1={22} y1={toY(g.min)} x2={42} y2={toY(g.min)} stroke="var(--muted-foreground)" strokeWidth={1.5} />
            <line x1={22} y1={toY(g.max)} x2={42} y2={toY(g.max)} stroke="var(--muted-foreground)" strokeWidth={1.5} />
          </svg>
          <span className="mt-1 max-w-16 truncate text-[11px] font-medium text-muted-foreground" title={g.label}>
            {g.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChartRenderDialog({
  open,
  onOpenChange,
  recommendation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: ChartRecommendation;
}) {
  const { data } = recommendation;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{recommendation.title}</DialogTitle>
          <DialogDescription>{recommendation.reason}</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {!data ? (
            <p className="py-10 text-center text-[13px] text-muted-foreground">
              Not enough data to generate this chart.
            </p>
          ) : data.kind === "categorical" && recommendation.chartType === "pie" ? (
            <PieChartView items={data.items} />
          ) : data.kind === "categorical" ? (
            <CategoricalBarChart items={data.items} />
          ) : data.kind === "histogram" ? (
            <HistogramChart bins={data.bins} />
          ) : data.kind === "scatter" ? (
            <ScatterChartView points={data.points} columns={recommendation.columns} />
          ) : data.kind === "heatmap" ? (
            <HeatmapView columns={data.columns} matrix={data.matrix} />
          ) : data.kind === "boxplot" ? (
            <BoxplotView groups={data.groups} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
