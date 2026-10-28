"""Build one SQL transaction that loads a foodsport-export-v1 JSON into the journal for OWNER."""
import json,sys
src,owner,goal=sys.argv[1],sys.argv[2],sys.argv[3] if len(sys.argv)>3 else None
d=json.load(open(src))
q=lambda v:"null" if v is None else ("'"+str(v).replace("'","''")+"'" if isinstance(v,str) else str(v))
O=q(owner); out=["begin;"]
for f in d["food"]:
    out.append(f"insert into food_entries (id,user_id,date,name,grams,kcal100,protein100,fat100,carbs100,created_at) values ({q(f['id'])},{O},{q(f['date'])},{q(f['name'])},{f['grams']},{f['kcal100']},{f['protein100']},{f['fat100']},{f['carbs100']},{q(f.get('createdAt'))}) on conflict (id) do nothing;")
for w in d["weights"]:
    out.append(f"insert into weights (id,user_id,date,value) values ({q(w['id'])},{O},{q(w['date'])},{w['value']}) on conflict (id) do nothing;")
for t in d["trainings"]:
    out.append(f"insert into trainings (id,user_id,date,type,minutes,notes,created_at) values ({q(t['id'])},{O},{q(t['date'])},{q(t['type'])},{t['minutes']},{q(t.get('notes',''))},{q(t.get('createdAt'))}) on conflict (id) do nothing;")
for r in d["reviews"]:
    out.append(f"insert into day_reviews (user_id,date,status,score,comment) values ({O},{q(r['date'])},{q(r['status'])},{q(r.get('score'))},{q(r.get('comment'))}) on conflict (user_id,date) do nothing;")
for p in d["plans"]:
    parts=p["id"].split(":")
    if len(parts)!=4 or parts[0]!="workout-plan": continue
    pid=f"workout-plan:{owner}:{parts[2]}:{parts[3]}"
    out.append(f"insert into plan_items (id,user_id,date,title,done) values ({q(pid)},{O},{q(p['date'])},{q(p['title'])},{str(p['done']).lower()}) on conflict (id) do nothing;")
s=d.get("settings") or {}
wg=goal or s.get("weightGoal")
out.append(f"insert into settings (user_id,kcal_target,protein_min,protein_max,weight_goal) values ({O},{q(s.get('kcalTarget'))},{q(s.get('proteinMin'))},{q(s.get('proteinMax'))},{q(wg)}) on conflict (user_id) do nothing;")
out.append("commit;")
out.append("select (select count(*) from food_entries) food,(select count(*) from weights) weights,(select count(*) from trainings) trainings,(select count(*) from day_reviews) reviews,(select count(*) from plan_items) plans,(select count(*) from settings) settings;")
print("\n".join(out))
