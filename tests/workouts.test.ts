import {test} from "node:test";
import {strict as assert} from "node:assert";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {emptySchedule,groupOf,workoutForDate,workouts} from "../lib/workouts";
import {nextStrength,suggestion,Training,trainingDay,weekDates,weekProgress} from "../lib/training";
import TrainingDayPanel,{QuotaLine} from "../app/TrainingDay";

// 2040-06-04 is a Monday; all data is synthetic.
const s=(date:string,type:string):Training=>({id:`t-${date}-${type}`,date,type,minutes:45,notes:""});

test("there are no fixed weekdays: without a plan every day is free",()=>{
 assert.equal(workoutForDate("2040-06-05",emptySchedule),undefined);
 assert.equal(trainingDay("2040-06-05",[],emptySchedule,"2040-06-05").status,"free");
 assert.equal(trainingDay("2040-06-04",[],emptySchedule,"2040-06-05").title,"Без тренировки");
});

test("every template has a short version",()=>{
 for(const w of workouts)assert.ok(w.short.length>0,w.id);
});

test("session types map to quota groups",()=>{
 assert.equal(groupOf("Силовая А"),"strength");
 assert.equal(groupOf("Силовая Б (короткая)"),"strength");
 assert.equal(groupOf("Плавание"),"cardio");
 assert.equal(groupOf("Длинный сайкл"),"cardio");
 assert.equal(groupOf("Бег + ходьба"),"cardio");
 assert.equal(groupOf("Лёгкое кардио"),"easy");
 assert.equal(groupOf("Ходьба"),"easy");
 assert.equal(groupOf("Велосипед"),"cardio");
});

test("week progress counts only sessions from Monday to Sunday of that week",()=>{
 assert.deepEqual(weekDates("2040-06-07")[0],"2040-06-04");
 const data=[s("2040-06-03","Силовая А"),s("2040-06-05","Силовая Б"),s("2040-06-06","Плавание"),s("2040-06-10","Лёгкое кардио"),s("2040-06-11","Сайкл")];
 const p=weekProgress("2040-06-07",data);
 assert.deepEqual(p.map(q=>[q.group,q.done,q.target]),[["strength",1,2],["cardio",1,2],["easy",1,1]]);
});

test("strength templates alternate А and Б",()=>{
 assert.equal(nextStrength("2040-06-07",[]).id,"a");
 assert.equal(nextStrength("2040-06-07",[s("2040-06-05","Силовая А — выполнена")]).id,"b");
 assert.equal(nextStrength("2040-06-07",[s("2040-06-01","Силовая А"),s("2040-06-05","Силовая Б")]).id,"a");
});

test("suggestion fills the quota and avoids strength on consecutive days",()=>{
 assert.equal(suggestion("2040-06-04",[]).workout?.id,"a");
 const afterStrength=suggestion("2040-06-06",[s("2040-06-05","Силовая А")]);
 assert.equal(afterStrength.workout,undefined);
 assert.equal(afterStrength.title,"Кардио");
 assert.equal(suggestion("2040-06-07",[s("2040-06-05","Силовая А")]).workout?.id,"b");
 const full=[s("2040-06-04","Силовая А"),s("2040-06-06","Силовая Б"),s("2040-06-05","Плавание"),s("2040-06-07","Сайкл")];
 assert.equal(suggestion("2040-06-09",full).title,"Лёгкое кардио");
 assert.equal(suggestion("2040-06-09",[...full,s("2040-06-08","Ходьба")]).title,"Отдых");
});

test("free day panel shows the suggestion and its program; quota line shows progress",()=>{
 const html=renderToStaticMarkup(React.createElement(TrainingDayPanel,{day:trainingDay("2040-06-04",[],emptySchedule,"2040-06-04"),suggestion:suggestion("2040-06-04",[])}));
 assert.match(html,/Предлагаю: Силовая А/);
 assert.match(html,/Программа: Силовая А/);
 const line=renderToStaticMarkup(React.createElement(QuotaLine,{progress:weekProgress("2040-06-07",[s("2040-06-05","Силовая Б")])}));
 assert.match(line,/Силовые 1\/2/);
 assert.match(line,/Кардио 0\/2/);
});
