type Point = { label: string; km: number };

const W = 680;
const H = 220;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 26;

function linearRegression(ys: number[]): { slope: number; intercept: number } {
  const n = ys.length;
  const xs = ys.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}

export default function KmTrendChart({ points }: { points: Point[] }) {
  if (points.length < 2) return null;

  const kms = points.map((p) => p.km);
  const maxKm = Math.max(...kms);
  const { slope, intercept } = linearRegression(kms);

  const availW = W - PAD_L - PAD_R;
  const availH = H - PAD_T - PAD_B;

  const barGap = 1;
  const barWidth = Math.max(availW / points.length - barGap, 1);
  const barX = (i: number) => PAD_L + i * (barWidth + barGap);
  const y = (km: number) => PAD_T + availH - (km / (maxKm || 1)) * availH;
  const barH = (km: number) => (km / (maxKm || 1)) * availH;

  const centerX = (i: number) => barX(i) + barWidth / 2;
  const trendStart = intercept;
  const trendEnd = slope * (points.length - 1) + intercept;
  const trendPath = `M ${centerX(0)},${y(trendStart)} L ${centerX(points.length - 1)},${y(trendEnd)}`;

  const direction = slope > 0.3 ? "растёт" : slope < -0.3 ? "снижается" : "держится ровно";

  // sparse year labels along the x-axis
  const yearLabels: { x: number; text: string }[] = [];
  let lastLabel = "";
  points.forEach((p, i) => {
    const year = p.label.split("·")[0];
    if (year !== lastLabel) {
      yearLabels.push({ x: centerX(i), text: year });
      lastLabel = year;
    }
  });

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Километраж по дням всех поездок">
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="var(--line)" strokeWidth={1} />
        <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="var(--line)" strokeWidth={1} />
        <text x={4} y={PAD_T + 8} fontSize="9" fontFamily="var(--font-body)" fill="var(--ink-faint)">
          {Math.round(maxKm)} км
        </text>

        {points.map((p, i) => (
          <rect
            key={i}
            x={barX(i)}
            y={y(p.km)}
            width={barWidth}
            height={Math.max(barH(p.km), 1)}
            fill="var(--route)"
          />
        ))}

        <path d={trendPath} fill="none" stroke="var(--moss)" strokeWidth={2} strokeDasharray="6 4" />

        {yearLabels.map((yl) => (
          <text
            key={yl.text}
            x={yl.x}
            y={H - PAD_B + 14}
            fontSize="9"
            fontFamily="var(--font-body)"
            fill="var(--ink-faint)"
            textAnchor="middle"
          >
            {yl.text}
          </text>
        ))}
      </svg>
      <p className="chart-block__label">
        {points.length} катальных дней за всё время, хронологически — тренд {direction} (пунктир)
      </p>
    </div>
  );
}
