export type Item = {id?: string; date?: string; updatedAt?: string};
export const tables: Record<string,string> = {'fs-food-v1':'food_entries','fs-weights-v1':'weights','fs-training-v1':'trainings','fs-day-reviews-v1':'day_reviews','fs-plan-2026-10-12-v1':'plan_items'};
const fields: Record<string,string[]> = {food_entries:['id','date','name','grams','kcal100','protein100','fat100','carbs100'],weights:['id','date','value'],trainings:['id','date','type','minutes','notes'],day_reviews:['date','status','updatedAt','score','comment'],plan_items:['id','date','title','done']};
export const idOf = (x: Item) => String(x.id ?? x.date);
export const cacheKey = (key:string,user:string) => `fs-cloud-v2:${user}:${key}`;
export const conflictQuery = (table:string) => table === 'day_reviews' ? '?on_conflict=user_id,date' : '?on_conflict=id';
export function toDb(x:Item,table:string,user_id:string) {
 const out:Record<string,unknown>={user_id};
 for(const f of fields[table]) if((x as Record<string,unknown>)[f]!==undefined) out[f==='updatedAt'?'updated_at':f]=(x as Record<string,unknown>)[f];
 return out;
}
export function fromDb(x:Record<string,unknown>,table:string):Item {
 const out:Record<string,unknown>={};
 for(const f of fields[table]) {const v=x[f==='updatedAt'?'updated_at':f];if(v!==undefined)out[f]=v;}
 return out;
}
export function changes<T extends Item>(old:T[],next:T[]) {
 const before=new Map(old.map(x=>[idOf(x),x]));const after=new Set(next.map(idOf));
 return {removed:old.filter(x=>!after.has(idOf(x))).map(idOf),changed:next.filter(x=>JSON.stringify(before.get(idOf(x)))!==JSON.stringify(x))};
}
