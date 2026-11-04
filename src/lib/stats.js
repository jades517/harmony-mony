import { today } from './format';

const shiftDay = (date, days) => {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE');
};

// 마이 보드 통계 (참석·훈련 기록 기준)
export function myStats({ me, past, attendances, logs }) {
  const now = today();
  const month = now.slice(0, 7);

  // 가입 이후 지난 일정만 참석률 계산에 포함
  const eligible = past.filter((s) => s.date >= me.joinedOn);
  const eligibleIds = new Set(eligible.map((s) => s.id));
  const attended = attendances.rows.filter(
    (a) => a.user_id === me.id && a.status === '참석' && eligibleIds.has(a.schedule_id),
  ).length;

  const myLogs = logs.rows.filter((l) => l.user_id === me.id);
  const monthLogs = myLogs.filter((l) => l.trained_on.startsWith(month));

  // 오늘(또는 어제)부터 거꾸로 하루도 빠짐없이 훈련한 날 수
  const days = new Set(myLogs.map((l) => l.trained_on));
  let cursor = days.has(now) ? now : shiftDay(now, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }

  return {
    attended,
    attendanceRate: eligible.length ? Math.round((attended / eligible.length) * 100) : null,
    monthCount: monthLogs.length,
    monthReps: monthLogs.reduce((sum, l) => sum + l.total_reps, 0),
    totalCount: myLogs.length,
    streak,
  };
}
