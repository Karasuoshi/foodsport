import {test} from "node:test";
import assert from "node:assert/strict";
import {macros,total,localDate,type FoodEntry} from "../lib/food";
const entry:FoodEntry={id:"1",date:"2026-10-12",name:"Тестовая еда",grams:250,kcal100:120,protein100:20,fat100:3,carbs100:4};
test("portion-based kcal and macros",()=>assert.deepEqual(macros(entry),{kcal:300,protein:50,fat:7.5,carbs:10}));
test("daily total and empty journal",()=>{assert.deepEqual(total([]),{kcal:0,protein:0,fat:0,carbs:0});assert.equal(total([entry,{...entry,id:"2",grams:100}]).kcal,420)});
test("edits recalculate macros",()=>assert.equal(macros({...entry,grams:150}).kcal,180));
test("date uses local calendar components",()=>assert.equal(localDate(new Date(2026,9,12,0,5)),"2026-10-12"));
