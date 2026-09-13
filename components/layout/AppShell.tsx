"use client";

import type { ReactNode } from "react";
import type { ThemeId } from "@/lib/themes";
import { ThemeProvider, useTheme } from "./ThemeContext";
import Header from "./Header";
import SidebarShell from "./SidebarShell";

function ShellSwitch({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  if (theme === "clair") {
    return <SidebarShell>{children}</SidebarShell>;
  }

  return (
    <div className="shell">
      <Header />
      {children}
    </div>
  );
}

export default function AppShell({
  initialTheme,
  children,
}: {
  initialTheme: ThemeId;
  children: ReactNode;
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ShellSwitch>{children}</ShellSwitch>
    </ThemeProvider>
  );
}
