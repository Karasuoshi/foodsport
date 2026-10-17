import React from "react";
import {TrainingDay,trainingDaySummary,trainingName} from "../lib/training";

export function TrainingSummary({day}:{day:TrainingDay}){
 return <span>{trainingDaySummary(day)}<small>{day.statusText}</small></span>;
}

export default function TrainingJournal({day}:{day:TrainingDay}){
 return <section className="journalpanel trainingjournal">
  <div className="journalpanelhead"><h2>Тренировки за день</h2><small>{day.statusText}</small></div>
  {day.sessions.length?day.sessions.map(t=><div className="completedtraining" key={t.id}><strong>{trainingName(t.type)} · {Math.round(t.minutes)} мин</strong>{t.notes&&<p>{t.notes}</p>}</div>):<div className="journalempty"><strong>{trainingDaySummary(day)}</strong><p>{day.status==="planned"?"По плану · выполнение пока не записано.":"Отдых по плану · выполненных тренировок в дневнике нет."}</p></div>}
 </section>
}
