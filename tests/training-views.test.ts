import {test} from "node:test";
import {strict as assert} from "node:assert";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import TrainingDayPanel,{TrainingSummary} from "../app/TrainingDay";
import {trainingDay,TrainingDay} from "../lib/training";
import {ScheduleConfig} from "../lib/workouts";

const date="2040-06-04";
const schedule:ScheduleConfig={overrides:[{date,workoutId:"b"}]};
const renderViews=(day:TrainingDay)=>[
 renderToStaticMarkup(React.createElement(TrainingDayPanel,{day})),
 renderToStaticMarkup(React.createElement(TrainingSummary,{day})),
];

test("day panel and weekly cell render the same completed activity",()=>{
 const session={id:"fixture-session",date,type:"Бег",minutes:42,notes:"Легко"};
 for(const html of renderViews(trainingDay(date,[session],schedule))){
  assert.match(html,/Бег/);
  assert.match(html,/Выполнено/);
  assert.doesNotMatch(html,/Силовая Б/);
 }
});

test("both views keep an unrecorded workout explicitly planned",()=>{
 for(const html of renderViews(trainingDay(date,[],schedule))){
  assert.match(html,/Силовая Б/);
  assert.match(html,/Запланировано/);
  assert.doesNotMatch(html,/Выполнено/);
 }
});
