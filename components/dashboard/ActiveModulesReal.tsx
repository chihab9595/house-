"use client";

import Link from "next/link";
import { useCourseStats } from "@/lib/useCourseStats";

const MAX_SHOWN = 5;

export default function ActiveModulesReal() {
  const { loading, modulesWithCounts } = useCourseStats();

  if (loading) {
    return <div className="empty-hint">Chargement…</div>;
  }

  if (modulesWithCounts.length === 0) {
    return (
      <div className="empty-hint">
        Aucun module pour l&apos;instant.{" "}
        <Link href="/cours" style={{ color: "var(--cyan)" }}>
          Importe des cours
        </Link>{" "}
        pour les voir apparaître ici.
      </div>
    );
  }

  return (
    <>
      {modulesWithCounts.slice(0, MAX_SHOWN).map((m) => (
        <div className="stat-row" key={m.id}>
          <span className="k">{m.name}</span>
          <span className={`v ${m.courseCount === 0 ? "warn" : "good"}`}>
            {m.courseCount} cours
          </span>
        </div>
      ))}
    </>
  );
}
