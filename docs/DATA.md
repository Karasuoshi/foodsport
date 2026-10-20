# Данные: Supabase

Проект `kzyykhjjpalrhprcttow` (eu-central-1, free tier). Все таблицы лежат в схеме `public`, у каждой строки есть `user_id → auth.users`. RLS пускает пользователя только к его собственным строкам.

## Таблицы
| Таблица | Ключ | Поля | Смысл |
|---|---|---|---|
| `food_entries` | `id` text | `date, name, grams, kcal100, protein100, fat100, carbs100, updated_at` | Одна позиция еды. КБЖУ — **на 100 г**, порция — `grams`. |
| `weights` | `id` text | `date, value` | Вес в кг. Одно измерение на дату. |
| `trainings` | `id` text | `date, type, minutes, notes` | **Выполненная** тренировка. |
| `day_reviews` | `(user_id, date)` | `status ('complete'\|'no-data'), score 1–10, comment, updated_at` | Закрытие дня и его оценка. |
| `plan_items` | `id` text | `date, title, done` | Перенос тренировки на конкретную дату (формат ниже). |

Эту таблицу сверить с базой при первом подключении: схема в репозитории не выгружена полностью. Миграции лежат в `docs/db/`.

## Кто владелец
1. Спроси у владельца почту его аккаунта на сайте, если её нет в приватном контексте.
2. Получи UUID: `select id from auth.users where email = '<почта>'`.
3. Используй этот UUID во всех запросах. Почту и UUID в репозиторий не записывай.

## Как писать
Каждая запись — это транзакция от имени владельца, чтобы работал RLS. Строки из сообщений экранируй (`'` → `''`), сырой текст пользователя в SQL не вставляй.

```sql
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub','<OWNER>','role','authenticated')::text, true);
-- запрос
commit;
```

**Еда** — вставка или исправление той же записи:
```sql
insert into food_entries (id,user_id,date,name,grams,kcal100,protein100,fat100,carbs100)
values ('food-2026-01-01-grechka','<OWNER>','2026-01-01','Гречка отварная',200,110,4,1,21)
on conflict (id) do update set date=excluded.date, name=excluded.name, grams=excluded.grams,
  kcal100=excluded.kcal100, protein100=excluded.protein100, fat100=excluded.fat100,
  carbs100=excluded.carbs100, updated_at=now()
where food_entries.user_id='<OWNER>'
returning *;
```
- ID читаемый и стабильный: `food-<дата>-<короткое-латиницей>`. Если такое блюдо в этот день уже есть, добавь `-2`. При повторной попытке записи используй тот же ID.
- Если известна только КБЖУ всей порции, переведи её на 100 г: значение × 100 / grams.

**Вес:** `weights (id='weight-<дата>', date, value)` с `on conflict (id) do update`.

**Тренировка (факт):** `trainings (id='training-<дата>-<вид>', date, type, minutes, notes)`. `type` — короткое название («Силовая Б», «Плавание»), `notes` — кратко: упражнения, веса, подходы, дистанция, пульс.

**Закрытие и оценка дня:**
```sql
insert into day_reviews (user_id,date,status,score,comment,updated_at)
values ('<OWNER>','2026-01-01','complete',7,'Белка достаточно, мало овощей',now())
on conflict (user_id,date) do update set status=excluded.status, score=excluded.score,
  comment=excluded.comment, updated_at=now()
returning *;
```

**Перенос тренировки:** ID имеет вид `workout-plan:<OWNER>:<дата>:<workoutId|rest>`, где `workoutId` берётся из `lib/workouts.ts` (`a, b, swim, cycle, cardio, run`). На одну дату — одна такая строка: сначала удали прежнюю (`delete … where id like 'workout-plan:<OWNER>:<дата>:%'`), потом вставь новую. `title` — короткая подпись, `done=false`. Такая строка задаёт только план и не создаёт выполненную тренировку.

**Удаление:** `delete from <таблица> where id='<id>' and user_id='<OWNER>' returning id;`

## После записи
Прочитай строку обратно (`returning *` или `select`) и проверь, что она ровно одна и значения совпадают. Сайт подтянет её в течение 15 секунд.

## Безопасность
- Не отключать RLS, не выводить в чат и не коммитить service-role ключи. Publishable-ключ в `lib/supabase.ts` публичный по задумке.
- Обычный путь записи — от роли `authenticated` с UUID владельца. Если нужны права выше, сначала спроси владельца.
