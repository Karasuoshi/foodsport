"use client";
import {Dispatch,SetStateAction,useCallback,useEffect,useRef,useState} from "react";
import {cloudRequest,getSession} from "./CloudAccount";
type Item={id?:string;date?:string;updatedAt?:string;[key:string]:unknown};
const tables:Record<string,string>={"fs-food-v1":"food_entries","fs-weights-v1":"weights","fs-training-v1":"trainings","fs-day-reviews-v1":"day_reviews","fs-plan-2026-10-12-v1":"plan_items"};
const fields:Record<string,string[]>={food_entries:["id","date","name","grams","kcal100","protein100","fat100","carbs100"],weights:["id","date","value"],trainings:["id","date","type","minutes","notes"],day_reviews:["date","status","updatedAt"],plan_items:["id","date","title","done"]};
const idOf=(x:Item)=>String(x.id??x.date);
const toDb=(x:Item,table:string,user_id:string)=>{const out:Record<string,unknown>={user_id};for(const f of fields[table]){if(x[f]!==undefined)out[f==="updatedAt"?"updated_at":f]=x[f]}return out};
const fromDb=(x:Record<string,unknown>,table:string)=>{const out:Item={};for(const f of fields[table]){const v=x[f==="updatedAt"?"updated_at":f];if(v!==undefined)out[f]=v}return out};
export default function useCloudStored<T extends Item>(key:string,initial:T[]):[T[],Dispatch<SetStateAction<T[]>>]{
 const [state,setState]=useState<T[]>(initial);const current=useRef(state);current.current=state;
 const [ready,setReady]=useState(false);const token=useRef<string|null>(null);const userId=useRef<string|null>(null);
 const table=tables[key];
 const reload=useCallback(async()=>{setReady(false);try{
   const session=await getSession();token.current=session?.access_token??null;userId.current=session?.user.id??null;
   const raw=localStorage.getItem(key);let saved:T[]=initial;
   if(raw){const local=JSON.parse(raw);if(Array.isArray(local)){const m=new Map<string,T>();for(const item of local)m.set(idOf(item),item);for(const item of initial)m.set(idOf(item),item);saved=[...m.values()]}}
   if(!session){setState(saved);current.current=saved;setReady(true);return}
   const remote=await cloudRequest(table,"GET",session.access_token,undefined,"?select=*");
   const marker="fs-cloud-initialized-"+session.user.id+"-"+key;
   let merged:T[];
   if(!localStorage.getItem(marker)){
     const m=new Map<string,T>();for(const item of saved)m.set(idOf(item),item);
     for(const item of remote)m.set(idOf(fromDb(item,table)),fromDb(item,table) as T);
     merged=[...m.values()];
     const existing=new Set(remote.map((x:Record<string,unknown>)=>idOf(x)));
     const missing=merged.filter(x=>!existing.has(idOf(x)));
     if(missing.length)await cloudRequest(table,"POST",session.access_token,missing.map(x=>toDb(x,table,session.user.id)));
     localStorage.setItem(marker,"1");
   }else merged=remote.map((x:Record<string,unknown>)=>fromDb(x,table) as T);
   setState(merged);current.current=merged;localStorage.setItem(key,JSON.stringify(merged));
 }catch(e){console.error("FoodSport sync failed",e);const raw=localStorage.getItem(key);if(raw){try{const parsed=JSON.parse(raw);if(Array.isArray(parsed))setState(parsed)}catch{}}}finally{setReady(true)}},[key,table]);
 useEffect(()=>{void reload();window.addEventListener("foodsport-auth-changed",reload);return()=>window.removeEventListener("foodsport-auth-changed",reload)},[reload]);
 const update=useCallback<Dispatch<SetStateAction<T[]>>>((action)=>{const old=current.current;const next=typeof action==="function"?(action as (p:T[])=>T[])(old):action;current.current=next;setState(next);localStorage.setItem(key,JSON.stringify(next));
   if(!ready||!token.current||!userId.current)return;
   const t=token.current,u=userId.current;const oldIds=new Set(old.map(idOf)),nextIds=new Set(next.map(idOf));
   const removed=[...oldIds].filter(id=>!nextIds.has(id));
   const changed=next.filter(item=>{const prev=old.find(x=>idOf(x)===idOf(item));return !prev||JSON.stringify(prev)!==JSON.stringify(item)});
   void (async()=>{try{if(changed.length)await cloudRequest(table,"POST",t,changed.map(x=>toDb(x,table,u)));for(const id of removed){const col=table==="day_reviews"?"date":"id";await cloudRequest(table,"DELETE",t,undefined,"?"+col+"=eq."+encodeURIComponent(id))}}catch(e){console.error("FoodSport cloud save failed",e);window.alert("Не удалось сохранить изменения в облако. Локальная копия осталась в браузере.")}})();
 },[key,ready,table]);
 return [state,update];
}
