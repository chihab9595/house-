import type { TrendDay } from "@/lib/useHomeExtras";

const WIDTH = 320;
const HEIGHT = 120;
const PAD = 10;

export default function WeeklyTrendChart({ days }: { days: TrendDay[] }) {
  const withData = days.filter((d) => d.accuracy !== null);

  if (withData.length === 0) {
    return (
      <div className="light-empty">
        Termine un quiz pour voir ta progression de la semaine ici.
      </div>
    );
  }

  const stepX = (WIDTH - PAD * 2) / (days.length - 1);
  const points = days
    .map((d, i) => (d.accuracy === null ? null : { x: PAD + i * stepX, y: PAD + (1 - d.accuracy / 100) * (HEIGHT - PAD * 2) }))
    .filter((p): p is { x: number; y: number } => p !== null);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${HEIGHT - PAD} L${points[0].x},${HEIGHT - PAD} Z`;

  return (
    <div className="light-trend">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="light-trend-svg" preserveAspectRatio="none">
        <path d={areaPath} className="light-trend-area" />
        <path d={linePath} className="light-trend-line" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} className="light-trend-dot" />
        ))}
      </svg>
      <div className="light-trend-labels">
        {days.map((d) => (
          <span key={d.dateIso}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
