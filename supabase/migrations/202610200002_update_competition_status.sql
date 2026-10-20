create or replace function public.update_competition_status(
  p_event_id uuid,
  p_status text,
  p_registration_open boolean,
  p_admin_id uuid
)
returns table(status text, registration_open boolean, updated_at timestamptz, updated_by uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('draft', 'open', 'closed') then
    raise exception 'invalid_status';
  end if;
  if p_registration_open is distinct from (p_status = 'open') then
    raise exception 'inconsistent_registration_state';
  end if;

  update public.events set status = p_status where id = p_event_id;
  if not found then raise exception 'event_not_found'; end if;

  insert into public.competition_settings (event_id, registration_open, updated_by, updated_at)
  values (p_event_id, p_registration_open, p_admin_id, now())
  on conflict (event_id) do update set
    registration_open = excluded.registration_open,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at;

  return query
    select e.status, s.registration_open, s.updated_at, s.updated_by
    from public.events e
    join public.competition_settings s on s.event_id = e.id
    where e.id = p_event_id;
end;
$$;

revoke all on function public.update_competition_status(uuid, text, boolean, uuid) from public, anon, authenticated;
grant execute on function public.update_competition_status(uuid, text, boolean, uuid) to service_role;
