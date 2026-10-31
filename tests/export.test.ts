import {test} from "node:test";
import {strict as assert} from "node:assert";
import {exportFile} from "../lib/export";
import type {Snapshot} from "../lib/cloud";

test("export keeps every table and names the file by date",()=>{
 const snap:Snapshot={food:[{id:"f1",date:"2040-01-01",name:"Тест",grams:100,kcal100:100,protein100:10,fat100:1,carbs100:10}],weights:[{id:"w",date:"2040-01-01",value:80}],trainings:[],reviews:[],plans:[],settings:{kcalTarget:2000},syncedAt:"2040-01-01T10:00:00Z"};
 const f=exportFile(snap,new Date("2040-01-02T08:00:00Z"));
 assert.equal(f.name,"foodsport-2040-01-02.json");
 const body=JSON.parse(f.json);
 assert.equal(body.format,"foodsport-export-v1");
 assert.equal(body.food[0].name,"Тест");
 assert.equal(body.weights[0].value,80);
 assert.equal(body.settings.kcalTarget,2000);
});
