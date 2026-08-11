"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navModules } from "@/data/mockData";

export default function ModuleNavPanel() {
  const pathname = usePathname();

  return (
    <div className="panel">
      <div className="panel-title">Modules</div>
      <div className="modlist">
        {navModules.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={pathname === item.href ? "active" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
