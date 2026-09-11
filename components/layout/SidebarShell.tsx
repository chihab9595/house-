"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { formatStorageEstimate, storageUsedPercent, useStorageEstimate } from "@/lib/useStorageEstimate";
import {
  IconBarChart,
  IconBook,
  IconCalendar,
  IconFileText,
  IconHome,
  IconRefresh,
  IconServerLock,
  IconSettings,
} from "@/components/icons/Icons";

const NAV_ITEMS = [
  { label: "Accueil", href: "/", Icon: IconHome },
  { label: "Bibliothèque", href: "/cours", Icon: IconBook },
  { label: "Révision", href: "/revision", Icon: IconRefresh },
  { label: "Annales", href: "/annales", Icon: IconFileText },
  { label: "Progression", href: "/progression", Icon: IconBarChart },
  { label: "Planning", href: "/planning", Icon: IconCalendar },
  { label: "Paramètres", href: "/parametres", Icon: IconSettings },
];

export default function SidebarShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const storage = useStorageEstimate();

  return (
    <div className="light-shell">
      <aside className="light-sidebar">
        <div className="light-brand">
          <span className="light-brand-mark">
            <IconHome size={19} color="#fff" />
          </span>
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
              <span className="icon">
                <item.Icon size={17} />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="light-offline-card">
          <div className="light-offline-title">
            <IconServerLock size={15} />
            Mode hors-ligne
          </div>
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
