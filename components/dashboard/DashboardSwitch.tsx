"use client";

import { useTheme } from "@/components/layout/ThemeContext";
import Dashboard from "./Dashboard";
import LightDashboard from "./light/LightDashboard";

export default function DashboardSwitch() {
  const { theme } = useTheme();
  return theme === "clair" ? <LightDashboard /> : <Dashboard />;
}
