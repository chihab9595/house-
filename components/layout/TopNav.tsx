"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { topNav } from "@/data/mockData";

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav>
      {topNav.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={pathname === item.href ? "active" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
