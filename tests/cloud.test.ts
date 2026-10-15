import test from 'node:test';
import assert from 'node:assert/strict';
import {cacheKey,conflictQuery,toDb,fromDb,changes} from '../lib/cloud';
test('day review preserves score, correction and composite identity',()=>{
 const row={date:'2026-01-01',status:'complete',score:8,comment:'Example',updatedAt:'2026-01-01T20:00:00Z'};
 assert.deepEqual(fromDb(toDb(row,'day_reviews','owner'),'day_reviews'),row);
 assert.equal(conflictQuery('day_reviews'),'?on_conflict=user_id,date');
 const revised={...row,score:7};assert.deepEqual(changes([row],[revised]).changed,[revised]);
});
test('cache and serialized ownership are account-specific',()=>{
 assert.notEqual(cacheKey('food','a'),cacheKey('food','b'));
 assert.equal(toDb({id:'entry',user_id:'attacker'} as any,'food_entries','owner').user_id,'owner');
});
test('only edited rows are sent, leaving changes from another device untouched',()=>{
 const before=[{id:'a',date:'2026-01-01'},{id:'b',date:'2026-01-02'}];
 assert.deepEqual(changes(before,[before[0],{...before[1],date:'2026-01-03'}]),{removed:[],changed:[{id:'b',date:'2026-01-03'}]});
});
