"use client";
import {CalendarDays,ChevronDown,ChevronUp} from "lucide-react";
import React,{useState} from "react";
import {TrainingDay,trainingDaySummary,trainingName} from "../lib/training";
const weekdays=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

export default function WorkoutPlanner({day,week,onDateChange}:{day:TrainingDay;week:TrainingDay[];onDateChange:(d:string)=>void}){
 const [expandedDate,setExpandedDate]=useState<string|null>(null);
 const expanded=expandedDate===day.date;
 const program=day.status==="planned"||day.sessions.some(t=>trainingName(t.type)===day.planned?.name)?day.planned:undefined;
 return <section className="journalpanel workoutplanner">
 <div className="journalpanelhead"><div><h2>Календарь тренировок</h2></div><CalendarDays size={20}/></div>
 <div className="workoutweek">{week.map((d,i)=><button key={d.date} aria-pressed={d.date===day.date} className={"workoutday"+(d.date===day.date?" active":"")} onClick={()=>{onDateChange(d.date);setExpandedDate(null)}}><span>{weekdays[i]}</span><b>{Number(d.date.slice(-2))}</b><small>{d.title}</small><small>{d.statusText}</small></button>)}</div>
 <div className="workoutdetail"><div><strong>{trainingDaySummary(day)}</strong><p>{day.statusText}</p>{day.status==="planned"&&<p>{day.planned?.description}</p>}</div></div>
 {program&&<><button className="workoutopen" onClick={()=>setExpandedDate(expanded?null:day.date)}>{expanded?"Свернуть программу":"Посмотреть упражнения"} {expanded?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>
 {expanded&&<div className="workoutsteps">{program.exercises.map((e,i)=><div className="workoutstep" key={i}><div className="workoutstepheading"><strong>{i+1}. {e.name}</strong><small>{e.sets} × {e.reps}</small></div>{e.hint&&<p className="journalsub">{e.hint}</p>}</div>)}</div>}</>}
 </section>
}
