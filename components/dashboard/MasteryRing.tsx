const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function MasteryRing({ percent }: { percent: number }) {
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className="mastery-ring">
      <div className="ring-wrap">
        <svg width="110" height="110">
          <circle className="ring-bg" cx="55" cy="55" r={RADIUS} />
          <circle
            className="ring-fg"
            cx="55"
            cy="55"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="ring-label">
          <div className="pct">{percent}%</div>
          <div className="sub">MAÎTRISÉ</div>
        </div>
      </div>
    </div>
  );
}
