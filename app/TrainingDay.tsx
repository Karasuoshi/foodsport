"use client";
// One panel for the selected day's training: what was done, otherwise what is planned or suggested by the weekly quota.
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Dumbbell } from "lucide-react";
import { QuotaProgress, Suggestion, TrainingDay as Day, trainingDaySummary, trainingName } from "../lib/training";
import { workouts } from "../lib/workouts";

/** Compact line for the week summary. */
export function TrainingSummary({ day }: { day: Day }) {
  return <span>{trainingDaySummary(day)}{day.statusText && <small>{day.statusText}</small>}</span>;
}

/** Weekly quota line: «Силовые 1/2 · Кардио 0/2 · Лёгкая 0/1». */
export function QuotaLine({ progress }: { progress: QuotaProgress[] }) {
  return (
    <div className="quotaline">
      {progress.map((q) => (
        <span key={q.group} className={q.done >= q.target ? "done" : ""}>{q.label} {q.done}/{q.target}{q.optional ? " · по желанию" : ""}</span>
      ))}
    </div>
  );
}

export default function TrainingDay({ day, suggestion }: { day: Day; suggestion?: Suggestion }) {
  const [open, setOpen] = useState(false);
  // The template's exercise list: planned or suggested workout, or the template a recorded session matches.
  const done = day.sessions.map((t) => trainingName(t.type).toLowerCase());
  const program = day.status === "planned" ? day.planned
    : day.status === "free" ? suggestion?.workout
    : workouts.find((w) => done.some((d) => d.startsWith(w.name.toLowerCase())));
  return (
    <section className="journalpanel">
      <div className="journalpanelhead"><div><h2>Тренировка</h2>{day.statusText && <small>{day.statusText}</small>}</div><Dumbbell size={19} /></div>
      {day.sessions.length ? day.sessions.map((t) => (
        <div className="completedtraining" key={t.id}>
          <strong>{trainingName(t.type)} · {Math.round(t.minutes)} мин</strong>
          {t.notes && <p>{t.notes}</p>}
        </div>
      )) : day.status === "free" && suggestion ? (
        <div className="workoutdetail">
          <strong>Предлагаю: {suggestion.title}</strong>
          <p>{suggestion.text}</p>
        </div>
      ) : (
        <div className="workoutdetail">
          <strong>{trainingDaySummary(day)}</strong>
          {day.status === "planned" && <p>{day.planned?.description}</p>}
        </div>
      )}
      {program && (
        <>
          <button className="workoutopen" onClick={() => setOpen(!open)}>
            {open ? "Свернуть программу" : `Программа: ${program.name}`} {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {open && (
            <div className="workoutsteps">
              <p className="journalsub">{program.description} {program.short}</p>
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
