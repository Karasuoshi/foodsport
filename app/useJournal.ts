"use client";
// Read-only journal loader. All tables are fetched together and replace the view
// only when every request succeeds, so one panel can never go blank while another
// still shows data. On failure the last good snapshot stays on screen.
import { useCallback, useEffect, useRef, useState } from "react";
import { selectAll } from "../lib/supabase";
import { CACHE_KEY, Snapshot, TABLES, Table, toSnapshot } from "../lib/cloud";

export type SyncStatus = "loading" | "ok" | "offline";
const REFRESH_MS = 15_000;

function readCache(): Snapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  } catch {
    return null;
  }
}

export default function useJournal() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<SyncStatus>("loading");
  const busy = useRef(false);

  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const rows = await Promise.all(TABLES.map((t) => selectAll(t)));
      const raw = Object.fromEntries(TABLES.map((t, i) => [t, rows[i]])) as Record<Table, Record<string, unknown>[]>;
      const snap = toSnapshot(raw, new Date().toISOString());
      setData(snap);
      setStatus("ok");
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(snap)); } catch { /* cache is optional */ }
    } catch {
      setStatus("offline");
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    setData((d) => d ?? readCache());
    void load();
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    const timer = setInterval(refresh, REFRESH_MS);
    const events = ["focus", "online"];
    events.forEach((e) => window.addEventListener(e, refresh));
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, refresh));
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [load]);

  return { data, status };
}
