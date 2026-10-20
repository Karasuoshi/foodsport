"use client";
// Read-only journal loader. All five tables are fetched together and replace the
// view only when every request succeeds, so one panel can never go blank while
// another still shows data. On failure the last good snapshot stays on screen.
import { useCallback, useEffect, useRef, useState } from "react";
import { AUTH_EVENT, AuthError, Session, getSession, selectAll, storedUserId } from "../lib/supabase";
import { Snapshot, TABLES, Table, cacheKey, toSnapshot } from "../lib/cloud";

export type SyncStatus = "loading" | "ok" | "offline" | "signed-out";
const REFRESH_MS = 15_000;

function readCache(user: string): Snapshot | null {
  try {
    const raw = localStorage.getItem(cacheKey(user));
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  } catch {
    return null;
  }
}

const fetchAll = (s: Session) => Promise.all(TABLES.map((t) => selectAll(t, s)));

export default function useJournal() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<SyncStatus>("loading");
  const busy = useRef(false);
  const owner = useRef<string | null>(null);

  const show = (user: string) => {
    if (owner.current === user) return;
    owner.current = user;
    setData(readCache(user));
  };

  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const cached = storedUserId();
      if (cached) show(cached);
      let session = await getSession();
      if (!session) { owner.current = null; setData(null); setStatus("signed-out"); return; }
      show(session.user.id);
      let rows: Record<string, unknown>[][];
      try {
        rows = await fetchAll(session);
      } catch (e) {
        if (!(e instanceof AuthError)) throw e;
        session = await getSession(true);
        if (!session) { owner.current = null; setData(null); setStatus("signed-out"); return; }
        rows = await fetchAll(session);
      }
      const user = session.user.id;
      if (owner.current !== user) return;
      const raw = Object.fromEntries(TABLES.map((t, i) => [t, rows[i]])) as Record<Table, Record<string, unknown>[]>;
      const snap = toSnapshot(raw, new Date().toISOString());
      setData(snap);
      setStatus("ok");
      try { localStorage.setItem(cacheKey(user), JSON.stringify(snap)); } catch { /* cache is optional */ }
    } catch {
      // Network or server failure: keep whatever is on screen. Never log journal data or tokens.
      setStatus((s) => (s === "signed-out" ? s : "offline"));
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    void load();
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    const timer = setInterval(refresh, REFRESH_MS);
    const events = [AUTH_EVENT, "focus", "online"];
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
