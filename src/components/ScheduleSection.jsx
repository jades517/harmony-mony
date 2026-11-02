import { useState } from 'react';
import { ArrowRight, Clock3, MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react';
import ScheduleForm from './ScheduleForm';
import { RSVP_OPTIONS } from '../lib/constants';
import { formatDate, formatTimeRange, weekday } from '../lib/format';

export default function ScheduleSection({
  eyebrow = 'UPCOMING SCHEDULE',
  title = '다가오는 일정',
  items,
  limit,
  canAdd = false,
  isPast = false,
  setTab,
  memberName,
  schedules,
  attendances,
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const shown = limit ? items.slice(0, limit) : items;

  const setRsvp = (scheduleId, status) => {
    if (!memberName) {
      alert('먼저 위에서 이름을 입력해 주세요.');
      return;
    }
    attendances.upsert({ schedule_id: scheduleId, member_name: memberName, status }, 'schedule_id,member_name');
  };

  const remove = (s) => {
    if (confirm(`'${s.title}' 일정을 삭제할까요? 참석 정보도 함께 삭제돼요.`)) schedules.remove(s.id);
  };

  return (
    <section className="section">
      <div className="section-title">
        <div>
          <span className="eyebrow dark">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        {limit ? (
          <button className="text-btn" onClick={() => setTab('일정')}>
            전체 보기 <ArrowRight size={16} />
          </button>
        ) : (
          canAdd &&
          !adding && (
            <button className="primary" onClick={() => setAdding(true)}>
              <Plus size={16} /> 일정 추가
            </button>
          )
        )}
      </div>
      {adding && <ScheduleForm onSubmit={schedules.insert} onCancel={() => setAdding(false)} />}
      <div className="schedule-list">
        {schedules.loading && <div className="empty">불러오는 중…</div>}
        {!schedules.loading && shown.length === 0 && (
          <div className="empty">{isPast ? '지난 일정이 없어요.' : '등록된 일정이 없어요.'}</div>
        )}
        {shown.map((s) => {
          if (editingId === s.id) {
            return (
              <ScheduleForm
                key={s.id}
                initial={s}
                onSubmit={(values) => schedules.update(s.id, values)}
                onCancel={() => setEditingId(null)}
              />
            );
          }
          const rows = attendances.rows.filter((a) => a.schedule_id === s.id);
          const going = rows.filter((a) => a.status === '참석').map((a) => a.member_name);
          const mine = rows.find((a) => a.member_name === memberName)?.status;
          return (
            <article className={`schedule${isPast ? ' past' : ''}`} key={s.id}>
              <div className="date">
                <b>{formatDate(s.date)}</b>
                <span>{weekday(s.date)}요일</span>
              </div>
              <div className="schedule-info">
                <h3>{s.title}</h3>
                <p>
                  <Clock3 size={15} />
                  {formatTimeRange(s.start_time, s.end_time)}
                  <MapPin size={15} />
                  {s.place || '장소 미정'}
                </p>
                <small>
                  <Users size={14} />
                  {going.length}명 참석{going.length > 0 && ` · ${going.join(', ')}`}
                </small>
                <div className="row-actions">
                  <button onClick={() => setEditingId(s.id)}>
                    <Pencil size={13} /> 수정
                  </button>
                  <button onClick={() => remove(s)}>
                    <Trash2 size={13} /> 삭제
                  </button>
                </div>
              </div>
              <div className="rsvp">
                <span>내 참석 여부</span>
                <div>
                  {RSVP_OPTIONS.map((v) => (
                    <button className={mine === v ? 'selected' : ''} onClick={() => setRsvp(s.id, v)} key={v}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
