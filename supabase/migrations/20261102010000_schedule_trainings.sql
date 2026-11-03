-- 일정별 훈련 프로그램: 일정마다 자체 훈련 항목 목록을 가짐
-- (exercises 테이블은 '기본 프로그램'으로, 일정에 복사해서 사용)

create table public.schedule_exercises (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  name text not null,
  minutes int not null default 10 check (minutes > 0),
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index schedule_exercises_schedule_idx on public.schedule_exercises (schedule_id, position);

-- 훈련 기록이 어느 일정의 훈련이었는지 (일정 삭제 시 기록은 남기고 연결만 해제)
alter table public.training_logs
  add column schedule_id uuid references public.schedules (id) on delete set null;

alter table public.schedule_exercises enable row level security;
create policy "public access" on public.schedule_exercises for all to anon, authenticated using (true) with check (true);
grant select, insert, update, delete on public.schedule_exercises to anon, authenticated;
