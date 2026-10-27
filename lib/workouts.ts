// Workout templates and the weekly quota. Templates change only at the owner's request.
export type Exercise={name:string;sets:number;reps:string;hint?:string};
export type QuotaGroup="strength"|"cardio"|"easy";
export type Workout={id:string;name:string;group:QuotaGroup;duration:number;description:string;short:string;exercises:Exercise[]};
export type ScheduleChange={date:string;workoutId:string|null};
/** Only one-off plans set by the agent for a specific date (plan_items). There are no fixed weekdays. */
export type ScheduleConfig={overrides:ScheduleChange[]};
export type Quota={group:QuotaGroup;label:string;target:number;optional?:boolean};

export const workouts:Workout[]=[
{id:"a",name:"Силовая А",group:"strength",duration:75,
 description:"Круговая: степпер (эллипс с рукоятками) → 3 круга силовых упражнений → степпер.",
 short:"Короткая: разминка и заминка по 5 мин, круги спокойнее — около 45 мин.",
 exercises:[{name:"Разминка: степпер (эллипс с рукоятками)",sets:1,reps:"15 мин",hint:"В короткой версии 5 мин"},{name:"Гоблет-присед",sets:3,reps:"12",hint:"20 кг"},{name:"Жим штанги лёжа",sets:3,reps:"12",hint:"52,5 кг"},{name:"Тяга верхнего блока",sets:3,reps:"12",hint:"45 кг"},{name:"Румынская тяга с гантелями",sets:3,reps:"12",hint:"2 × 20 кг"},{name:"Планка",sets:3,reps:"1 мин"},{name:"Dead bug",sets:3,reps:"20 на сторону"},{name:"Заминка: степпер (эллипс с рукоятками)",sets:1,reps:"15 мин",hint:"В короткой версии 5 мин"}]},
{id:"b",name:"Силовая Б",group:"strength",duration:77,
 description:"Классические подходы: 4 упражнения по 3×12 и пресс 2×12, степпер до и после.",
 short:"Короткая: разминка и заминка по 5 мин — около 45 мин.",
 exercises:[{name:"Разминка: степпер (эллипс с рукоятками)",sets:1,reps:"15 мин",hint:"В короткой версии 5 мин"},{name:"Рычажная тяга сидя с опорой грудью",sets:3,reps:"12",hint:"40 кг блинов всего: по 2×10 кг с каждой стороны"},{name:"Жим гантелей на наклонной скамье",sets:3,reps:"12",hint:"По 15 кг каждая"},{name:"Жим ногами",sets:3,reps:"12",hint:"100 кг блинов"},{name:"Face Pull — тяга каната к лицу",sets:3,reps:"12",hint:"14,7 кг / 32,5 фунта"},{name:"Обратные скручивания на скамье с подъёмом ног",sets:2,reps:"12"},{name:"Заминка: степпер (эллипс с рукоятками)",sets:1,reps:"15 мин",hint:"В короткой версии 5 мин"}]},
{id:"swim",name:"Плавание",group:"cardio",duration:45,
 description:"Дистанция 1500–2000 м в комфортном темпе, без спринтов.",
 short:"Короткая: 1000 м ровно — около 25 мин.",
 exercises:[{name:"Разминка",sets:1,reps:"200 м"},{name:"Основная часть",sets:4,reps:"250 м, пауза 20–40 сек"},{name:"Заминка",sets:1,reps:"300 м"}]},
{id:"cycle",name:"Длинный сайкл",group:"cardio",duration:55,
 description:"Ровный темп, интенсивность 4–6 из 10.",
 short:"Короткая: 30 мин ровной нагрузки.",
 exercises:[{name:"Разминка",sets:1,reps:"8 мин"},{name:"Ровная нагрузка",sets:1,reps:"40–45 мин"},{name:"Заминка",sets:1,reps:"5 мин"}]},
{id:"run",name:"Бег + ходьба",group:"cardio",duration:35,
 description:"Лёгкий бег с переходами на шаг, можно разговаривать.",
 short:"Короткая: 4 повтора вместо 8 — около 22 мин.",
 exercises:[{name:"Ходьба, разминка",sets:1,reps:"5 мин"},{name:"Лёгкий бег / ходьба",sets:8,reps:"1 мин / 2 мин"},{name:"Ходьба, заминка",sets:1,reps:"5 мин"}]},
{id:"cardio",name:"Лёгкое кардио",group:"easy",duration:45,
 description:"Восстановительная ходьба или спокойное плавание. Не вторая тяжёлая тренировка подряд.",
 short:"Короткая: 30 мин ходьбы.",
 exercises:[{name:"Быстрая ходьба",sets:1,reps:"45–60 мин"},{name:"Или спокойное плавание",sets:1,reps:"1500 м"}]}
];

/** Weekly quota, Monday to Sunday. Any day, any order; strength sessions not on consecutive days. */
export const weeklyQuota:Quota[]=[
 {group:"strength",label:"Силовые",target:2},
 {group:"cardio",label:"Кардио",target:2},
 {group:"easy",label:"Лёгкая",target:1,optional:true},
];

export const emptySchedule:ScheduleConfig={overrides:[]};

export const workoutById=(id:string)=>workouts.find(w=>w.id===id);

export function workoutForDate(date:string,schedule:ScheduleConfig):Workout|undefined{
 const override=schedule.overrides.find(o=>o.date===date);
 return override?.workoutId?workoutById(override.workoutId):undefined;
}

/** Quota group of a recorded session by its free-text type. Unknown types count as cardio. */
export function groupOf(type:string):QuotaGroup{
 const t=type.toLowerCase();
 const exact=workouts.find(w=>t.startsWith(w.name.toLowerCase()));
 if(exact)return exact.group;
 if(/силов|зал|жим|присед/.test(t))return "strength";
 if(/лёгк|легк|ходьб|прогулк|растяж|восстанов|йог/.test(t))return "easy";
 return "cardio";
}
