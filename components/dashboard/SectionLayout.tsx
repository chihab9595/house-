import type { ReactNode } from "react";
import ModuleNavPanel from "./ModuleNavPanel";

export default function SectionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid-2">
      <ModuleNavPanel />
      {children}
    </div>
  );
}
