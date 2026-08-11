import { ekgPoints } from "@/data/mockData";

export default function EkgTrace() {
  return (
    <svg className="ekg" viewBox="0 0 600 40" preserveAspectRatio="none">
      <polyline
        points={ekgPoints}
        fill="none"
        stroke="#4de8ff"
        strokeWidth="2"
        opacity="0.85"
      />
    </svg>
  );
}
