import type { Year } from "@/lib/courseTypes";

interface YearTabsProps {
  years: Year[];
  selectedYearId: number;
  onSelect: (yearId: number) => void;
}

export default function YearTabs({ years, selectedYearId, onSelect }: YearTabsProps) {
  return (
    <div className="panel">
      <div className="panel-title">Année</div>
      <div className="year-tabs">
        {years.map((year) => (
          <button
            key={year.id}
            type="button"
            className={`year-tab ${year.id === selectedYearId ? "active" : ""}`}
            onClick={() => onSelect(year.id)}
          >
            {year.label}
          </button>
        ))}
      </div>
    </div>
  );
}
