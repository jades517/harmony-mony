import { CalendarCheck, Flame, Footprints, Percent, Repeat, Trophy } from 'lucide-react';

export default function MyStats({ stats }) {
  const items = [
    { icon: Footprints, value: `${stats.attended}회`, label: '참석 완료' },
    { icon: Percent, value: stats.attendanceRate === null ? '-' : `${stats.attendanceRate}%`, label: '참석률 (가입 이후)' },
    { icon: Flame, value: `${stats.streak}일`, label: '연속 훈련' },
    { icon: CalendarCheck, value: `${stats.monthCount}회`, label: '이번 달 훈련' },
    { icon: Repeat, value: `${stats.monthReps.toLocaleString()}회`, label: '이번 달 누적 횟수' },
    { icon: Trophy, value: `${stats.totalCount}회`, label: '누적 훈련 기록' },
  ];

  return (
    <section className="section">
      <div className="section-title">
        <div>
          <span className="eyebrow dark">MY STATS</span>
          <h2>나의 활동</h2>
        </div>
      </div>
      <div className="stats">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={label}>
            <Icon />
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
