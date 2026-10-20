"use client";
// One panel for the selected day's training: what was done, otherwise what is planned.
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Dumbbell } from "lucide-react";
import { TrainingDay as Day, trainingDaySummary, trainingName } from "../lib/training";

/** Compact line for the week summary. */
export function TrainingSummary({ day }: { day: Day }) {
  return <span>{trainingDaySummary(day)}<small>{day.statusText}</small></span>;
}

export default function TrainingDay({ day }: { day: Day }) {
  const [open, setOpen] = useState(false);
  // The template's exercise list is shown for a planned day, or when the session done matches the plan.
  const program = day.status === "planned" || day.sessions.some((t) => trainingName(t.type) === day.planned?.name) ? day.planned : undefined;
  return (
    <section className="journalpanel">
      <div className="journalpanelhead"><div><h2>Тренировка</h2><small>{day.statusText}</small></div><Dumbbell size={19} /></div>
      {day.sessions.length ? day.sessions.map((t) => (
        <div className="completedtraining" key={t.id}>
          <strong>{trainingName(t.type)} · {Math.round(t.minutes)} мин</strong>
          {t.notes && <p>{t.notes}</p>}
        </div>
      )) : (
        <div className="workoutdetail">
          <strong>{trainingDaySummary(day)}</strong>
          {day.status === "planned" && <p>{day.planned?.description}</p>}
        </div>
      )}
      {program && (
        <>
          <button className="workoutopen" onClick={() => setOpen(!open)}>
            {open ? "Свернуть программу" : "Программа тренировки"} {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {open && (
            <div className="workoutsteps">
              {program.exercises.map((e, i) => (
                <div className="workoutstep" key={i}>
                  <div className="workoutstepheading"><strong>{i + 1}. {e.name}</strong><small>{e.sets} × {e.reps}</small></div>
                  {e.hint && <p className="journalsub">{e.hint}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
