import {test} from "node:test";
import {strict as assert} from "node:assert";
import {PlanItem,Training,scheduleFromPlans,trainingDay,trainingDaySummary} from "../lib/training";
import {ScheduleConfig} from "../lib/workouts";

const date="2040-06-04";
const base:ScheduleConfig={effectiveFrom:"2040-06-01",weekdays:[null,null,null,null,null,null,null],overrides:[{date,workoutId:"b"}]};
const workout:Training={id:"session-1",date,type:"Бег",minutes:42,notes:""};
const plan=(day:string,id:string):PlanItem=>({id:`workout-plan:test-owner:${day}:${id}`,date:day,title:"",done:false});

test("a scheduled workout stays planned until a completed session exists",()=>{
 const day=trainingDay(date,[],base);
 assert.equal(day.title,"Силовая Б");
 assert.equal(day.status,"planned");
 assert.equal(day.statusText,"По плану");
 assert.deepEqual(day.sessions,[]);
});

test("actual activity replaces a different scheduled workout in the shared day view",()=>{
 const day=trainingDay(date,[workout],base);
 assert.equal(day.title,"Бег");
 assert.equal(day.status,"completed");
 assert.equal(day.statusText,"Выполнено");
 assert.equal(trainingDaySummary(day),"Бег · 42 мин");
});

test("a completed workout also takes priority over a rest override",()=>{
 const schedule=scheduleFromPlans([plan(date,"rest")],base);
 assert.equal(trainingDay(date,[],schedule).status,"rest");
 assert.equal(trainingDay(date,[workout],schedule).title,"Бег");
});

test("cloud rescheduling updates both dates without changing the recurring schedule",()=>{
 const next="2040-06-05";
 const schedule=scheduleFromPlans([plan(date,"rest"),plan(next,"cycle")],base);
 assert.equal(trainingDay(date,[],schedule).status,"rest");
 assert.equal(trainingDay(next,[],schedule).planned?.id,"cycle");
 assert.equal(trainingDay("2040-06-12",[],schedule).status,"rest");
});

test("a correction, move or deletion re-derives every view from current sessions",()=>{
 const edited={...workout,type:"Плавание",minutes:30};
 assert.equal(trainingDaySummary(trainingDay(date,[edited],base)),"Плавание · 30 мин");
 const moved={...edited,date:"2040-06-05"};
 assert.equal(trainingDay(date,[moved],base).status,"planned");
 assert.equal(trainingDay(moved.date,[moved],base).status,"completed");
 assert.equal(trainingDay(date,[],base).sessions.length,0);
});

test("multiple sessions are retained and their minutes are summed",()=>{
 const day=trainingDay(date,[workout,{...workout,id:"session-2",type:"Силовая А — выполнена",minutes:50},{...workout,id:"other-date",date:"2040-06-06"}],base);
 assert.equal(day.title,"Бег · Силовая А");
 assert.equal(day.minutes,92);
 assert.equal(day.sessions.length,2);
});

test("ordinary tasks, malformed dates and unknown workout IDs cannot change the schedule",()=>{
 const tasks=[{id:"task",date,title:"Сайкл",done:true},{...plan(date,"rest"),date:"2040-06-05"},plan(date,"unknown")];
 assert.equal(trainingDay(date,[],scheduleFromPlans(tasks,base)).planned?.id,"b");
});
