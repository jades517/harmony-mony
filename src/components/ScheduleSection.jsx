import { useState } from 'react';
import { ArrowRight, ClipboardList, Clock3, MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react';
import ScheduleForm from './ScheduleForm';
import { RSVP_LABELS, RSVP_OPTIONS } from '../lib/constants';
import { formatDate, formatTimeRange, weekday } from '../lib/format';

// 홈 카드에 이름을 보여줄 최대 인원 (나머지는 +N, 전체는 상세 창에서)
const MAX_NAMES = 6;

export default function ScheduleSection({
  eyebrow = 'UPCOMING SCHEDULE',
  title = '다가오는 일정',
  items,
  limit,
  compact = false,
  canAdd = false,
  isPast = false,
  setTab,
  me,
  schedules,
  attendances,
  programFor,
  openProgramEditor,
  openScheduleDetail,
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [votingId, setVotingId] = useState(null);
  const shown = limit ? items.slice(0, limit) : items;

  const setRsvp = (scheduleId, status) =>
    attendances.upsert(
      { schedule_id: scheduleId, user_id: me.id, member_name: me.name, status },
      'schedule_id,user_id',
    );

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
          me.isAdmin &&
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
          const mine = rows.find((a) => a.user_id === me.id)?.status;
          const program = programFor({ kind: 'schedule', id: s.id });
          // 홈: 날짜·제목·장소·시간과 내 투표 결과만 보여주는 간단한 카드
          if (compact) {
            const voting = votingId === s.id;
            return (
              <article className="schedule-card clickable" key={s.id} onClick={() => openScheduleDetail(s.id)}>
                <div className="date">
                  <b>{formatDate(s.date)}</b>
                  <span>{weekday(s.date)}요일</span>
                </div>
                <div className="schedule-card-info">
                  <h3>{s.title}</h3>
                  <p>
                    <MapPin size={16} /> {s.place || '장소 미정'}
                  </p>
                  <p>
                    <Clock3 size={16} /> {formatTimeRange(s.start_time, s.end_time)}
                  </p>
                  <div className="attendees">
                    <Users size={16} />
                    {going.length === 0 ? (
                      <span className="none">아직 참석자가 없어요</span>
                    ) : (
                      <>
                        <b>{going.length}명</b>
                        {going.slice(0, MAX_NAMES).map((name, i) => (
                          <span className="name-chip" key={`${name}-${i}`}>
                            {name}
                          </span>
                        ))}
                        {going.length > MAX_NAMES && <span className="more">+{going.length - MAX_NAMES}</span>}
                      </>
                    )}
                  </div>
                  {voting && (
                    <div className="vote-options" onClick={(e) => e.stopPropagation()}>
                      {RSVP_OPTIONS.map((v) => (
                        <button
                          key={v}
                          className={`s-${v}${mine === v ? ' selected' : ''}`}
                          onClick={async () => {
                            await setRsvp(s.id, v);
                            setVotingId(null);
                          }}
                        >
                          {RSVP_LABELS[v]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className={`vote-pill ${mine ? `s-${mine}` : 'empty'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setVotingId(voting ? null : s.id);
                  }}
                  title={mine ? '눌러서 투표 변경' : undefined}
                >
                  {voting ? '닫기' : mine ? RSVP_LABELS[mine] : '투표하기'}
                </button>
              </article>
            );
          }
          return (
            <article className={`schedule clickable${isPast ? ' past' : ''}`} key={s.id} onClick={() => openScheduleDetail(s.id)}>
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
                <small>
                  <ClipboardList size={14} />
                  {program.length > 0
                    ? `훈련 ${program.length}개`
                    : '훈련 미정'}
                </small>
                {me.isAdmin && (
                  <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openProgramEditor({ kind: 'schedule', id: s.id })}>
                      <ClipboardList size={13} /> 훈련 짜기
                    </button>
                    <button onClick={() => setEditingId(s.id)}>
                      <Pencil size={13} /> 수정
                    </button>
                    <button onClick={() => remove(s)}>
                      <Trash2 size={13} /> 삭제
                    </button>
                  </div>
                )}
              </div>
              <div className="rsvp" onClick={(e) => e.stopPropagation()}>
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
