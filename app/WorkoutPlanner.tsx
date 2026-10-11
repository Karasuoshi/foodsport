"use client";
import {useEffect,useState} from "react";
import {CalendarDays,Check,ChevronDown,ChevronUp,Dumbbell,Pencil,RotateCcw} from "lucide-react";
import {defaultSchedule,workouts,workoutForDate,ScheduleConfig,Workout} from "../lib/workouts";
type Session={date:string;workoutId:string;done:string[];weights:Record<string,string>;finished:boolean};
const shift=(d:string,n:number)=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return [x.getFullYear(),String(x.getMonth()+1).padStart(2,"0"),String(x.getDate()).padStart(2,"0")].join("-")};
const weekdays=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
export default function WorkoutPlanner({date,onDateChange,onComplete}:{date:string;onDateChange:(d:string)=>void;onComplete?:(w:Workout)=>void}){
 const [schedule,setSchedule]=useState<ScheduleConfig>(defaultSchedule);
 const [sessions,setSessions]=useState<Session[]>([]);
 const [ready,setReady]=useState(false);
 const [editing,setEditing]=useState(false);
 const [mode,setMode]=useState<"once"|"weekly">("once");
 const [chosen,setChosen]=useState("");
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{try{const s=localStorage.getItem("fs-workout-schedule-v1");if(s)setSchedule(JSON.parse(s));const a=localStorage.getItem("fs-workout-sessions-v1");if(a)setSessions(JSON.parse(a))}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("fs-workout-schedule-v1",JSON.stringify(schedule))},[schedule,ready]);
 useEffect(()=>{if(ready)localStorage.setItem("fs-workout-sessions-v1",JSON.stringify(sessions))},[sessions,ready]);
 const planned=workoutForDate(date,schedule);
 const session=sessions.find(s=>s.date===date&&s.workoutId===planned?.id);
 const monday=shift(date,-((new Date(date+"T12:00:00").getDay()+6)%7));
 const saveChange=()=>{const id=chosen||null;if(mode==="once"){setSchedule(s=>({...s,overrides:[...s.overrides.filter(x=>x.date!==date),{date,workoutId:id}]}))}else{const index=(new Date(date+"T12:00:00").getDay()+6)%7;setSchedule(s=>({...s,effectiveFrom:date,weekdays:s.weekdays.map((v,i)=>i===index?id:v)}))}setEditing(false)};
 const toggle=(key:string)=>{if(!planned)return;setSessions(prev=>{const old=prev.find(s=>s.date===date&&s.workoutId===planned.id)||{date,workoutId:planned.id,done:[],weights:{},finished:false};const next={...old,done:old.done.includes(key)?old.done.filter(k=>k!==key):[...old.done,key]};return [...prev.filter(s=>!(s.date===date&&s.workoutId===planned.id)),next]})};
 const setWeight=(key:string,value:string)=>{if(!planned)return;setSessions(prev=>{const old=prev.find(s=>s.date===date&&s.workoutId===planned.id)||{date,workoutId:planned.id,done:[],weights:{},finished:false};return [...prev.filter(s=>!(s.date===date&&s.workoutId===planned.id)),{...old,weights:{...old.weights,[key]:value}}]})};
 const finish=()=>{if(!planned)return;setSessions(prev=>{const old=prev.find(s=>s.date===date&&s.workoutId===planned.id)||{date,workoutId:planned.id,done:[],weights:{},finished:false};return [...prev.filter(s=>!(s.date===date&&s.workoutId===planned.id)),{...old,finished:!old.finished}]});if(!session?.finished)onComplete?.(planned)};
 return <section className="journalpanel workoutplanner">
 <div className="journalpanelhead"><div><h2>План тренировок</h2><small>Расписание меняется без обновления сайта</small></div><CalendarDays size={20}/></div>
 <div className="workoutweek">{Array.from({length:7},(_,i)=>{const d=shift(monday,i),w=workoutForDate(d,schedule),done=sessions.some(s=>s.date===d&&s.workoutId===w?.id&&s.finished);return <button key={d} className={"workoutday"+(d===date?" active":"")} onClick={()=>{onDateChange(d);setEditing(false);setExpanded(false)}}><span>{weekdays[i]}</span><b>{Number(d.slice(-2))}</b><small>{w?(w.kind==="strength"?"Силовая":w.kind==="swim"?"Бассейн":w.kind==="cycle"?"Сайкл":"Кардио"):"Отдых"}</small>{done&&<Check size={13}/>}</button>})}</div>
 <div className="workoutdetail"><div><strong>{planned?.name||"День отдыха"}</strong><p>{planned?planned.description:"Тренировка не запланирована. Можно отдохнуть или выбрать активность."}</p>{planned&&<small>{planned.duration} минут · {planned.exercises.length} этапов</small>}</div><button className="workoutedit" onClick={()=>{setEditing(v=>!v);setChosen(planned?.id||"")}}><Pencil size={15}/> Изменить</button></div>
 {editing&&<div className="workouteditor"><label>Тренировка на {date}<select value={chosen} onChange={e=>setChosen(e.target.value)}><option value="">Отдых</option>{workouts.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></label><label>Тип изменения<select value={mode} onChange={e=>setMode(e.target.value as "once"|"weekly")}><option value="once">Только на этот день</option><option value="weekly">Повторять в этот день недели с выбранной даты</option></select></label><div className="workouteditactions"><button className="journaladd" onClick={saveChange}>Сохранить расписание</button><button onClick={()=>setEditing(false)}>Отмена</button></div><p>Изменение плана не удаляет историю выполненных тренировок.</p></div>}
 {planned&&<><button className="workoutopen" onClick={()=>setExpanded(v=>!v)}>{expanded?"Свернуть упражнения":"Открыть тренировку"} {expanded?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>
 {expanded&&<div className="workoutsteps">{planned.exercises.map((e,i)=><div className="workoutstep" key={i}><div className="workoutstepheading"><strong>{i+1}. {e.name}</strong><small>{e.sets} × {e.reps}</small></div><div className="workoutsets">{Array.from({length:e.sets},(_,j)=>{const key=i+"-"+j;return <div className="workoutset" key={key}><button aria-label={"Отметить подход "+(j+1)} className={session?.done.includes(key)?"done":""} onClick={()=>toggle(key)}>{session?.done.includes(key)?<Check size={15}/>:j+1}</button>{planned.kind==="strength"&&i>0&&<input aria-label={"Вес для подхода "+(j+1)+" упражнения "+e.name} type="number" min="0" step="0.5" placeholder="кг" value={session?.weights[key]||""} onChange={ev=>setWeight(key,ev.target.value)}/>}</div>})}</div></div>)}
 <button className={"workoutfinish"+(session?.finished?" finished":"")} onClick={finish}>{session?.finished?"✓ Выполнено · отменить отметку":"Завершить тренировку"}</button></div>}</>}
 <p className="workoutnote">План и результаты сохраняются в этом браузере. Синхронизация с ChatGPT потребует отдельного защищённого подключения.</p>
 </section>
}
