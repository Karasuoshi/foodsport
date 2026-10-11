export type FoodEntry={id:string;name:string;grams:number;kcal100:number;protein100:number;fat100:number;carbs100:number;date:string};
export type Macros={kcal:number;protein:number;fat:number;carbs:number};
export function macros(e:FoodEntry):Macros {const factor=e.grams/100;return {kcal:e.kcal100*factor,protein:e.protein100*factor,fat:e.fat100*factor,carbs:e.carbs100*factor}}
export function total(entries:FoodEntry[]):Macros {return entries.reduce((a,e)=>{const m=macros(e);return {kcal:a.kcal+m.kcal,protein:a.protein+m.protein,fat:a.fat+m.fat,carbs:a.carbs+m.carbs}},{kcal:0,protein:0,fat:0,carbs:0})}
export const round=(n:number)=>Math.round(n);
export function localDate(d=new Date()):string {const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,"0");const day=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${day}`;}
export const today=()=>localDate();
export function validFood(e:FoodEntry):boolean {
 return e.name.trim().length>0 && Number.isFinite(e.grams) && e.grams>0 && e.grams<=100000 &&
 [e.kcal100,e.protein100,e.fat100,e.carbs100].every(v=>Number.isFinite(v)&&v>=0&&v<=1000);
}
