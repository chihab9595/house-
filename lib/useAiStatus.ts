"use client";

import { useEffect, useState } from "react";
import { getAiStatus } from "./aiClient";

export function useAiStatus() {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    getAiStatus()
      .then(setConfigured)
      .finally(() => setLoading(false));
  }, []);

  return { loading, configured };
}
