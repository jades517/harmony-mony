import { Plus, Trash2, X } from 'lucide-react';
import { formatDate, weekday } from '../lib/format';

export default function TrainingLogList({
  me,
  logs,
  schedules,
  personalPrograms,
  personalExercises,
  createPersonalProgram,
  trainingSource,
  setTrainingSource,
  setTab,
}) {
  const mine = logs.rows.filter((l) => l.user_id === me.id);

  const startRoutine = (id) => {
    setTrainingSource({ kind: 'personal', id });
    setTab('훈련');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteRoutine = async (p) => {
    if (!confirm(`'${p.title}' 루틴을 삭제할까요? 항목도 함께 삭제돼요. (훈련 기록은 남아요)`)) return;
    if (await personalPrograms.remove(p.id)) {
      await personalExercises.reload();
      // 훈련 탭에서 이 루틴을 고르고 있었다면 기본값으로
      if (trainingSource.kind === 'personal' && trainingSource.id === p.id) setTrainingSource(null);
    }
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
        <span>내 훈련 루틴</span>
        {personalPrograms.rows.length === 0 && <small>아직 만든 루틴이 없어요. 나만 보는 훈련을 만들어 보세요.</small>}
        {personalPrograms.rows.map((p) => (
          <span className="routine-chip" key={p.id}>
            <button onClick={() => startRoutine(p.id)} title="이 루틴으로 훈련하기">
              {p.title}
            </button>
            <button className="chip-remove" title="루틴 삭제" onClick={() => deleteRoutine(p)}>
              <X size={13} />
            </button>
          </span>
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
                {l.completed}/{l.total} 완료{l.total_reps > 0 && ` · ${l.total_reps}회`}
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
