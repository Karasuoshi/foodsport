import test from "node:test";
import assert from "node:assert/strict";
import { cacheKey, fromDb, toSnapshot, TABLES } from "../lib/cloud";

test("rows keep known fields only and drop ownership columns", () => {
  const row = { user_id: "owner", date: "2026-01-01", status: "complete", updated_at: "t", score: 8, comment: null, extra: 1 };
  assert.deepEqual(fromDb(row, "day_reviews"), { date: "2026-01-01", status: "complete", updatedAt: "t", score: 8, comment: null });
  assert.equal("user_id" in fromDb({ id: "x", user_id: "owner", date: "2026-01-01" }, "food_entries"), false);
});

test("numeric columns returned as strings become numbers", () => {
  const row = { id: "x", date: "2026-01-01", name: "Тест", grams: "150", kcal100: "120.5", protein100: 20, fat100: 3, carbs100: 4 };
  assert.equal(fromDb(row, "food_entries").grams, 150);
  assert.equal(fromDb(row, "food_entries").kcal100, 120.5);
});

test("snapshot covers every table and orders rows stably", () => {
  const raw = Object.fromEntries(TABLES.map((t) => [t, []])) as never;
  const snap = toSnapshot({ ...(raw as object), food_entries: [
    { id: "b", date: "2026-01-02", created_at: "2026-01-02T09:00:00Z" },
    { id: "c", date: "2026-01-01", created_at: "2026-01-01T20:00:00Z" },
    { id: "a", date: "2026-01-01", created_at: "2026-01-01T08:00:00Z" },
  ] } as never, "now");
  assert.deepEqual(snap.food.map((e) => e.id), ["a", "c", "b"]);
  assert.deepEqual([snap.weights, snap.trainings, snap.reviews, snap.plans], [[], [], [], []]);
});

test("cache is account-specific", () => {
  assert.notEqual(cacheKey("a"), cacheKey("b"));
});
