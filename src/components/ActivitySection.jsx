import { CalendarDays, Check, Footprints } from 'lucide-react';

export default function ActivitySection({ memberName, past, upcoming, attendances, checked }) {
  const pastIds = new Set(past.map((s) => s.id));
  const attended = attendances.rows.filter(
    (a) => a.member_name === memberName && a.status === '참석' && pastIds.has(a.schedule_id),
  ).length;

  return (
    <section className="section">
      <div className="section-title">
        <div>
          <span className="eyebrow dark">MY ACTIVITY</span>
          <h2>나의 활동</h2>
        </div>
      </div>
      <div className="stats">
        <div>
          <Footprints />
          <b>{attended}회</b>
          <span>참석 완료</span>
        </div>
        <div>
          <CalendarDays />
          <b>{upcoming.length}개</b>
          <span>예정된 일정</span>
        </div>
        <div>
          <Check />
          <b>{checked.length}개</b>
          <span>오늘 체크한 훈련</span>
        </div>
      </div>
    </section>
  );
}
