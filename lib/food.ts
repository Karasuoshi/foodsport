export type FoodEntry={id:string;name:string;grams:number;kcal100:number;protein100:number;fat100:number;carbs100:number;date:string};
export type Macros={kcal:number;protein:number;fat:number;carbs:number};
export function macros(e:FoodEntry):Macros {const factor=e.grams/100;return {kcal:e.kcal100*factor,protein:e.protein100*factor,fat:e.fat100*factor,carbs:e.carbs100*factor}}
export function total(entries:FoodEntry[]):Macros {return entries.reduce((a,e)=>{const m=macros(e);return {kcal:a.kcal+m.kcal,protein:a.protein+m.protein,fat:a.fat+m.fat,carbs:a.carbs+m.carbs}},{kcal:0,protein:0,fat:0,carbs:0})}
export const round=(n:number)=>Math.round(n);
export const today=()=>new Date().toLocaleDateString("en-CA");
export const exampleWeights=[{date:"2026-06-22",weight:105.0},{date:"2026-09-21",weight:103.8}];
