"use client";

import { useActivityFeed } from "@/lib/useActivityFeed";
import { formatRelativeTime } from "@/lib/format";

const LIMIT = 4;

export default function RecentActivityReal() {
  const { loading, events } = useActivityFeed(LIMIT);

  if (loading) {
    return <div className="empty-hint">Chargement…</div>;
  }

  if (events.length === 0) {
    return (
      <div className="empty-hint">
        Ton activité (cours importés, annales scannées, quiz complétés…) apparaîtra ici.
      </div>
    );
  }

  return (
    <>
      {events.map((e) => (
        <div className="row" key={e.id}>
          <span className="label">{e.title}</span>
          <span className="tag">{formatRelativeTime(e.createdAt)}</span>
        </div>
      ))}
    </>
  );
}
