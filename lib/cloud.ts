// Mapping Supabase rows to the dashboard snapshot. Pure functions, unit-tested.
import type { FoodEntry } from "./food";
import type { PlanItem, Training } from "./training";

export type Weight = { id: string; date: string; value: number };
export type DayReview = { date: string; status: "complete" | "no-data"; updatedAt?: string; score?: number | null; comment?: string | null };
export type Settings = { kcalTarget?: number; proteinMin?: number; proteinMax?: number; weightGoal?: number };

export const TABLES = ["food_entries", "weights", "trainings", "day_reviews", "plan_items", "settings"] as const;
export type Table = (typeof TABLES)[number];

const FIELDS: Record<Table, string[]> = {
  food_entries: ["id", "date", "name", "grams", "kcal100", "protein100", "fat100", "carbs100", "createdAt"],
  weights: ["id", "date", "value"],
  trainings: ["id", "date", "type", "minutes", "notes", "createdAt"],
  day_reviews: ["date", "status", "updatedAt", "score", "comment"],
  plan_items: ["id", "date", "title", "done"],
  settings: ["kcalTarget", "proteinMin", "proteinMax", "weightGoal"],
};
const NUMERIC = new Set(["grams", "kcal100", "protein100", "fat100", "carbs100", "value", "minutes", "score", "kcalTarget", "proteinMin", "proteinMax", "weightGoal"]);
const column = (field: string) => field.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());

/** Copies only known fields; user_id and unknown columns never reach the UI. */
export function fromDb(row: Record<string, unknown>, table: Table): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of FIELDS[table]) {
    const v = row[column(f)];
    if (v === undefined) continue;
    if (v === null) { if (table === "day_reviews") out[f] = null; continue; }
    out[f] = NUMERIC.has(f) && typeof v === "string" ? Number(v) : v;
  }
  return out;
}

export type Snapshot = {
  food: FoodEntry[];
  weights: Weight[];
  trainings: Training[];
  reviews: DayReview[];
  plans: PlanItem[];
  settings: Settings | null;
  syncedAt: string;
};

// Stable display order: by date, then creation time when the column exists, then id.
const byTime = (a: Record<string, unknown>, b: Record<string, unknown>) =>
  String(a.date).localeCompare(String(b.date)) ||
  String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")) ||
  String(a.id ?? "").localeCompare(String(b.id ?? ""));

export function toSnapshot(raw: Record<Table, Record<string, unknown>[]>, syncedAt: string): Snapshot {
  const rows = (t: Table) => (raw[t] ?? []).map((r) => fromDb(r, t)).sort(byTime);
  return {
    food: rows("food_entries") as unknown as FoodEntry[],
    weights: rows("weights") as unknown as Weight[],
    trainings: rows("trainings") as unknown as Training[],
    reviews: rows("day_reviews") as unknown as DayReview[],
    plans: rows("plan_items") as unknown as PlanItem[],
    settings: (rows("settings")[0] as Settings | undefined) ?? null,
    syncedAt,
  };
}

/** Last good snapshot per account, shown instantly and when the network fails. */
export const cacheKey = (user: string) => `fs-cloud-v3:${user}`;
