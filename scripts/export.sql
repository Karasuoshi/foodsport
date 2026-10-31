-- Full journal as foodsport-export-v1 JSON (same shape as the site's «Выгрузить данные»).
-- Run via execute_sql and save the `export` value as a .json file.
select json_build_object(
 'format','foodsport-export-v1','exportedAt',now(),
 'food',(select coalesce(json_agg(json_build_object('id',id,'date',date,'name',name,'grams',grams,'kcal100',kcal100,'protein100',protein100,'fat100',fat100,'carbs100',carbs100,'createdAt',created_at) order by date,created_at,id),'[]') from food_entries),
 'weights',(select coalesce(json_agg(json_build_object('id',id,'date',date,'value',value) order by date),'[]') from weights),
 'trainings',(select coalesce(json_agg(json_build_object('id',id,'date',date,'type',type,'minutes',minutes,'notes',notes,'createdAt',created_at) order by date,created_at,id),'[]') from trainings),
 'reviews',(select coalesce(json_agg(json_build_object('date',date,'status',status,'score',score,'comment',comment,'updatedAt',updated_at) order by date),'[]') from day_reviews),
 'plans',(select coalesce(json_agg(json_build_object('id',id,'date',date,'title',title,'done',done) order by date),'[]') from plan_items),
 'settings',(select json_build_object('kcalTarget',kcal_target,'proteinMin',protein_min,'proteinMax',protein_max,'weightGoal',weight_goal) from settings where id=1)
) as export;
