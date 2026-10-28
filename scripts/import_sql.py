"""Print one SQL transaction that loads a foodsport-export-v1 JSON into the journal.

Usage: python3 scripts/import_sql.py <export.json> [weight_goal]
Existing rows are kept (on conflict do nothing). Run the output via the Supabase connector (execute_sql).
"""
import json, sys

src = sys.argv[1]
goal = sys.argv[2] if len(sys.argv) > 2 else None
d = json.load(open(src, encoding="utf-8"))


def q(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


out = ["begin;"]
for f in d.get("food", []):
    out.append("insert into food_entries (id,date,name,grams,kcal100,protein100,fat100,carbs100,created_at) values "
               f"({q(f['id'])},{q(f['date'])},{q(f['name'])},{q(f['grams'])},{q(f['kcal100'])},{q(f['protein100'])},{q(f['fat100'])},{q(f['carbs100'])},coalesce({q(f.get('createdAt'))}::timestamptz,now())) on conflict (id) do nothing;")
for w in d.get("weights", []):
    out.append(f"insert into weights (id,date,value) values ({q(w['id'])},{q(w['date'])},{q(w['value'])}) on conflict do nothing;")
for t in d.get("trainings", []):
    out.append("insert into trainings (id,date,type,minutes,notes,created_at) values "
               f"({q(t['id'])},{q(t['date'])},{q(t['type'])},{q(t['minutes'])},{q(t.get('notes') or '')},coalesce({q(t.get('createdAt'))}::timestamptz,now())) on conflict (id) do nothing;")
for r in d.get("reviews", []):
    out.append(f"insert into day_reviews (date,status,score,comment) values ({q(r['date'])},{q(r.get('status') or 'complete')},{q(r.get('score'))},{q(r.get('comment'))}) on conflict (date) do nothing;")
for p in d.get("plans", []):
    parts = p["id"].split(":")
    # Old ids carried an owner segment: workout-plan:<owner>:<date>:<id>. Current: workout-plan:<date>:<id>.
    if parts[0] != "workout-plan" or len(parts) not in (3, 4):
        continue
    day, wid = parts[-2], parts[-1]
    out.append(f"insert into plan_items (id,date,title,done) values ({q(f'workout-plan:{day}:{wid}')},{q(p['date'])},{q(p['title'])},{q(bool(p['done']))}) on conflict (id) do nothing;")
s = d.get("settings") or {}
out.append("insert into settings (id,kcal_target,protein_min,protein_max,weight_goal) values "
           f"(1,{q(s.get('kcalTarget'))},{q(s.get('proteinMin'))},{q(s.get('proteinMax'))},{q(float(goal) if goal else s.get('weightGoal'))}) on conflict (id) do nothing;")
out.append("commit;")
print("\n".join(out))
