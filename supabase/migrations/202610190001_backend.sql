create extension if not exists pgcrypto;

create table if not exists public.events (
 id uuid primary key default gen_random_uuid(), name text not null, status text not null default 'draft' check (status in ('draft','open','closed')),
 allowed_classes text[] not null default array['IXA','IXB','IXC','IXD','IXE','IXF'], attendance_min integer not null default 1 check (attendance_min > 0), attendance_max integer not null default 40 check (attendance_max >= attendance_min),
 created_at timestamptz not null default now(), created_by uuid references auth.users(id)
);
create table if not exists public.participants (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete restrict, full_name text not null check (char_length(full_name) between 1 and 40), display_name text not null, attendance_number integer not null, class_name text not null, entry_token_hash text not null unique, token_expires_at timestamptz not null default (now() + interval '24 hours'), revoked_at timestamptz, status text not null default 'registered' check (status in ('registered','playing_reflex','playing_memory','playing_quiz','completed','disqualified')), created_at timestamptz not null default now(), completed_at timestamptz,
 unique(event_id,class_name,attendance_number), check (attendance_number > 0)
);
create table if not exists public.game_sessions (
 id uuid primary key default gen_random_uuid(), participant_id uuid not null references public.participants(id) on delete cascade, game_key text not null check (game_key in ('reflex','memory','quiz')), status text not null default 'started' check (status in ('started','submitted','validated')), started_at timestamptz not null default now(), completed_at timestamptz, challenge_metadata jsonb not null default '{}', idempotency_key text, unique(participant_id,game_key), unique(idempotency_key)
);
create table if not exists public.game_results (
 id uuid primary key default gen_random_uuid(), participant_id uuid not null references public.participants(id) on delete cascade, game_key text not null check (game_key in ('reflex','memory','quiz')), score integer not null check (score between 0 and 200), accuracy numeric(5,2) not null check (accuracy between 0 and 100), duration_ms integer not null check (duration_ms between 0 and 3600000), metrics jsonb not null default '{}', completed_at timestamptz not null default now(), idempotency_key text not null, payload_hash text not null, unique(participant_id,game_key), unique(idempotency_key)
);
create table if not exists public.quiz_questions (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade, question text not null, options jsonb not null check (jsonb_typeof(options)='array'), correct_option_index integer not null check (correct_option_index >= 0 and correct_option_index < jsonb_array_length(options)), is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.admin_users (id uuid primary key references auth.users(id) on delete cascade, role text not null default 'admin' check (role in ('admin','super_admin')), created_at timestamptz not null default now());
create table if not exists public.competition_settings (
 id uuid primary key default gen_random_uuid(), event_id uuid not null unique references public.events(id) on delete cascade, registration_open boolean not null default false, replay_allowed boolean not null default false, reflex_duration_seconds integer not null default 40 check (reflex_duration_seconds between 1 and 120), reflex_rounds integer not null default 20 check (reflex_rounds between 1 and 20), memory_rounds integer not null default 8 check (memory_rounds between 1 and 8), memory_max_lives integer not null default 3 check (memory_max_lives between 1 and 3), quiz_questions_count integer not null default 10 check (quiz_questions_count between 1 and 20), quiz_time_per_question_seconds integer not null default 10 check (quiz_time_per_question_seconds between 1 and 60), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);
create table if not exists public.admin_activity (id uuid primary key default gen_random_uuid(), admin_id uuid references auth.users(id), action text not null, target_type text, target_id uuid, payload jsonb not null default '{}', created_at timestamptz not null default now());
create index if not exists participants_event_idx on public.participants(event_id); create index if not exists participants_status_idx on public.participants(status); create index if not exists results_participant_idx on public.game_results(participant_id); create index if not exists results_completed_idx on public.game_results(completed_at);

alter table public.events enable row level security; alter table public.participants enable row level security; alter table public.game_sessions enable row level security; alter table public.game_results enable row level security; alter table public.quiz_questions enable row level security; alter table public.admin_users enable row level security; alter table public.competition_settings enable row level security; alter table public.admin_activity enable row level security;
revoke all on all tables in schema public from anon, authenticated;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_users where id=auth.uid()) $$;
revoke all on function public.is_admin() from public; grant execute on function public.is_admin() to authenticated;
create policy events_public_open on public.events for select to anon,authenticated using (status='open');
create policy events_admin on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_users_self on public.admin_users for select to authenticated using (id=auth.uid());
create policy admin_users_admin on public.admin_users for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy settings_admin on public.competition_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy activity_admin on public.admin_activity for select to authenticated using (public.is_admin());
create view public.public_leaderboard with (security_invoker=true) as select row_number() over(order by sum(r.score) desc, avg(r.accuracy) desc, max(r.completed_at) asc, p.id) as rank, p.event_id, p.display_name,p.class_name,sum(r.score)::int total_score,round(avg(r.accuracy),2) average_accuracy,max(r.completed_at) completed_at from public.participants p join public.game_results r on r.participant_id=p.id where p.status='completed' group by p.id having count(distinct r.game_key)=3;

create or replace function public.complete_game(p_participant uuid,p_game text,p_score integer,p_accuracy numeric,p_duration integer,p_metrics jsonb,p_key text,p_hash text) returns public.game_results language plpgsql security definer set search_path=public as $$
declare v public.game_results; s public.game_sessions; begin
 if p_score not between 0 and 200 or p_accuracy not between 0 and 100 or p_duration not between 0 and 3600000 then raise exception 'invalid_result'; end if;
 select * into s from game_sessions where participant_id=p_participant and game_key=p_game for update;
 if not found or s.status <> 'started' then raise exception 'invalid_session'; end if;
  if p_game not in ('reflex','memory','quiz') then raise exception 'invalid_game'; end if;
   if not exists (select 1 from participants where id=p_participant and status = case when p_game='reflex' then 'playing_reflex' when p_game='memory' then 'playing_memory' else 'playing_quiz' end) then raise exception 'invalid_participant_state'; end if;
   if p_game='memory' and not exists (select 1 from game_results where participant_id=p_participant and game_key='reflex') then raise exception 'game_order'; end if;
   if p_game='quiz' and (not exists (select 1 from game_results where participant_id=p_participant and game_key='reflex') or not exists (select 1 from game_results where participant_id=p_participant and game_key='memory')) then raise exception 'game_order'; end if;
  if p_key is null or char_length(p_key) < 16 or char_length(p_key) > 128 then raise exception 'invalid_idempotency_key'; end if;
  if p_hash is null or char_length(p_hash) <> 64 then raise exception 'invalid_payload_hash'; end if;
 if exists(select 1 from game_results where participant_id=p_participant and game_key=p_game) then raise exception 'duplicate_result'; end if;
 insert into game_results(participant_id,game_key,score,accuracy,duration_ms,metrics,idempotency_key,payload_hash) values(p_participant,p_game,p_score,p_accuracy,p_duration,p_metrics,p_key,p_hash) returning * into v;
 update game_sessions set status='validated',completed_at=now() where id=s.id;
 update participants set status=case when p_game='reflex' then 'playing_memory' when p_game='memory' then 'playing_quiz' else 'completed' end, completed_at=case when p_game='quiz' then now() else completed_at end where id=p_participant;
 return v;
end $$;
revoke all on function public.complete_game(uuid,text,integer,numeric,integer,jsonb,text,text) from public;
grant execute on function public.complete_game(uuid,text,integer,numeric,integer,jsonb,text,text) to service_role;
