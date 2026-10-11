export type ExportBundle={schemaVersion:1;exportedAt:string;food:unknown[];weights:unknown[];trainings:unknown[]};
export function buildExport(food:unknown[],weights:unknown[],trainings:unknown[]):ExportBundle {
 return {schemaVersion:1,exportedAt:new Date().toISOString(),food,weights,trainings};
}
export function downloadJSON(filename:string,value:unknown) {
 const blob=new Blob([JSON.stringify(value,null,2)],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}
