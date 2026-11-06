import { ClipboardList, Clock3, MapPin, Users } from 'lucide-react';
import { RSVP_LABELS, RSVP_OPTIONS } from '../lib/constants';
import { formatDate, formatTimeRange, weekday } from '../lib/format';

// 일정 상세 페이지: 일정 정보 + 참석 현황 + 이 일정에 짜인 훈련 목록
export default function ScheduleDetailPage({
  detailTarget,
  schedules,
  attendances,
  programFor,
  setTrainingSource,
  setTab,
}) {
  const s = schedules.rows.find((x) => x.id === detailTarget.id);
  if (schedules.loading) return <div className="empty">불러오는 중…</div>;
  if (!s) return <div className="empty">삭제되었거나 찾을 수 없는 일정이에요.</div>;

  const items = programFor({ kind: 'schedule', id: s.id });
  const votes = attendances.rows.filter((a) => a.schedule_id === s.id);

  const startTraining = () => {
    setTrainingSource({ kind: 'schedule', id: s.id });
    setTab('훈련');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="section schedule-detail">
      <span className="eyebrow dark">
        {formatDate(s.date)} ({weekday(s.date)})
      </span>
      <h3>{s.title}</h3>
      <p>
        <MapPin size={15} /> {s.place || '장소 미정'}
      </p>
      <p>
        <Clock3 size={15} /> {formatTimeRange(s.start_time, s.end_time)}
      </p>

      <b className="detail-label">
        <Users size={15} /> 참석 현황
      </b>
      <div className="vote-summary">
        {RSVP_OPTIONS.map((v) => {
          const names = votes.filter((a) => a.status === v).map((a) => a.member_name);
          return (
            <div key={v} className={`s-${v}`}>
              <span className="vote-summary-head">
                {RSVP_LABELS[v]} <b>{names.length}</b>
              </span>
              <span className="vote-summary-names">{names.length ? names.join(', ') : '-'}</span>
            </div>
          );
        })}
      </div>

      <b className="detail-label">
        <ClipboardList size={15} /> 훈련 {items.length}개
      </b>
      {items.length === 0 ? (
        <div className="empty">아직 짜인 훈련이 없어요.</div>
      ) : (
        <ol className="detail-list">
          {items.map((x) => (
            <li key={x.id}>
              <span className="exercise-text">
                <b>{x.name}</b>
                {x.description && <span>{x.description}</span>}
              </span>
              {x.reps && <small>{x.reps}회</small>}
            </li>
          ))}
        </ol>
      )}
      {items.length > 0 && (
        <button className="primary detail-start" onClick={startTraining}>
          이 훈련으로 체크리스트 열기
        </button>
      )}
    </section>
  );
}
