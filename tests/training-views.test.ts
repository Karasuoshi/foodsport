import {test} from "node:test";
import {strict as assert} from "node:assert";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import WorkoutPlanner from "../app/WorkoutPlanner";
import TrainingJournal,{TrainingSummary} from "../app/TrainingJournal";
import {trainingDay,TrainingDay} from "../lib/training";
import {ScheduleConfig} from "../lib/workouts";

const date="2040-06-04";
const schedule:ScheduleConfig={effectiveFrom:date,weekdays:[null,null,null,null,null,null,null],overrides:[{date,workoutId:"b"}]};
const renderViews=(day:TrainingDay)=>[
 renderToStaticMarkup(React.createElement(WorkoutPlanner,{day,week:[day],onDateChange:()=>{}})),
 renderToStaticMarkup(React.createElement(TrainingJournal,{day})),
 renderToStaticMarkup(React.createElement(TrainingSummary,{day})),
];

test("calendar, daily journal and weekly cell all render the same completed activity",()=>{
 const session={id:"fixture-session",date,type:"Бег",minutes:42,notes:"Легко"};
 for(const html of renderViews(trainingDay(date,[session],schedule))){
  assert.match(html,/Бег/);
  assert.match(html,/Выполнено/);
  assert.doesNotMatch(html,/Силовая Б/);
 }
});

test("all three views keep an unrecorded workout explicitly planned",()=>{
 for(const html of renderViews(trainingDay(date,[],schedule))){
  assert.match(html,/Силовая Б/);
  assert.match(html,/По плану/);
  assert.doesNotMatch(html,/Выполнено/);
 }
});
