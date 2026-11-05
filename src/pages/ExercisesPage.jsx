import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, CopyPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { formatDate, weekday } from '../lib/format';
import { sourceLink, sourceTable } from '../lib/programs';

function ExerciseForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [reps, setReps] = useState(initial?.reps ?? '');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    // 횟수·설명은 비워 두면 표시하지 않음
    const ok = await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      reps: reps === '' ? null : Number(reps),
    });
    setSaving(false);
    if (ok && !initial) {
      setName('');
      setDescription('');
      setReps('');
    }
  };

  return (
    <form className="inline-form exercise-form" onSubmit={submit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="훈련 이름 (예: 1:1 수비 연습)" required autoFocus={Boolean(initial)} />
      <input type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="횟수" />
      <span>회</span>
      <textarea
        className="exercise-desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="부가설명 (선택) · 자세, 거리, 주의할 점 등"
        rows={2}
      />
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

// 기본 프로그램 / 일정별 훈련 / 나만의 루틴 편집 (출처는 lib/programs.js 참고)
export default function ExercisesPage({
  me,
  goBack,
  editTarget,
  schedules,
  exercises,
  scheduleExercises,
  personalPrograms,
  personalExercises,
  programFor,
  setTrainingSource,
}) {
  const [editingId, setEditingId] = useState(null);
  const { source } = editTarget;
  const schedule = source.kind === 'schedule' && schedules.rows.find((s) => s.id === source.id);
  const program = source.kind === 'personal' && personalPrograms.rows.find((p) => p.id === source.id);
  const table = sourceTable(source, { exercises, scheduleExercises, personalExercises });
  const items = programFor(source);
  const link = { ...sourceLink(source), ...(source.kind === 'personal' && { user_id: me.id }) };

  const add = (values) => {
    const position = Math.max(0, ...items.map((x) => x.position)) + 1;
    return table.insert({ ...values, position, ...link });
  };

  const copyDefault = () => {
    const start = Math.max(0, ...items.map((x) => x.position));
    return table.insert(
      exercises.rows.map((x, i) => ({ ...link, name: x.name, description: x.description, reps: x.reps, position: start + i + 1 })),
    );
  };

  const renameProgram = () => {
    const title = prompt('루틴 이름', program.title)?.trim();
    if (title) personalPrograms.update(program.id, { title });
  };

  const deleteProgram = async () => {
    if (!confirm(`'${program.title}' 루틴을 삭제할까요? 항목도 함께 삭제돼요. (훈련 기록은 남아요)`)) return;
    if (await personalPrograms.remove(program.id)) {
      await personalExercises.reload();
      setTrainingSource(null);
      goBack();
    }
  };

  const header = {
    default: { eyebrow: 'DEFAULT PROGRAM', title: '기본 훈련 프로그램', sub: '새 일정의 훈련을 짤 때 불러올 수 있는 기본 구성이에요.' },
    schedule: {
      eyebrow: 'SCHEDULE TRAINING',
      title: schedule ? `${schedule.title} 훈련` : '일정 훈련',
      sub: schedule && `${formatDate(schedule.date)} (${weekday(schedule.date)}) · ${schedule.place || '장소 미정'}`,
    },
    personal: { eyebrow: 'MY ROUTINE', title: program?.title ?? '내 훈련', sub: '🔒 나만 볼 수 있는 루틴이에요.' },
  }[source.kind];

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
      <button className="text-btn back" onClick={goBack}>
        <ArrowLeft size={16} /> 돌아가기
      </button>
      <div className="section-title">
        <div>
          <span className="eyebrow dark">{header.eyebrow}</span>
          <h2>{header.title}</h2>
          {header.sub && <p className="sub">{header.sub}</p>}
          {program && (
            <div className="row-actions">
              <button onClick={renameProgram}>
                <Pencil size={13} /> 이름 변경
              </button>
              <button onClick={deleteProgram}>
                <Trash2 size={13} /> 루틴 삭제
              </button>
            </div>
          )}
        </div>
        <span className="pink-tag">
          {items.length}개 항목
        </span>
      </div>

      <div className="training">
        <b className="form-label">새 훈련 항목 추가</b>
        <ExerciseForm submitLabel={<><Plus size={15} /> 추가</>} onSubmit={add} />
        {source.kind !== 'default' && exercises.rows.length > 0 && (
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
              <span className="name exercise-text">
                <b>{x.name}</b>
                {x.description && <span>{x.description}</span>}
              </span>
              {x.reps && <small>{x.reps}회</small>}
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
