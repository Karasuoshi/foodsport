"use client";
import {Dispatch,SetStateAction,useCallback,useEffect,useRef,useState} from 'react';
import {cloudRequest,getSession} from './CloudAccount';
import {Item,tables,cacheKey,conflictQuery,toDb,fromDb,changes} from '../lib/cloud';
// Cloud is authoritative. Legacy local data is retained, never silently uploaded.
export default function useCloudStored<T extends Item>(key:string,initial:T[]):[T[],Dispatch<SetStateAction<T[]>>] {
 const [state,setState]=useState<T[]>([]);
 const current=useRef<T[]>([]), owner=useRef<string|null>(null), ready=useRef(false);
 const queue=useRef(Promise.resolve()), pending=useRef(0), loading=useRef(false), failed=useRef(false), revision=useRef(0);
 const table=tables[key];
 const reload=useCallback(async()=>{
  if(loading.current||pending.current||failed.current)return;
  loading.current=true;
  const version=revision.current;
  try {
   const session=await getSession();
   if(!session){ready.current=false;owner.current=null;current.current=[];setState([]);return;}
   if(owner.current!==session.user.id){owner.current=session.user.id;ready.current=false;current.current=[];setState([]);}
   const user=session.user.id;
   const remote=await cloudRequest(table,'GET',session.access_token,undefined,'?select=*',user);
   if(version!==revision.current||pending.current||owner.current!==user)return;
   const rows=remote.map((x:Record<string,unknown>)=>fromDb(x,table) as T);
   current.current=rows;setState(rows);localStorage.setItem(cacheKey(key,user),JSON.stringify(rows));ready.current=true;
  }catch { /* Keep the last successfully loaded view. Never log journal data or tokens. */ }
  finally {loading.current=false;}
 },[key,table]);
 useEffect(()=>{
  void reload();
  const refresh=()=>{if(document.visibilityState==='visible')void reload();};
  const interval=setInterval(refresh,15000);
  window.addEventListener('foodsport-auth-changed',refresh);window.addEventListener('focus',refresh);window.addEventListener('online',refresh);document.addEventListener('visibilitychange',refresh);
  return()=>{clearInterval(interval);window.removeEventListener('foodsport-auth-changed',refresh);window.removeEventListener('focus',refresh);window.removeEventListener('online',refresh);document.removeEventListener('visibilitychange',refresh);};
 },[reload]);
 const update=useCallback<Dispatch<SetStateAction<T[]>>>((action)=>{
  if(!ready.current||!owner.current||failed.current){window.alert('Дождись загрузки дневника. Если сохранение ранее не удалось, обнови страницу и повтори изменение.');return;}
  const old=current.current,next=typeof action==='function'?(action as (p:T[])=>T[])(old):action;
  const user=owner.current,{changed,removed}=changes(old,next);
  revision.current++;pending.current++;current.current=next;setState(next);
  // Separate recovery copy survives failed writes; reload never treats it as committed.
  localStorage.setItem(cacheKey(key,user)+':unsaved',JSON.stringify(next));
  queue.current=queue.current.then(async()=>{
   if(failed.current)return;
   try {
    const session=await getSession();if(!session||session.user.id!==user)throw Error('Session changed');
    if(changed.length)await cloudRequest(table,'POST',session.access_token,changed.map(x=>toDb(x,table,user)),conflictQuery(table),user);
    for(const id of removed)await cloudRequest(table,'DELETE',session.access_token,undefined,`?${table==='day_reviews'?'date':'id'}=eq.${encodeURIComponent(id)}&user_id=eq.${user}`,user);
    localStorage.setItem(cacheKey(key,user),JSON.stringify(next));
   }catch {failed.current=true;window.alert('Не удалось сохранить в облако. Копия изменений осталась в браузере. Обнови страницу и повтори изменение.');}
  }).finally(()=>{pending.current--;if(!pending.current&&!failed.current){localStorage.removeItem(cacheKey(key,user)+':unsaved');void reload();}});
 },[key,table,reload]);
 return [state,update];
}
