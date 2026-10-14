-- RescueKit / Taskly — tasks table with Row Level Security
--
-- DEMO NOTE: this demo has no login wall so visitors can try it instantly.
-- RLS is ON and enforced, scoped to the demo identity ('demo-user-001').
-- PRODUCTION: wire up Supabase Auth and replace 'demo-user-001' below with
-- (auth.uid()::text). See docs/RESCUE-REPORT.md #2 and #3.

create table if not exists public.rk_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null default 'demo-user-001',
  title text not null check (char_length(title) between 1 and 200),
  done boolean not null default false,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

alter table public.rk_tasks enable row level security;

-- One policy: the demo identity can do everything, but ONLY on its own rows.
-- There is deliberately no policy that allows touching other owners' rows.
drop policy if exists "rk_tasks_demo_owner" on public.rk_tasks;
create policy "rk_tasks_demo_owner"
  on public.rk_tasks
  for all
  to anon, authenticated
  using (owner_id = 'demo-user-001')
  with check (owner_id = 'demo-user-001');

create index if not exists rk_tasks_owner_created_idx
  on public.rk_tasks (owner_id, created_at desc);

-- Seed a few tasks so the live demo is useful on first visit.
insert into public.rk_tasks (owner_id, title, done, priority)
select 'demo-user-001', t.title, t.done, t.priority
from (values
  ('Read the rescue report', false, 'high'),
  ('Review pull request #42', false, 'high'),
  ('Fix the login redirect bug', false, 'medium'),
  ('Write release notes for v1.2', true, 'medium'),
  ('Update the onboarding docs', false, 'low'),
  ('Water the office plants', true, 'low')
) as t(title, done, priority)
where not exists (
  select 1 from public.rk_tasks where owner_id = 'demo-user-001'
);
