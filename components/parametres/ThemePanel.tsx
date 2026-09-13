"use client";

import { useTheme } from "@/components/layout/ThemeContext";
import { THEMES } from "@/lib/themes";

export default function ThemePanel() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="panel">
      <div className="panel-title">Thème</div>
      <div className="empty-hint" style={{ padding: "0 0 14px" }}>
        Change complètement l&apos;apparence de l&apos;application. Aucune donnée n&apos;est modifiée —
        seul le design change.
      </div>
      <div className="theme-grid">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`theme-option ${theme === t.id ? "active" : ""}`}
            onClick={() => setTheme(t.id)}
          >
            <span className="theme-swatch">
              {t.swatch.map((color, i) => (
                <span key={i} style={{ background: color }} />
              ))}
            </span>
            <span className="theme-option-label">{t.label}</span>
            <span className="theme-option-desc">{t.description}</span>
            {theme === t.id && <span className="theme-option-check">✓ Actif</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
