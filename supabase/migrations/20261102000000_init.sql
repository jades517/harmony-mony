-- 하모니모니 초기 스키마: 일정, 참석, 훈련 프로그램, 훈련 기록
-- 로그인 도입 전이라 member_name(이름)으로 사용자를 구분합니다.

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  start_time time,
  end_time time,
  place text,
  created_at timestamptz not null default now()
);

create table public.attendances (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  member_name text not null,
  status text not null check (status in ('참석', '불참', '미정')),
  created_at timestamptz not null default now(),
  unique (schedule_id, member_name)
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  minutes int not null default 10 check (minutes > 0),
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.training_logs (
  id uuid primary key default gen_random_uuid(),
  member_name text not null,
  trained_on date not null default current_date,
  completed int not null default 0,
  total int not null default 0,
  duration_seconds int not null default 0,
  exercise_names text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 로그인 전 단계: publishable(anon) 키로 누구나 읽고 쓸 수 있음.
-- Supabase Auth 도입 시 아래 정책을 사용자별 정책으로 교체해야 합니다.
alter table public.schedules enable row level security;
alter table public.attendances enable row level security;
alter table public.exercises enable row level security;
alter table public.training_logs enable row level security;

create policy "public access" on public.schedules for all to anon, authenticated using (true) with check (true);
create policy "public access" on public.attendances for all to anon, authenticated using (true) with check (true);
create policy "public access" on public.exercises for all to anon, authenticated using (true) with check (true);
create policy "public access" on public.training_logs for all to anon, authenticated using (true) with check (true);

-- 새 테이블을 Data API에 자동 노출하지 않는 프로젝트 설정에서도 동작하도록 명시적으로 권한 부여
grant select, insert, update, delete
  on public.schedules, public.attendances, public.exercises, public.training_logs
  to anon, authenticated;

-- 기본 90분 훈련 프로그램
insert into public.exercises (name, minutes, position) values
  ('워밍업 · 가벼운 조깅', 10, 1),
  ('콘 드리블 · 방향 전환', 20, 2),
  ('패스 & 퍼스트 터치', 25, 3),
  ('턴 & 슈팅', 25, 4),
  ('쿨다운', 10, 5);
