-- 나만의 훈련 루틴: 회원 누구나 만들 수 있고 본인만 볼 수 있음
-- 내 루틴으로 남긴 훈련 기록(is_private)도 본인만 볼 수 있음

create table public.personal_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table public.personal_exercises (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.personal_programs (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  minutes int not null default 10 check (minutes > 0),
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index personal_exercises_program_idx on public.personal_exercises (program_id, position);

alter table public.personal_programs enable row level security;
alter table public.personal_exercises enable row level security;

create policy "own all" on public.personal_programs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- 항목은 본인 소유 루틴에만 추가 가능
create policy "own all" on public.personal_exercises for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.personal_programs p where p.id = program_id and p.user_id = (select auth.uid()))
  );

revoke all on public.personal_programs, public.personal_exercises from anon;
grant select, insert, update, delete on public.personal_programs, public.personal_exercises to authenticated;

-- 훈련 기록: 어떤 내 루틴이었는지 + 비공개 여부
alter table public.training_logs
  add column personal_program_id uuid references public.personal_programs (id) on delete set null,
  add column is_private boolean not null default false;

drop policy if exists "members read" on public.training_logs;
create policy "members read" on public.training_logs for select to authenticated
  using (not is_private or user_id = (select auth.uid()));
