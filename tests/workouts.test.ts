import {test} from "node:test";
import {strict as assert} from "node:assert";
import {defaultSchedule,workoutForDate} from "../lib/workouts";
test("first week uses explicit overrides",()=>{assert.equal(workoutForDate("2026-10-12",defaultSchedule)?.id,"a");assert.equal(workoutForDate("2026-10-14",defaultSchedule)?.id,"swim")});
test("recurring schedule keeps Monday free",()=>{assert.equal(workoutForDate("2026-10-19",defaultSchedule),undefined);assert.equal(workoutForDate("2026-10-20",defaultSchedule)?.id,"a");assert.equal(workoutForDate("2026-10-24",defaultSchedule)?.id,"cycle")});
test("one-off override does not change next week",()=>{const schedule={...defaultSchedule,overrides:[...defaultSchedule.overrides,{date:"2026-10-27",workoutId:"swim"}]};assert.equal(workoutForDate("2026-10-27",schedule)?.id,"swim");assert.equal(workoutForDate("2026-11-03",schedule)?.id,"a")});
