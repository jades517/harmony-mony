-- 회원 권한(회원 / 운영진) + 마이 보드용 개인 목표·메모
-- · 일정·훈련 프로그램: 읽기는 회원 모두, 등록·수정·삭제는 운영진만
-- · 권한 변경은 운영진만 (set_member_role 함수), 마지막 운영진은 내릴 수 없음
-- · 가장 먼저 가입한 계정이 첫 운영진이 됨

-- ── 프로필 ──
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

-- 가입 시 프로필 자동 생성
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 이미 가입한 계정 채우기 + 첫 가입자를 운영진으로
insert into public.profiles (id, name, created_at)
select id, coalesce(raw_user_meta_data ->> 'name', split_part(email, '@', 1)), created_at
from auth.users
on conflict (id) do nothing;

update public.profiles set role = 'admin'
where id = (select id from auth.users order by created_at limit 1);

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create function public.set_member_role(target uuid, new_role text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception '운영진만 권한을 바꿀 수 있어요.';
  end if;
  if new_role not in ('member', 'admin') then
    raise exception '잘못된 권한이에요.';
  end if;
  if new_role = 'member'
     and (select count(*) from public.profiles where role = 'admin' and id <> target) = 0 then
    raise exception '운영진이 최소 한 명은 있어야 해요.';
  end if;
  update public.profiles set role = new_role where id = target;
end;
$$;

alter table public.profiles enable row level security;
create policy "members read" on public.profiles for select to authenticated using (true);
create policy "own update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- 본인은 이름만 바꿀 수 있음 (role은 set_member_role 로만)
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name) on public.profiles to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_member_role(uuid, text) from public, anon;
grant execute on function public.set_member_role(uuid, text) to authenticated;

-- ── 일정·훈련 프로그램: 쓰기는 운영진만 ──
drop policy if exists "members all" on public.schedules;
drop policy if exists "members all" on public.exercises;
drop policy if exists "members all" on public.schedule_exercises;

create policy "members read" on public.schedules for select to authenticated using (true);
create policy "admin insert" on public.schedules for insert to authenticated with check ((select public.is_admin()));
create policy "admin update" on public.schedules for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin delete" on public.schedules for delete to authenticated using ((select public.is_admin()));

create policy "members read" on public.exercises for select to authenticated using (true);
create policy "admin insert" on public.exercises for insert to authenticated with check ((select public.is_admin()));
create policy "admin update" on public.exercises for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin delete" on public.exercises for delete to authenticated using ((select public.is_admin()));

create policy "members read" on public.schedule_exercises for select to authenticated using (true);
create policy "admin insert" on public.schedule_exercises for insert to authenticated with check ((select public.is_admin()));
create policy "admin update" on public.schedule_exercises for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin delete" on public.schedule_exercises for delete to authenticated using ((select public.is_admin()));

-- ── 마이 보드: 개인 목표·메모 (본인만 읽고 씀) ──
create table public.personal_notes (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  monthly_goal int check (monthly_goal between 1 and 100),
  memo text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.personal_notes enable row level security;
create policy "own all" on public.personal_notes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on public.personal_notes from anon;
grant select, insert, update, delete on public.personal_notes to authenticated;
