# Данные: Supabase

Проект `fmfvrefupuyfbtktxxtl` в организации Karasuoshi (eu-west-1, free tier). Агент работает через коннектор Supabase в Claude (`execute_sql`, `apply_migration`).

**Доступ.** Дневник один, владелец один, входа нет. RLS даёт всем (роли `anon`, `authenticated`) только чтение: сайт открывается по ссылке. Записывает только агент через коннектор (роль `postgres`). Владелец сам решил, что дневник может быть виден по ссылке. Если понадобится дневник для другого человека — отдельный проект Supabase и отдельный адрес сайта, не общие таблицы.

## Таблицы
У всех таблиц есть `updated_at timestamptz default now()`. Полная схема — `docs/db/`. Новая миграция применяется через `apply_migration` и кладётся туда же отдельным файлом.

| Таблица | Ключ | Поля | Смысл |
|---|---|---|---|
| `food_entries` | `id` text | `date, name, grams (>0), kcal100, protein100, fat100, carbs100, created_at` | Одна позиция еды. КБЖУ — **на 100 г**, порция — `grams`. `created_at` задаёт порядок на сайте. |
| `weights` | `id` text, `date` unique | `date, value (>0)` | Вес в кг. Одно измерение на дату. |
| `trainings` | `id` text | `date, type, minutes, notes, created_at` | **Выполненная** тренировка. |
| `day_reviews` | `date` | `status, score 1–10 null, comment null` | Оценка дня. `status` сайт не показывает; ставить `'complete'`. |
| `plan_items` | `id` text | `date, title, done` | Разовый план тренировки или отдыха на дату (формат ниже). |
| `settings` | `id = 1` | `kcal_target, protein_min, protein_max, weight_goal` | Цели владельца, одна строка. На сайте — ориентиры. Менять только с его согласия. |

## Как писать
Строки из сообщений экранируй (`'` → `''`), сырой текст пользователя в SQL не вставляй. Каждая запись заканчивается `returning *`.

**Еда** — вставка или исправление той же записи:
```sql
insert into food_entries (id,date,name,grams,kcal100,protein100,fat100,carbs100,created_at)
values ('food-2026-01-01-grechka','2026-01-01','Гречка отварная',200,110,4,1,21,'2026-01-01 13:00+03')
on conflict (id) do update set date=excluded.date, name=excluded.name, grams=excluded.grams,
  kcal100=excluded.kcal100, protein100=excluded.protein100, fat100=excluded.fat100,
  carbs100=excluded.carbs100, updated_at=now()
returning *;
```
- `created_at` — примерное время приёма пищи: так блюда встают на сайте по порядку. Если неизвестно — не указывать (будет `now()`).
- ID читаемый и стабильный: `food-<дата>-<короткое-латиницей>`. Если такое блюдо в этот день уже есть, добавь `-2`. При повторной попытке записи используй тот же ID.
- Если известна только КБЖУ всей порции, переведи её на 100 г: значение × 100 / grams.

**Вес:** `insert into weights (id,date,value) values ('weight-<дата>','<дата>',<кг>) on conflict (date) do update set value=excluded.value, updated_at=now() returning *;`

**Тренировка (факт):** `trainings (id='training-<дата>-<вид>', date, type, minutes, notes)`. `type` начинается с названия шаблона («Силовая Б», «Плавание»), `notes` — кратко: упражнения, веса, подходы, дистанция, пульс.

**Оценка дня:**
```sql
insert into day_reviews (date,status,score,comment)
values ('2026-01-01','complete',7,'Белка достаточно, мало овощей')
on conflict (date) do update set score=excluded.score, comment=excluded.comment, updated_at=now()
returning *;
```

**План тренировки на дату:** ID `workout-plan:<дата>:<workoutId|rest>`, где `workoutId` из `lib/workouts.ts` (`a, b, swim, cycle, cardio, run`). На дату — одна строка: сначала `delete from plan_items where id like 'workout-plan:<дата>:%'`, потом вставка. `title` — короткая подпись, `done=false`. Это только план, не выполненная тренировка.

**Цели:** `update settings set kcal_target=…, protein_min=…, protein_max=…, weight_goal=…, updated_at=now() where id=1 returning *;`

**Удаление:** `delete from <таблица> where id='<id>' returning id;`

## После записи
Прочитай строку обратно (`returning *` или `select`) и проверь, что она ровно одна и значения совпадают. Сайт подтянет её в течение 15 секунд.

## Резервная копия
- Формат — `foodsport-export-v1`, тот же, что даёт кнопка «Выгрузить данные» на сайте: `{format, exportedAt, food, weights, trainings, reviews, plans, settings}`, поля в camelCase.
- Workflow `Backup FoodSport journal` каждую ночь (00:17 МСК) снимает копию через публичное API (`scripts/backup.mjs`) и хранит её артефактом 90 дней. Вручную: `gh workflow run backup.yml -R Karasuoshi/foodsport`.
- Копию на компьютер владельца (`D:\FoodSport\backups\foodsport-<дата>.json`) агент кладёт раз в неделю (на «итогах недели») и по просьбе «бэкап». Путь зависит от сети сессии:
  1. если из контейнера доступен `*.supabase.co` — `node scripts/backup.mjs <папка>`, затем `device_commit_files`;
  2. если доступно скачивание артефактов GitHub — `gh run download <id> -R Karasuoshi/foodsport -n foodsport-backup -D <папка>`;
  3. иначе — `scripts/export.sql` через `execute_sql`, значение `export` записать в файл (дорого по объёму, только когда нужно).
- В репозиторий копии не попадают.
- Восстановление: `python3 scripts/import_sql.py <файл.json> [цель_веса]` печатает одну транзакцию с `on conflict do nothing`; выполнить её через `execute_sql`.

## Безопасность
- Не давать ролям `anon` и `authenticated` права на запись. После изменений схемы — `get_advisors` (security).
- Не выводить в чат и не коммитить service-role ключи. Publishable-ключ в `lib/supabase.ts` публичный по задумке.
