"use client";

import { useEffect, useState } from "react";

const DAYS = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
const MONTHS = [
  "JANV.", "FÉVR.", "MARS", "AVR.", "MAI", "JUIN",
  "JUIL.", "AOÛT", "SEPT.", "OCT.", "NOV.", "DÉC.",
];

function formatTime(date: Date) {
  return date.toLocaleTimeString("fr-FR", { hour12: false });
}

function formatDate(date: Date) {
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="clock">
      <div className="time mono">{now ? formatTime(now) : "--:--:--"}</div>
      <div className="date">{now ? formatDate(now) : ""}</div>
    </div>
  );
}
