"use client";
// Read-only dashboard. Every number comes from Supabase via useJournal;
// agents write the journal, the site only displays it (see AGENTS.md).
import { useMemo, useState, type ReactNode } from "react";
import { Activity, BookOpen, ChevronLeft, ChevronRight, Scale } from "lucide-react";
import { macros, round, today, total } from "../lib/food";
import { scheduleFromPlans, trainingDay } from "../lib/training";
import type { Settings, Weight } from "../lib/cloud";
import useJournal from "./useJournal";
import Login from "./Login";
import TrainingDay, { TrainingSummary } from "./TrainingDay";

const shift = (value: string, delta: number) => {
  const d = new Date(value + "T12:00:00");
  d.setDate(d.getDate() + delta);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
};
const label = (d: string, opts: Intl.DateTimeFormatOptions) => new Date(d + "T12:00:00").toLocaleDateString("ru-RU", opts);
const num = (n: number) => round(n).toLocaleString("ru-RU");
const time = (iso: string) => new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="journalapp">
      <header className="journalheader">
        <div className="journalbrand"><Activity size={23} /><strong>FoodSport</strong><span>Дневник</span></div>
      </header>
      <main className="journalmain">{children}</main>
    </div>
  );
}

export default function Home() {
  const { data, status } = useJournal();
  const [date, setDate] = useState(today());
  const food = data?.food ?? [];
  const trainings = data?.trainings ?? [];
  const reviews = data?.reviews ?? [];
  const plans = data?.plans ?? [];
  const weights = data?.weights ?? [];
  const goals: Settings = data?.settings ?? {};

  const schedule = useMemo(() => scheduleFromPlans(plans), [plans]);
  const week = useMemo(() => {
    const monday = shift(date, -((new Date(date + "T12:00:00").getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => trainingDay(shift(monday, i), trainings, schedule));
  }, [date, trainings, schedule]);
  const selected = week.find((d) => d.date === date)!;
  const daily = useMemo(() => food.filter((e) => e.date === date), [food, date]);
  const sum = total(daily);
  const review = reviews.find((r) => r.date === date);
  const sortedWeights = useMemo(() => [...weights].sort((a, b) => a.date.localeCompare(b.date)), [weights]);
  const latest = sortedWeights.at(-1);
  const previous = sortedWeights.at(-2);
  const now = today();
  // Past days only: a half-logged today would drag the average down.
  const recorded = week.filter((d) => d.date < now).map((d) => total(food.filter((e) => e.date === d.date))).filter((t) => t.kcal > 0);
  const avg = (k: "kcal" | "protein") => recorded.reduce((n, t) => n + t[k], 0) / recorded.length;
  const sessions = week.reduce((n, d) => n + d.sessions.length, 0);

  if (status === "signed-out") return <Shell><Login /></Shell>;
  if (!data) {
    return (
      <Shell>
        <p className="journalempty">
          {status === "offline" ? "Не удалось загрузить дневник. Страница попробует снова сама." : "Загружаю дневник…"}
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="journalheading">
        <div><h1>Дневник</h1><p>Питание, активность и вес</p></div>
        <div className="datebar">
          <button aria-label="Предыдущий день" onClick={() => setDate(shift(date, -1))}><ChevronLeft size={18} /></button>
          <span>{label(date, { weekday: "short", day: "numeric", month: "long" })}</span>
          <button aria-label="Следующий день" onClick={() => setDate(shift(date, 1))}><ChevronRight size={18} /></button>
          {date !== now && <button className="datetoday" onClick={() => setDate(now)}>Сегодня</button>}
        </div>
      </div>
      {status === "offline" && <p className="syncnote">Нет связи с базой. Показаны данные на {time(data.syncedAt)}.</p>}

      <div className="journalmetrics">
        <Metric name="Калории" value={sum.kcal} unit="ккал" empty={!daily.length} target={goals.kcalTarget} />
        <Metric name="Белок" value={sum.protein} unit="г" empty={!daily.length} target={goals.proteinMin} targetMax={goals.proteinMax} />
        <Metric name="Жиры" value={sum.fat} unit="г" empty={!daily.length} />
        <Metric name="Углеводы" value={sum.carbs} unit="г" empty={!daily.length} />
      </div>

      <div className="journalgrid">
        <div className="journalprimary">
          <section className="journalpanel">
            <div className="journalpanelhead"><h2>Питание</h2></div>
            {daily.length ? (
              <div className="mealstable">
                <div className="mealstablehead"><span>Продукт</span><span>Ккал</span><span>Белок</span><span>Жиры</span><span>Углев.</span></div>
                {daily.map((e) => {
                  const m = macros(e);
                  return (
                    <div className="mealrow" key={e.id}>
                      <div><strong>{e.name}</strong><small>{e.grams} г</small></div>
                      <b>{round(m.kcal)}</b><b>{round(m.protein)} г</b><b>{round(m.fat)} г</b><b>{round(m.carbs)} г</b>
                    </div>
                  );
                })}
              </div>
            ) : <p className="journalempty">Питание за этот день не записано.</p>}
            {review?.score != null && <p className="dayscore"><strong>Оценка дня: {review.score}/10</strong>{review.comment && <> — {review.comment}</>}</p>}
          </section>

          <TrainingDay key={date} day={selected} />

          <section className="journalpanel">
            <div className="journalpanelhead"><div><h2>Неделя</h2><small>{recorded.length ? `В среднем ${num(avg("kcal"))} ккал · белок ${num(avg("protein"))} г · дней с записями: ${recorded.length}` : "Записей за неделю пока нет"}{` · тренировок: ${sessions}`}</small></div></div>
            <div className="weeksummary">
              {week.map((activity) => {
                const d = activity.date;
                const entries = food.filter((e) => e.date === d);
                const r = reviews.find((x) => x.date === d);
                const t = total(entries);
                const future = d > now;
                return (
                  <button key={d} aria-pressed={d === date} className={"weeksummaryrow" + (d === date ? " selected" : "")} onClick={() => setDate(d)}>
                    <strong>{label(d, { weekday: "short", day: "numeric", month: "short" })}</strong>
                    <span>
                      {entries.length ? `${round(t.kcal)} ккал · Б ${round(t.protein)} · Ж ${round(t.fat)} · У ${round(t.carbs)} г` : future ? "Впереди" : "Питание не записано"}
                      {r?.score != null && <small>Оценка {r.score}/10</small>}
                    </span>
                    <TrainingSummary day={activity} />
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="journalside">
          <section className="journalpanel">
            <div className="journalpanelhead"><h2>Вес</h2><Scale size={19} /></div>
            <div className="journalweight">{latest ? latest.value.toFixed(1) : "—"} <span>кг</span></div>
            <p className="journalsub">{goals.weightGoal ? `Цель ${goals.weightGoal} кг · ` : ""}измерение раз в неделю</p>
            {latest && previous && (
              <p className="journaldelta">К прошлому измерению: {latest.value - previous.value > 0 ? "+" : ""}{(latest.value - previous.value).toFixed(1)} кг</p>
            )}
            <WeightGraph weights={sortedWeights} />
          </section>
        </aside>
      </div>
    </Shell>
  );
}

function Metric({ name, value, unit, empty, target, targetMax }: { name: string; value: number; unit: string; empty: boolean; target?: number; targetMax?: number }) {
  const goal = target ? (targetMax && targetMax !== target ? `${num(target)}–${num(targetMax)}` : num(target)) : "";
  const share = target ? Math.min(100, (value / target) * 100) : 0;
  const over = target !== undefined && value > (targetMax ?? target) * 1.05;
  return (
    <div>
      <small>{name}</small>
      <strong>{empty ? "—" : num(value)} <span>{unit}</span></strong>
      {goal && <><div className={"metricbar" + (over ? " over" : "")}><i style={{ width: (empty ? 0 : share) + "%" }} /></div><small className="metricgoal">ориентир {goal} {unit}</small></>}
    </div>
  );
}

function WeightGraph({ weights }: { weights: Weight[] }) {
  if (!weights.length) return <div className="empty"><BookOpen size={27} /><p>Измерений пока нет</p></div>;
  if (weights.length === 1) return <div className="weightone">{weights[0].value.toFixed(1)} кг <small>{weights[0].date}</small></div>;
  const values = weights.map((w) => w.value);
  const min = Math.min(...values) - 1, max = Math.max(...values) + 1;
  const points = weights.map((w, i) => [24 + (i / (weights.length - 1)) * 552, 150 - ((w.value - min) / (max - min)) * 120]);
  return (
    <div className="graph">
      <svg viewBox="0 0 600 180" role="img" aria-label="График веса">
        <line x1="24" y1="150" x2="576" y2="150" stroke="#dbe4e5" />
        <polyline points={points.map((p) => p.join(",")).join(" ")} fill="none" stroke="#188779" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="5" fill="#188779"><title>{weights[i].date}: {weights[i].value} кг</title></circle>)}
      </svg>
      <div className="graphlabels"><span>{weights[0].date}</span><span>{weights.at(-1)?.date}</span></div>
    </div>
  );
}
