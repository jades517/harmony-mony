import { Plus, Trash2 } from 'lucide-react';
import { formatDate, weekday } from '../lib/format';
import { formatMinutes } from '../lib/stats';

export default function TrainingLogList({
  me,
  logs,
  schedules,
  personalPrograms,
  createPersonalProgram,
  setTrainingSource,
  setTab,
}) {
  const mine = logs.rows.filter((l) => l.user_id === me.id);

  const startRoutine = (id) => {
    setTrainingSource({ kind: 'personal', id });
    setTab('훈련');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="section">
      <div className="section-title">
        <div>
          <span className="eyebrow dark">TRAINING LOG</span>
          <h2>훈련 기록</h2>
        </div>
        <button className="primary soft" onClick={createPersonalProgram}>
          <Plus size={15} /> 내 훈련 만들기
        </button>
      </div>
      <div className="my-routines">
        <span>🔒 내 훈련 루틴</span>
        {personalPrograms.rows.length === 0 && <small>아직 만든 루틴이 없어요. 나만 보는 훈련을 만들어 보세요.</small>}
        {personalPrograms.rows.map((p) => (
          <button key={p.id} onClick={() => startRoutine(p.id)} title="이 루틴으로 훈련하기">
            {p.title}
          </button>
        ))}
      </div>
      <div className="log-list">
        {!logs.loading && mine.length === 0 && (
          <div className="empty">아직 저장한 훈련 기록이 없어요. 훈련 탭에서 기록을 남겨 보세요.</div>
        )}
        {mine.map((l) => (
          <article key={l.id}>
            <div className="date">
              <b>{formatDate(l.trained_on)}</b>
              <span>{weekday(l.trained_on)}요일</span>
            </div>
            <div className="log-info">
              <b>
                {l.completed}/{l.total} 완료 · {formatMinutes(l.duration_seconds)}
              </b>
              {l.schedule_id && (
                <p className="log-schedule">{schedules.rows.find((s) => s.id === l.schedule_id)?.title ?? '삭제된 일정'}</p>
              )}
              {l.is_private && (
                <p className="log-schedule private">
                  🔒 {personalPrograms.rows.find((p) => p.id === l.personal_program_id)?.title ?? '삭제된 루틴'}
                </p>
              )}
              <p>{l.exercise_names.join(', ') || '체크한 항목 없음'}</p>
            </div>
            <button
              className="icon-btn"
              title="삭제"
              onClick={() => confirm('이 기록을 삭제할까요?') && logs.remove(l.id)}
            >
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
