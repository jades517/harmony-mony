import { useState } from 'react';
import { ClipboardList, Lock, Plus, Settings2 } from 'lucide-react';
import { formatDate, today, weekday } from '../lib/format';
import { canEditSource, parseSourceKey, sourceKey, sourceTable } from '../lib/programs';

const NEW_PROGRAM = '__new__';

export default function TrainingSection({
  me,
  upcoming,
  trainingSource: source,
  setTrainingSource,
  trainingItems: items,
  openProgramEditor,
  createPersonalProgram,
  exercises,
  scheduleExercises,
  personalPrograms,
  personalExercises,
  logs,
  checked,
  toggleExercise,
  clearChecked,
}) {
  const [message, setMessage] = useState('');
  const totalMinutes = items.reduce((sum, x) => sum + x.minutes, 0);
  const loading = sourceTable(source, { exercises, scheduleExercises, personalExercises }).loading;
  const canEdit = canEditSource(source, me);
  const isPersonal = source.kind === 'personal';
  const programTitle = personalPrograms.rows.find((p) => p.id === source.id)?.title;

  const onPick = (e) => {
    if (e.target.value === NEW_PROGRAM) createPersonalProgram();
    else setTrainingSource(parseSourceKey(e.target.value));
  };

  const saveLog = async () => {
    if (checked.length === 0) {
      alert('완료한 훈련을 체크한 뒤 저장해 주세요.');
      return;
    }
    const done = items.filter((x) => checked.includes(x.id));
    const ok = await logs.insert({
      user_id: me.id,
      member_name: me.name,
      schedule_id: source.kind === 'schedule' ? source.id : null,
      personal_program_id: isPersonal ? source.id : null,
      is_private: isPersonal,
      trained_on: today(),
      completed: done.length,
      total: items.length,
      // 타이머 대신 체크한 항목의 시간 합계
      duration_seconds: done.reduce((sum, x) => sum + x.minutes, 0) * 60,
      exercise_names: done.map((x) => x.name),
    });
    if (ok) {
      clearChecked();
      setMessage('오늘의 훈련을 기록했어요!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const editLabel = { default: '기본 프로그램 편집', schedule: '이 일정 훈련 짜기', personal: '내 루틴 편집' }[source.kind];

  return (
    <section className="section">
      <div className="section-title">
        <div>
          <span className="eyebrow dark">{isPersonal ? 'MY ROUTINE' : 'TRAINING PROGRAM'}</span>
          <h2>{isPersonal ? `${programTitle ?? '내 훈련'} · ${totalMinutes}분` : `${totalMinutes}분 훈련`}</h2>
        </div>
        <div className="title-actions">
          {canEdit && (
            <button className="text-btn" onClick={() => openProgramEditor(source)}>
              <Settings2 size={16} /> {editLabel}
            </button>
          )}
          <button className="primary soft" onClick={createPersonalProgram}>
            <Plus size={15} /> 내 훈련 만들기
          </button>
        </div>
      </div>
      <div className="training">
        <label className="schedule-picker">
          {isPersonal ? <Lock size={16} /> : <ClipboardList size={16} />}
          <select value={sourceKey(source)} onChange={onPick}>
            <optgroup label="팀 훈련">
              {upcoming.map((s) => (
                <option key={s.id} value={sourceKey({ kind: 'schedule', id: s.id })}>
                  {formatDate(s.date)} ({weekday(s.date)}) {s.title}
                </option>
              ))}
              <option value="default">기본 프로그램</option>
            </optgroup>
            <optgroup label="내 훈련 (나만 보기)">
              {personalPrograms.rows.map((p) => (
                <option key={p.id} value={sourceKey({ kind: 'personal', id: p.id })}>
                  🔒 {p.title}
                </option>
              ))}
              <option value={NEW_PROGRAM}>＋ 새 내 훈련 만들기</option>
            </optgroup>
          </select>
        </label>
        <div className="training-head">
          <div>
            <b>오늘의 훈련 체크리스트</b>
            <p>{isPersonal ? '나만 보는 루틴이에요. 기록도 나만 볼 수 있어요.' : '기본기를 하나씩 쌓아가요!'}</p>
          </div>
          <div className="progress">
            <b>
              {checked.length}/{items.length}
            </b>
            <span>완료</span>
          </div>
        </div>
        <div className="bar">
          <div style={{ width: `${items.length ? (checked.length / items.length) * 100 : 0}%` }} />
        </div>
        {loading && <div className="empty">불러오는 중…</div>}
        {!loading && items.length === 0 && (
          <div className="empty">
            {{ default: '기본 프로그램에 항목이 없어요. ', schedule: '이 일정에는 아직 훈련이 없어요. ', personal: '루틴에 항목이 없어요. ' }[source.kind]}
            {canEdit ? (
              <button className="text-btn inline" onClick={() => openProgramEditor(source)}>
                훈련 짜러 가기
              </button>
            ) : (
              '운영진이 준비 중이에요.'
            )}
          </div>
        )}
        <div className="exercise-list">
          {items.map((x) => (
            <label className="exercise-row" key={x.id}>
              <input type="checkbox" checked={checked.includes(x.id)} onChange={() => toggleExercise(x.id)} />
              <span>{x.name}</span>
              <small>{x.minutes}분</small>
            </label>
          ))}
        </div>
        <div className="save-log">
          {message && <span>{message}</span>}
          <button className="primary" onClick={saveLog}>
            오늘 훈련 기록 저장
          </button>
        </div>
      </div>
    </section>
  );
}
