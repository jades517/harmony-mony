-- 훈련 항목 단위를 분(minutes)에서 횟수(reps)로 변경
-- 기존 값(예: 10분)은 그대로 10회가 됨

alter table public.exercises rename column minutes to reps;
alter table public.schedule_exercises rename column minutes to reps;
alter table public.personal_exercises rename column minutes to reps;

-- 훈련 기록: 체크한 항목의 횟수 합계 (예전 기록은 0, duration_seconds는 남겨 둠)
alter table public.training_logs
  add column total_reps int not null default 0;
