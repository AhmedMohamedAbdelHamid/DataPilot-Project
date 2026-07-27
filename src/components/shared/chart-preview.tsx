const bars = [40, 70, 55, 90, 35, 65];
const scatterPoints = [
  [10, 70], [22, 55], [35, 60], [48, 40], [55, 45], [65, 25], [72, 30], [85, 15], [90, 20], [30, 75], [60, 50],
];
const heat = [
  [0.9, 0.4, 0.2, 0.6],
  [0.4, 0.9, 0.5, 0.3],
  [0.2, 0.5, 0.9, 0.7],
  [0.6, 0.3, 0.7, 0.9],
];

export function ChartPreview({ type }: { type: string }) {
  switch (type) {
    case "bar":
      return (
        <svg viewBox="0 0 120 60" className="h-16 w-28">
          {bars.map((h, i) => (
            <rect
              key={i}
              x={i * 20 + 4}
              y={60 - h * 0.6}
              width={12}
              height={h * 0.6}
              rx={3}
              className={i % 2 === 0 ? "fill-primary" : "fill-accent"}
            />
          ))}
        </svg>
      );
    case "histogram":
      return (
        <svg viewBox="0 0 120 60" className="h-16 w-28">
          {[20, 35, 55, 45, 30, 15, 8].map((h, i) => (
            <rect key={i} x={i * 16 + 2} y={60 - h} width={12} height={h} rx={2} className="fill-primary" opacity={0.9 - i * 0.08} />
          ))}
        </svg>
      );
    case "pie":
      return (
        <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="4" />
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="4" strokeDasharray="60 100" strokeLinecap="round" />
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-accent" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-60" strokeLinecap="round" />
        </svg>
      );
    case "scatter":
      return (
        <svg viewBox="0 0 100 90" className="h-16 w-28">
          <line x1="4" y1="86" x2="96" y2="86" className="stroke-border" strokeWidth="1.5" />
          <line x1="4" y1="4" x2="4" y2="86" className="stroke-border" strokeWidth="1.5" />
          {scatterPoints.map(([x, y], i) => (
            <circle key={i} cx={x} cy={90 - y} r="3.2" className={i % 3 === 0 ? "fill-accent" : "fill-primary"} opacity={0.85} />
          ))}
        </svg>
      );
    case "heatmap":
      return (
        <svg viewBox="0 0 80 80" className="h-16 w-16">
          {heat.map((row, r) =>
            row.map((v, c) => (
              <rect key={`${r}-${c}`} x={c * 20} y={r * 20} width={18} height={18} rx={3} className="fill-primary" opacity={v} />
            ))
          )}
        </svg>
      );
    case "boxplot":
      return (
        <svg viewBox="0 0 120 60" className="h-16 w-28">
          {[24, 60, 96].map((cx, i) => (
            <g key={i}>
              <line x1={cx} y1="6" x2={cx} y2="54" className="stroke-muted-foreground/40" strokeWidth="1.5" />
              <rect x={cx - 10} y={18 - i * 2} width="20" height={22 + i * 2} rx="3" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
              <line x1={cx - 10} y1={29} x2={cx + 10} y2={29} className="stroke-primary" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
      );
    case "line":
      return (
        <svg viewBox="0 0 120 60" className="h-16 w-28">
          <polyline
            points="4,45 22,30 40,38 58,15 76,25 94,8 116,20"
            fill="none"
            className="stroke-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}
