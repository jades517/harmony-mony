import { useState } from 'react';
import { ClipboardList, Settings2, Timer } from 'lucide-react';
import { formatDate, today, weekday } from '../lib/format';

export default function TrainingSection({
  memberName,
  upcoming,
  trainingScheduleId,
  setTrainingScheduleId,
  trainingItems: items,
  openProgramEditor,
  scheduleExercises,
  exercises,
  logs,
  checked,
  toggleExercise,
  clearChecked,
  timer,
}) {
  const [message, setMessage] = useState('');
  const totalMinutes = items.reduce((sum, x) => sum + x.minutes, 0);
  const loading = trainingScheduleId ? scheduleExercises.loading : exercises.loading;

  const saveLog = async () => {
    if (!memberName) {
      alert('먼저 위에서 이름을 입력해 주세요.');
      return;
    }
    if (checked.length === 0 && timer.seconds === 0) {
      alert('완료한 훈련을 체크하거나 타이머를 사용한 뒤 저장해 주세요.');
      return;
    }
    const ok = await logs.insert({
      member_name: memberName,
      schedule_id: trainingScheduleId,
      trained_on: today(),
      completed: checked.length,
      total: items.length,
      duration_seconds: timer.seconds,
      exercise_names: items.filter((x) => checked.includes(x.id)).map((x) => x.name),
    });
    if (ok) {
      clearChecked();
      timer.reset();
      setMessage('오늘의 훈련을 기록했어요!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <section className="section">
      <div className="section-title">
        <div>
          <span className="eyebrow dark">TRAINING PROGRAM</span>
          <h2>{totalMinutes}분 훈련</h2>
        </div>
        <button className="text-btn" onClick={() => openProgramEditor(trainingScheduleId)}>
          <Settings2 size={16} /> {trainingScheduleId ? '이 일정 훈련 짜기' : '기본 프로그램 편집'}
        </button>
      </div>
      <div className="training">
        <label className="schedule-picker">
          <ClipboardList size={16} />
          <select
            value={trainingScheduleId ?? ''}
            onChange={(e) => setTrainingScheduleId(e.target.value || null)}
          >
            {upcoming.map((s) => (
              <option key={s.id} value={s.id}>
                {formatDate(s.date)} ({weekday(s.date)}) {s.title}
              </option>
            ))}
            <option value="">기본 프로그램 (일정 없이 개인 훈련)</option>
          </select>
        </label>
        <div className="training-head">
          <div>
            <b>오늘의 훈련 체크리스트</b>
            <p>기본기를 하나씩 쌓아가요!</p>
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
            {trainingScheduleId ? '이 일정에는 아직 훈련이 없어요. ' : '기본 프로그램에 항목이 없어요. '}
            <button className="text-btn inline" onClick={() => openProgramEditor(trainingScheduleId)}>
              훈련 짜러 가기
            </button>
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
        <div className="timer">
          <Timer size={19} />
          <b>{timer.display}</b>
          <button onClick={timer.toggle}>{timer.running ? '일시정지' : '타이머 시작'}</button>
          <button className="reset" onClick={timer.reset}>
            초기화
          </button>
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
