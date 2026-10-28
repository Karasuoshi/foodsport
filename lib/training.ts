import {emptySchedule,groupOf,QuotaGroup,ScheduleConfig,Workout,workoutById,workoutForDate,weeklyQuota,workouts} from "./workouts";

export type Training={id:string;date:string;type:string;minutes:number;notes:string};
export type PlanItem={id:string;date:string;title:string;done:boolean};
export type TrainingDay={
 date:string;
 sessions:Training[];
 planned?:Workout;
 status:"completed"|"planned"|"rest"|"free";
 title:string;
 statusText:string;
 minutes?:number;
};
export type QuotaProgress={group:QuotaGroup;label:string;target:number;done:number;optional?:boolean};
export type Suggestion={title:string;text:string;workout?:Workout};

export const trainingName=(type:string)=>type.replace(/\s*—\s*выполнен[ао]?\s*$/i,"").trim();

const shift=(value:string,delta:number)=>{
 const d=new Date(value+"T12:00:00");
 d.setDate(d.getDate()+delta);
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
};
export const mondayOf=(date:string)=>shift(date,-((new Date(date+"T12:00:00").getDay()+6)%7));
export const weekDates=(date:string)=>{const m=mondayOf(date);return Array.from({length:7},(_,i)=>shift(m,i))};

/** One-off plans from plan_items: `workout-plan:<date>:<workoutId|rest>`. */
export function scheduleFromPlans(plans:PlanItem[],base:ScheduleConfig=emptySchedule):ScheduleConfig {
 const overrides=plans.flatMap(p=>{
  const parts=p.id.split(":");
  if(parts.length!==3||parts[0]!=="workout-plan"||parts[1]!==p.date)return [];
  const id=parts[2];
  return id==="rest"||workouts.some(w=>w.id===id)?[{date:p.date,workoutId:id==="rest"?null:id}]:[];
 });
 return {overrides:[...overrides,...base.overrides]};
}

// Every training surface uses this view of the same cloud records. A plan is
// never promoted to a completed workout; actual sessions take display priority.
export function trainingDay(date:string,trainings:Training[],schedule:ScheduleConfig,today?:string):TrainingDay {
 const sessions=trainings.filter(t=>t.date===date);
 const planned=workoutForDate(date,schedule);
 if(sessions.length)return {date,sessions,planned,status:"completed",title:sessions.map(t=>trainingName(t.type)).join(" · "),statusText:"Выполнено",minutes:sessions.reduce((n,t)=>n+t.minutes,0)};
 if(planned)return {date,sessions,planned,status:"planned",title:planned.name,statusText:"Запланировано",minutes:planned.duration};
 if(schedule.overrides.some(o=>o.date===date&&o.workoutId===null))return {date,sessions,status:"rest",title:"Отдых",statusText:"Отдых по плану"};
 const past=today!==undefined&&date<today;
 return {date,sessions,status:"free",title:past?"Без тренировки":"Свободный день",statusText:past?"":"Тренировка по квоте недели"};
}

export const trainingDaySummary=(day:TrainingDay)=>day.title+(day.minutes===undefined?"":` · ${Math.round(day.minutes)} мин`);

/** How much of the weekly quota the sessions of the week containing `date` cover. */
export function weekProgress(date:string,trainings:Training[]):QuotaProgress[]{
 const days=new Set(weekDates(date));
 const groups=trainings.filter(t=>days.has(t.date)).map(t=>groupOf(trainingName(t.type)));
 return weeklyQuota.map(q=>({...q,done:groups.filter(g=>g===q.group).length}));
}

/** Strength templates alternate: after А comes Б and vice versa. */
export function nextStrength(date:string,trainings:Training[]):Workout{
 const last=[...trainings].filter(t=>t.date<=date&&groupOf(trainingName(t.type))==="strength").sort((a,b)=>a.date.localeCompare(b.date)).at(-1);
 const name=last?trainingName(last.type).toLowerCase():"";
 return workoutById(name.startsWith("силовая а")?"b":"a")!;
}

/** What to do on `date` if nothing is recorded or planned yet, by what the week still lacks. */
export function suggestion(date:string,trainings:Training[]):Suggestion{
 const left=(g:QuotaGroup)=>{const p=weekProgress(date,trainings).find(q=>q.group===g)!;return p.target-p.done};
 const strengthYesterday=trainings.some(t=>t.date===shift(date,-1)&&groupOf(trainingName(t.type))==="strength");
 if(left("strength")>0&&!strengthYesterday){
  const w=nextStrength(shift(date,-1),trainings);
  return {title:w.name,text:"Следующая силовая по очереди. Если сил мало — короткая версия.",workout:w};
 }
 if(left("cardio")>0)return {title:"Кардио",text:"Плавание, сайкл или бег — что удобнее."+(strengthYesterday?" Силовая была вчера, сегодня лучше кардио.":"")};
 if(left("strength")>0)return {title:"Кардио или отдых",text:"Силовая была вчера: следующую лучше через день."};
 if(left("easy")>0)return {title:"Лёгкое кардио",text:"Основная квота недели выполнена. Можно спокойно пройтись или поплавать."};
 return {title:"Отдых",text:"Квота недели выполнена."};
}
