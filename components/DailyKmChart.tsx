type Props = {
  dailyKm: number[];
  compact?: boolean;
};

export default function DailyKmChart({ dailyKm, compact = false }: Props) {
  if (!dailyKm || dailyKm.length === 0) return null;

  const max = Math.max(...dailyKm);
  const barWidth = compact ? 5 : 20;
  const gap = compact ? 2 : 8;
  const height = compact ? 34 : 96;
  const width = dailyKm.length * (barWidth + gap) - gap;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`Километраж по дням: ${dailyKm.join(", ")}`}
    >
      {dailyKm.map((km, i) => {
        const barHeight = Math.max((km / max) * height, 2);
        const x = i * (barWidth + gap);
        const y = height - barHeight;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={compact ? "var(--route-soft)" : "var(--route)"}
            />
            {!compact && (
              <text
                x={x + barWidth / 2}
                y={height + 14}
                textAnchor="middle"
                fontSize="9"
                fontFamily="var(--font-display)"
                fill="var(--ink-faint)"
              >
                {i + 1}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
