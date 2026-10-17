import {defaultSchedule,ScheduleConfig,Workout,workoutForDate,workouts} from "./workouts";

export type Training={id:string;date:string;type:string;minutes:number;notes:string};
export type PlanItem={id:string;date:string;title:string;done:boolean};
export type TrainingDay={
 date:string;
 sessions:Training[];
 planned?:Workout;
 status:"completed"|"planned"|"rest";
 title:string;
 statusText:string;
 minutes?:number;
};

export const trainingName=(type:string)=>type.replace(/\s*—\s*выполнен[ао]?\s*$/i,"").trim();

export function scheduleFromPlans(plans:PlanItem[],base:ScheduleConfig=defaultSchedule):ScheduleConfig {
 const overrides=plans.flatMap(p=>{
  const parts=p.id.split(":");
  if(parts.length!==4||parts[0]!=="workout-plan"||!parts[1]||parts[2]!==p.date)return [];
  const id=parts[3];
  return id==="rest"||workouts.some(w=>w.id===id)?[{date:p.date,workoutId:id==="rest"?null:id}]:[];
 });
 return {...base,overrides:[...overrides,...base.overrides]};
}

// Every training surface uses this view of the same cloud records. A plan is
// never promoted to a completed workout; actual sessions take display priority.
export function trainingDay(date:string,trainings:Training[],schedule:ScheduleConfig):TrainingDay {
 const sessions=trainings.filter(t=>t.date===date);
 const planned=workoutForDate(date,schedule);
 if(sessions.length)return {date,sessions,planned,status:"completed",title:sessions.map(t=>trainingName(t.type)).join(" · "),statusText:"Выполнено",minutes:sessions.reduce((n,t)=>n+t.minutes,0)};
 if(planned)return {date,sessions,planned,status:"planned",title:planned.name,statusText:"По плану",minutes:planned.duration};
 return {date,sessions,status:"rest",title:"Отдых",statusText:"Отдых по плану"};
}

export const trainingDaySummary=(day:TrainingDay)=>day.title+(day.minutes===undefined?"":` · ${Math.round(day.minutes)} мин`);
