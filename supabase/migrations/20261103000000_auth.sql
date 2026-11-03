-- 로그인(Supabase Auth) 도입
-- · 로그인한 팀원만 데이터를 읽고 쓸 수 있음 (비로그인 anon 접근 차단)
-- · 일정·훈련 프로그램은 팀원 누구나 편집, 참석·훈련 기록은 본인 것만 수정
-- ※ 20261102010000_schedule_trainings.sql 을 먼저 실행한 뒤 실행하세요.

-- 참석·기록에 계정 연결 (member_name은 화면 표시용 이름으로 유지)
alter table public.attendances
  add column user_id uuid default auth.uid() references auth.users (id) on delete cascade;
alter table public.training_logs
  add column user_id uuid default auth.uid() references auth.users (id) on delete cascade;

-- 로그인 이전에 이름만으로 남긴 참석·기록은 주인을 알 수 없어 정리
delete from public.attendances where user_id is null;
delete from public.training_logs where user_id is null;
alter table public.attendances alter column user_id set not null;
alter table public.training_logs alter column user_id set not null;

-- 참석은 이름이 아니라 계정당 일정 하나
alter table public.attendances drop constraint if exists attendances_schedule_id_member_name_key;
alter table public.attendances add constraint attendances_schedule_id_user_id_key unique (schedule_id, user_id);

-- 기존 공개 정책 제거, anon 권한 회수
drop policy if exists "public access" on public.schedules;
drop policy if exists "public access" on public.attendances;
drop policy if exists "public access" on public.exercises;
drop policy if exists "public access" on public.schedule_exercises;
drop policy if exists "public access" on public.training_logs;

revoke all on public.schedules, public.attendances, public.exercises, public.schedule_exercises, public.training_logs from anon;

-- 팀 공용 데이터: 로그인한 팀원 누구나
create policy "members all" on public.schedules for all to authenticated using (true) with check (true);
create policy "members all" on public.exercises for all to authenticated using (true) with check (true);
create policy "members all" on public.schedule_exercises for all to authenticated using (true) with check (true);

-- 개인 데이터: 읽기는 팀원 모두, 쓰기는 본인만
create policy "members read" on public.attendances for select to authenticated using (true);
create policy "own insert" on public.attendances for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own update" on public.attendances for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own delete" on public.attendances for delete to authenticated using (user_id = (select auth.uid()));

create policy "members read" on public.training_logs for select to authenticated using (true);
create policy "own insert" on public.training_logs for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own update" on public.training_logs for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own delete" on public.training_logs for delete to authenticated using (user_id = (select auth.uid()));
