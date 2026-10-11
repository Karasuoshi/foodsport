"use client";
import {CalendarDays,ChevronDown,ChevronUp} from "lucide-react";
import {useEffect,useState} from "react";
import {defaultSchedule,workoutForDate,ScheduleConfig} from "../lib/workouts";
const shift=(d:string,n:number)=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return [x.getFullYear(),String(x.getMonth()+1).padStart(2,"0"),String(x.getDate()).padStart(2,"0")].join("-")};
const weekdays=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
export default function WorkoutPlanner({date,onDateChange}:{date:string;onDateChange:(d:string)=>void}){
 const [schedule,setSchedule]=useState<ScheduleConfig>(defaultSchedule);
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{try{const saved=localStorage.getItem("fs-workout-schedule-v1");if(saved)setSchedule(JSON.parse(saved))}catch{}},[]);
 const planned=workoutForDate(date,schedule);
 const monday=shift(date,-((new Date(date+"T12:00:00").getDay()+6)%7));
 return <section className="journalpanel workoutplanner">
 <div className="journalpanelhead"><div><h2>План тренировок</h2><small>Выбери день и смотри программу</small></div><CalendarDays size={20}/></div>
 <div className="workoutweek">{Array.from({length:7},(_,i)=>{const d=shift(monday,i),w=workoutForDate(d,schedule);return <button key={d} className={"workoutday"+(d===date?" active":"")} onClick={()=>{onDateChange(d);setExpanded(false)}}><span>{weekdays[i]}</span><b>{Number(d.slice(-2))}</b><small>{w?(w.kind==="strength"?"Силовая":w.kind==="swim"?"Бассейн":w.kind==="cycle"?"Сайкл":"Кардио"):"Отдых"}</small></button>})}</div>
 <div className="workoutdetail"><div><strong>{planned?.name||"День отдыха"}</strong><p>{planned?planned.description:"На сегодня тренировка не запланирована."}</p>{planned&&<small>Ориентир: {planned.duration} минут</small>}</div></div>
 {planned&&<><button className="workoutopen" onClick={()=>setExpanded(v=>!v)}>{expanded?"Свернуть программу":"Посмотреть упражнения"} {expanded?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>
 {expanded&&<div className="workoutsteps">{planned.exercises.map((e,i)=><div className="workoutstep" key={i}><div className="workoutstepheading"><strong>{i+1}. {e.name}</strong><small>{e.sets} × {e.reps}</small></div>{e.hint&&<p className="journalsub">{e.hint}</p>}</div>)}</div>}</>}
 <p className="workoutnote">Ничего вводить не нужно. Изменения расписания обсуждаем в чате.</p>
 </section>
}