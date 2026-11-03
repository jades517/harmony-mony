import { ArrowRight } from 'lucide-react';
import { formatDate, formatTimeRange, weekday } from '../lib/format';

export default function MyUpcoming({ me, upcoming, attendances, setTab }) {
  const statusOf = (id) => attendances.rows.find((a) => a.schedule_id === id && a.user_id === me.id)?.status;
  const unanswered = upcoming.filter((s) => !statusOf(s.id)).length;

  return (
    <section className="section">
      <div className="section-title">
        <div>
          <span className="eyebrow dark">MY SCHEDULE</span>
          <h2>내 다음 일정</h2>
        </div>
        <button className="text-btn" onClick={() => setTab('일정')}>
          일정 보기 <ArrowRight size={16} />
        </button>
      </div>
      {unanswered > 0 && <div className="demo-note warn">아직 참석 여부를 답하지 않은 일정이 {unanswered}개 있어요.</div>}
      <div className="my-upcoming">
        {upcoming.length === 0 && <div className="empty">예정된 일정이 없어요.</div>}
        {upcoming.slice(0, 5).map((s) => {
          const status = statusOf(s.id);
          return (
            <button key={s.id} className="my-upcoming-row" onClick={() => setTab('일정')}>
              <span className="when">
                {formatDate(s.date)} ({weekday(s.date)})
              </span>
              <span className="what">
                {s.title}
                <small>{formatTimeRange(s.start_time, s.end_time)}</small>
              </span>
              <em className={`status ${status ? `s-${status}` : 'none'}`}>{status ?? '미응답'}</em>
            </button>
          );
        })}
      </div>
    </section>
  );
}
