import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, CopyPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { formatDate, weekday } from '../lib/format';

function ExerciseForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [minutes, setMinutes] = useState(initial?.minutes ?? 10);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const ok = await onSubmit({ name: name.trim(), minutes: Number(minutes) });
    setSaving(false);
    if (ok && !initial) {
      setName('');
      setMinutes(10);
    }
  };

  return (
    <form className="inline-form exercise-form" onSubmit={submit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="훈련 이름 (예: 1:1 수비 연습)" required autoFocus={Boolean(initial)} />
      <input type="number" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} required />
      <span>분</span>
      {onCancel && (
        <button type="button" className="outline" onClick={onCancel}>
          취소
        </button>
      )}
      <button className="primary" type="submit" disabled={saving}>
        {submitLabel}
      </button>
    </form>
  );
}

// 기본 프로그램(exercises) 또는 특정 일정의 훈련(schedule_exercises) 편집
export default function ExercisesPage({ setTab, editTarget, schedules, exercises, scheduleExercises, programFor }) {
  const [editingId, setEditingId] = useState(null);
  const { scheduleId, returnTab } = editTarget;
  const schedule = schedules.rows.find((s) => s.id === scheduleId);
  const table = scheduleId ? scheduleExercises : exercises;
  const items = programFor(scheduleId);
  const totalMinutes = items.reduce((sum, x) => sum + x.minutes, 0);

  const add = (values) => {
    const position = Math.max(0, ...items.map((x) => x.position)) + 1;
    return table.insert({ ...values, position, ...(scheduleId && { schedule_id: scheduleId }) });
  };

  const copyDefault = () => {
    const start = Math.max(0, ...items.map((x) => x.position));
    return scheduleExercises.insert(
      exercises.rows.map((x, i) => ({ schedule_id: scheduleId, name: x.name, minutes: x.minutes, position: start + i + 1 })),
    );
  };

  // 바뀐 순서대로 position을 1부터 다시 매김 (값이 겹쳐 있어도 정리됨)
  const move = async (index, dir) => {
    const next = [...items];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    for (const [i, x] of next.entries()) {
      if (x.position !== i + 1) await table.update(x.id, { position: i + 1 });
    }
  };

  return (
    <section className="section">
      <button className="text-btn back" onClick={() => setTab(returnTab)}>
        <ArrowLeft size={16} /> 돌아가기
      </button>
      <div className="section-title">
        <div>
          <span className="eyebrow dark">{scheduleId ? 'SCHEDULE TRAINING' : 'DEFAULT PROGRAM'}</span>
          <h2>{schedule ? `${schedule.title} 훈련` : scheduleId ? '일정 훈련' : '기본 훈련 프로그램'}</h2>
          {schedule && (
            <p className="sub">
              {formatDate(schedule.date)} ({weekday(schedule.date)}) · {schedule.place || '장소 미정'}
            </p>
          )}
          {!scheduleId && <p className="sub">새 일정의 훈련을 짤 때 불러올 수 있는 기본 구성이에요.</p>}
        </div>
        <span className="pink-tag">
          {items.length}개 항목 · 총 {totalMinutes}분
        </span>
      </div>

      <div className="training">
        <b className="form-label">새 훈련 항목 추가</b>
        <ExerciseForm submitLabel={<><Plus size={15} /> 추가</>} onSubmit={add} />
        {scheduleId && exercises.rows.length > 0 && (
          <button className="text-btn copy-default" onClick={copyDefault}>
            <CopyPlus size={15} /> 기본 프로그램 {exercises.rows.length}개 항목 불러오기
          </button>
        )}
      </div>

      <div className="manage-list">
        {table.loading && <div className="empty">불러오는 중…</div>}
        {!table.loading && items.length === 0 && <div className="empty">훈련 항목이 없어요. 위에서 추가해 주세요.</div>}
        {items.map((x, i) =>
          editingId === x.id ? (
            <div className="manage-row editing" key={x.id}>
              <ExerciseForm
                initial={x}
                submitLabel="저장"
                onSubmit={async (values) => {
                  const ok = await table.update(x.id, values);
                  if (ok) setEditingId(null);
                  return ok;
                }}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="manage-row" key={x.id}>
              <span className="order">{i + 1}</span>
              <span className="name">{x.name}</span>
              <small>{x.minutes}분</small>
              <div className="row-tools">
                <button className="icon-btn" title="위로" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp size={15} />
                </button>
                <button className="icon-btn" title="아래로" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown size={15} />
                </button>
                <button className="icon-btn" title="수정" onClick={() => setEditingId(x.id)}>
                  <Pencil size={15} />
                </button>
                <button
                  className="icon-btn danger"
                  title="삭제"
                  onClick={() => confirm(`'${x.name}' 항목을 삭제할까요?`) && table.remove(x.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
