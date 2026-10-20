create or replace view public.public_leaderboard with (security_invoker=true) as
select
  row_number() over (
    partition by p.event_id
    order by sum(r.score) desc, count(distinct r.game_key) desc,
      avg(r.accuracy) desc, max(r.completed_at) asc, p.id
  ) as rank,
  p.event_id,
  p.display_name,
  p.class_name,
  sum(r.score)::int as total_score,
  round(avg(r.accuracy), 2) as average_accuracy,
  max(r.completed_at) as completed_at,
  count(distinct r.game_key)::int as completed_games,
  (count(distinct r.game_key) = 3) as is_complete
from public.participants p
join public.game_results r on r.participant_id = p.id
group by p.id;

create or replace function public.admin_delete_participants(p_ids uuid[], p_admin uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ids uuid[];
  v_deleted uuid[];
begin
  if p_admin is null or not exists (select 1 from public.admin_users where id = p_admin) then
    raise exception 'unauthorized';
  end if;
  select array_agg(distinct value) into v_ids from unnest(p_ids) as value;
  if v_ids is null or cardinality(v_ids) = 0 then raise exception 'empty_ids'; end if;
  if cardinality(v_ids) > 100 then raise exception 'too_many_ids'; end if;
  with targets as (
    select id, display_name, class_name, attendance_number from public.participants where id = any(v_ids)
  ), logs as (
    insert into public.admin_activity(admin_id, action, target_type, target_id, payload)
    select p_admin, 'delete_participant', 'participant', id,
      jsonb_build_object('display_name', display_name, 'class_name', class_name, 'attendance_number', attendance_number)
    from targets returning target_id
  ), deleted as (
    delete from public.participants where id = any(v_ids) returning id
  ) select array_agg(id) into v_deleted from deleted;
  return jsonb_build_object('deleted', coalesce(v_deleted, array[]::uuid[]));
end;
$$;
revoke all on function public.admin_delete_participants(uuid[], uuid) from public;
grant execute on function public.admin_delete_participants(uuid[], uuid) to service_role;
