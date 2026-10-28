-- Full journal as foodsport-export-v1 JSON (same shape as the site's «Выгрузить данные»).
-- Replace <OWNER> with the owner's UUID and run via execute_sql; save the `export` value as a .json file.
with o as (select '<OWNER>'::uuid as id)
select json_build_object(
 'format','foodsport-export-v1','exportedAt',now(),
 'account',(select email from auth.users where id=(select id from o)),
 'food',(select coalesce(json_agg(json_build_object('id',id,'date',date,'name',name,'grams',grams,'kcal100',kcal100,'protein100',protein100,'fat100',fat100,'carbs100',carbs100,'createdAt',created_at) order by date,created_at),'[]') from food_entries where user_id=(select id from o)),
 'weights',(select coalesce(json_agg(json_build_object('id',id,'date',date,'value',value) order by date),'[]') from weights where user_id=(select id from o)),
 'trainings',(select coalesce(json_agg(json_build_object('id',id,'date',date,'type',type,'minutes',minutes,'notes',notes,'createdAt',created_at) order by date,created_at),'[]') from trainings where user_id=(select id from o)),
 'reviews',(select coalesce(json_agg(json_build_object('date',date,'status',status,'score',score,'comment',comment,'updatedAt',updated_at) order by date),'[]') from day_reviews where user_id=(select id from o)),
 'plans',(select coalesce(json_agg(json_build_object('id',id,'date',date,'title',title,'done',done) order by date),'[]') from plan_items where user_id=(select id from o)),
 'settings',(select json_build_object('kcalTarget',kcal_target,'proteinMin',protein_min,'proteinMax',protein_max,'weightGoal',weight_goal) from settings where user_id=(select id from o))
) as export;
