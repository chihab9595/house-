"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import { useDbSync } from "./dbEvents";
import type { ActivityEvent } from "./eventTypes";

export function useActivityFeed(limit: number) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setEvents(await db.getEvents());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  const recent = useMemo(
    () => [...events].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit),
    [events, limit]
  );

  return { loading, events: recent };
}
