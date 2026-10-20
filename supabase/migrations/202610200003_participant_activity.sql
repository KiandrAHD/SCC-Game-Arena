create table if not exists public.participant_activity (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  participant_id uuid references public.participants(id) on delete set null,
  actor_type text not null check (actor_type in ('participant','admin')),
  actor_admin_id uuid references auth.users(id) on delete set null,
  activity_type text not null check (activity_type in ('participant_registered','game_started','game_result_saved','competition_completed','admin_updated_participant','admin_deleted_participant')),
  game_key text check (game_key in ('reflex','memory','quiz')),
  status text,
  device_summary text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists participant_activity_created_idx on public.participant_activity(created_at desc);
create index if not exists participant_activity_participant_idx on public.participant_activity(participant_id);
alter table public.participant_activity enable row level security;
revoke all on public.participant_activity from anon, authenticated;
create policy participant_activity_admin_select on public.participant_activity for select to authenticated using (public.is_admin());
