"use client";

import type { ReactNode } from "react";
import { useTheme } from "@/components/layout/ThemeContext";
import ModuleNavPanel from "./ModuleNavPanel";

export default function SectionLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  // Le thème "clair" a déjà toute la navigation dans sa barre latérale
  // (SidebarShell) — répéter ModuleNavPanel ici doublonnerait ce menu.
  if (theme === "clair") {
    return <>{children}</>;
  }

  return (
    <div className="grid-2">
      <ModuleNavPanel />
      {children}
    </div>
  );
}
