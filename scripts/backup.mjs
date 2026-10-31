// Daily journal backup: reads every table through the public read-only API and writes
// foodsport-<date>.json in the foodsport-export-v1 format (same as the site's export button).
// Usage: node scripts/backup.mjs <out-dir>
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const URL = "https://fmfvrefupuyfbtktxxtl.supabase.co/rest/v1";
const KEY = "sb_publishable_Na5vG7GtN_aBjGRnr1Q1vQ_ocIE2B1f";
const get = async (table, order) => {
  const r = await fetch(`${URL}/${table}?select=*&order=${order}`, { headers: { apikey: KEY } });
  if (!r.ok) throw new Error(`${table}: HTTP ${r.status}`);
  return r.json();
};
const pick = (row, map) => Object.fromEntries(Object.entries(map).map(([k, c]) => [k, row[c] ?? null]));

const [food, weights, trainings, reviews, plans, settings] = await Promise.all([
  get("food_entries", "date,created_at,id"), get("weights", "date"), get("trainings", "date,created_at,id"),
  get("day_reviews", "date"), get("plan_items", "date"), get("settings", "id"),
]);
const now = new Date();
const s = settings[0];
const body = {
  format: "foodsport-export-v1",
  exportedAt: now.toISOString(),
  food: food.map((r) => pick(r, { id: "id", date: "date", name: "name", grams: "grams", kcal100: "kcal100", protein100: "protein100", fat100: "fat100", carbs100: "carbs100", createdAt: "created_at" })),
  weights: weights.map((r) => pick(r, { id: "id", date: "date", value: "value" })),
  trainings: trainings.map((r) => pick(r, { id: "id", date: "date", type: "type", minutes: "minutes", notes: "notes", createdAt: "created_at" })),
  reviews: reviews.map((r) => pick(r, { date: "date", status: "status", score: "score", comment: "comment", updatedAt: "updated_at" })),
  plans: plans.map((r) => pick(r, { id: "id", date: "date", title: "title", done: "done" })),
  settings: s ? pick(s, { kcalTarget: "kcal_target", proteinMin: "protein_min", proteinMax: "protein_max", weightGoal: "weight_goal" }) : null,
};
const day = now.toLocaleDateString("sv-SE", { timeZone: "Europe/Moscow" });
const dir = process.argv[2] ?? "backup";
mkdirSync(dir, { recursive: true });
const file = join(dir, `foodsport-${day}.json`);
writeFileSync(file, JSON.stringify(body, null, 1));
console.log(`${file}: food ${body.food.length}, weights ${body.weights.length}, trainings ${body.trainings.length}, reviews ${body.reviews.length}`);
if (!body.food.length) throw new Error("empty journal — refusing to publish a blank backup");
