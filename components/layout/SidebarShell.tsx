"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { formatStorageEstimate, storageUsedPercent, useStorageEstimate } from "@/lib/useStorageEstimate";

const NAV_ITEMS = [
  { label: "Accueil", href: "/", icon: "🏠" },
  { label: "Bibliothèque", href: "/cours", icon: "📚" },
  { label: "Révision", href: "/revision", icon: "🔄" },
  { label: "Annales", href: "/annales", icon: "📝" },
  { label: "Progression", href: "/progression", icon: "📊" },
  { label: "Planning", href: "/planning", icon: "🗓️" },
  { label: "Paramètres", href: "/parametres", icon: "⚙️" },
];

export default function SidebarShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const storage = useStorageEstimate();

  return (
    <div className="light-shell">
      <aside className="light-sidebar">
        <div className="light-brand">
          <span className="light-brand-mark">🏠</span>
          <div>
            <div className="light-brand-name">HOUSE</div>
            <div className="light-brand-tag">Ton allié en médecine</div>
          </div>
        </div>

        <nav className="light-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`light-nav-link ${pathname === item.href ? "active" : ""}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="light-offline-card">
          <div className="light-offline-dot" />
          <div className="light-offline-title">Mode hors-ligne</div>
          <div className="light-offline-desc">
            Toutes vos données sont stockées localement sur votre appareil.
          </div>
          <div className="light-storage">
            <div className="light-storage-label">Espace utilisé</div>
            <div className="light-storage-value">{formatStorageEstimate(storage)}</div>
            <div className="light-storage-track">
              <div className="light-storage-fill" style={{ width: `${storageUsedPercent(storage)}%` }} />
            </div>
          </div>
        </div>

        <div className="light-quote">Un petit pas chaque jour… vers votre futur docteur ! 💙</div>
      </aside>

      <main className="light-main">{children}</main>
    </div>
  );
}
