interface SparklineProps {
  values: number[];
  label: string;
  unit?: string;
  height?: number;
}

export function Sparkline({ values, label, unit, height = 40 }: SparklineProps) {
  const max = Math.max(...values, 1);
  const width = 100;
  const points = values
    .map((v, i) => {
      const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
      const y = height - (v / max) * (height - 4);
      return `${x},${y}`;
    })
    .join(" ");

  const latest = values[values.length - 1];

  return (
    <div className="sparkline-card">
      <div className="sparkline-header">
        <span className="sparkline-label">{label}</span>
        <span className="sparkline-value">
          {latest}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="sparkline-svg" aria-hidden>
        <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
      </svg>
    </div>
  );
}
