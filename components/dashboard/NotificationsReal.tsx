"use client";

import { useActivityFeed } from "@/lib/useActivityFeed";
import { formatClockTime } from "@/lib/format";

const LIMIT = 6;

export default function NotificationsReal() {
  const { loading, events } = useActivityFeed(LIMIT);

  if (loading) {
    return <div className="empty-hint">Chargement…</div>;
  }

  if (events.length === 0) {
    return (
      <div className="empty-hint">
        Aucune notification pour l&apos;instant. Importe un cours ou termine un quiz pour voir apparaître
        des notifications ici.
      </div>
    );
  }

  return (
    <>
      {events.map((e) => (
        <div className="notif" key={e.id}>
          <div className="dot" />
          <div>
            <div className="time">{formatClockTime(e.createdAt)}</div>
            <div className="title">{e.title}</div>
            <div className="desc">{e.desc}</div>
          </div>
        </div>
      ))}
    </>
  );
}
