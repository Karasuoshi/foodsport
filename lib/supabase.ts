// Read-only access for the public dashboard. The publishable key is public by design:
// row-level security lets anyone read the journal and nobody write it. Only the agent
// writes, through the Supabase connector (see docs/DATA.md).
export const SUPABASE_URL = "https://fmfvrefupuyfbtktxxtl.supabase.co";
const KEY = "sb_publishable_Na5vG7GtN_aBjGRnr1Q1vQ_ocIE2B1f";

export async function selectAll(table: string): Promise<Record<string, unknown>[]> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, { headers: { apikey: KEY } });
  if (!r.ok) throw new Error(`${table}: HTTP ${r.status}`);
  return r.json();
}
