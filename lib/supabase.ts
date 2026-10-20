// Supabase access for the read-only dashboard.
// The publishable key is public by design; row-level security limits every
// request to the signed-in owner's rows. The site never writes journal data.
export const SUPABASE_URL = "https://kzyykhjjpalrhprcttow.supabase.co";
const KEY = "sb_publishable_UnnZRK2ZDcaA-au1e8GSCA_o0gOb3M6";
const STORAGE = "fs-supabase-session-v1";
export const AUTH_EVENT = "foodsport-auth-changed";

export type Session = { access_token: string; refresh_token: string; expires_at?: number; user: { id: string; email?: string } };

/** Supabase rejected the credentials or token. Network failures stay plain errors. */
export class AuthError extends Error {}

async function auth(path: string, body: object) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new AuthError(data.msg || data.error_description || data.message || "Ошибка авторизации");
  return data;
}

function stored(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function store(data: Session & { expires_in?: number }): Session {
  const s = { ...data, expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600) };
  localStorage.setItem(STORAGE, JSON.stringify(s));
  return s;
}

/** Owner of the last saved session, available offline for showing cached data. */
export const storedUserId = () => stored()?.user?.id ?? null;

let refreshing: Promise<Session | null> | null = null;

async function refresh(s: Session): Promise<Session | null> {
  try {
    return store(await auth("token?grant_type=refresh_token", { refresh_token: s.refresh_token }));
  } catch (e) {
    // A network problem must not log the user out: keep the session and retry later.
    if (!(e instanceof AuthError)) throw e;
    // Another tab may already have rotated the refresh token.
    const latest = stored();
    if (latest && latest.refresh_token !== s.refresh_token) return latest;
    localStorage.removeItem(STORAGE);
    return null;
  }
}

/** Current session, refreshed shortly before expiry. Throws on network failure. */
export async function getSession(force = false): Promise<Session | null> {
  const s = stored();
  if (!s) return null;
  if (!force && s.expires_at && s.expires_at * 1000 > Date.now() + 60_000) return s;
  if (!refreshing) refreshing = refresh(s).finally(() => { refreshing = null; });
  return refreshing;
}

export async function signIn(email: string, password: string) {
  store(await auth("token?grant_type=password", { email, password }));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export async function selectAll(table: string, s: Session): Promise<Record<string, unknown>[]> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: { apikey: KEY, Authorization: `Bearer ${s.access_token}` },
  });
  if (r.status === 401) throw new AuthError("Сессия истекла");
  if (!r.ok) throw new Error(`${table}: HTTP ${r.status}`);
  return r.json();
}
