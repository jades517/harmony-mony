import { useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, CopyPlus, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { formatDate, weekday } from '../lib/format';
import { sourceLink, sourceTable } from '../lib/programs';
import { supabase } from '../lib/supabase';

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
  setLeaveGuard,
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
  // 편집 중인 목록. null이면 변경 없음(DB 내용 그대로). '저장'을 눌러야 DB에 반영
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const { source } = editTarget;
  const schedule = source.kind === 'schedule' && schedules.rows.find((s) => s.id === source.id);
  const program = source.kind === 'personal' && personalPrograms.rows.find((p) => p.id === source.id);
  const table = sourceTable(source, { exercises, scheduleExercises, personalExercises });
  const saved = programFor(source);
  const items = draft ?? saved;
  const dirty = draft !== null;
  const link = { ...sourceLink(source), ...(source.kind === 'personal' && { user_id: me.id }) };

  const change = (fn) => setDraft(fn(items));
  const newItem = (values) => ({ id: `new-${crypto.randomUUID()}`, isNew: true, ...values });

  // 저장하지 않은 변경이 있으면 돌아가기·메뉴 이동·뒤로가기 전에 확인, 페이지를 닫으면 브라우저가 경고
  useEffect(() => {
    if (!dirty) return;
    setLeaveGuard(() => confirm('저장하지 않은 변경 사항이 있어요. 저장하지 않고 나갈까요?'));
    const onUnload = (e) => e.preventDefault();
    window.addEventListener('beforeunload', onUnload);
    return () => {
      setLeaveGuard(null);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [dirty]);

  const add = (values) => {
    change((list) => [...list, newItem(values)]);
    return true;
  };

  const copyDefault = () =>
    change((list) => [
      ...list,
      ...exercises.rows.map((x) => newItem({ name: x.name, description: x.description, reps: x.reps })),
    ]);

  const cancel = () => {
    if (!confirm('변경 사항을 모두 취소할까요?')) return;
    setDraft(null);
    setEditingId(null);
    setSaveError('');
  };

  // 초안과 DB 내용을 비교해 삭제·수정·추가를 한 번에 반영
  const save = async () => {
    setSaving(true);
    setSaveError('');
    const q = () => supabase.from(table.name);
    const keep = new Set(items.map((x) => x.id));
    const removed = saved.filter((x) => !keep.has(x.id));
    const fields = (x, i) => ({ name: x.name, description: x.description ?? null, reps: x.reps ?? null, position: i + 1 });
    const updates = items
      .map((x, i) => ({ x, values: fields(x, i) }))
      .filter(({ x, values }) => {
        if (x.isNew) return false;
        const before = saved.find((s) => s.id === x.id);
        return Object.keys(values).some((k) => (before[k] ?? null) !== values[k]);
      });
    const inserts = items.map((x, i) => x.isNew && { ...link, ...fields(x, i) }).filter(Boolean);

    const results = await Promise.all([
      removed.length > 0 && q().delete().in('id', removed.map((x) => x.id)),
      ...updates.map(({ x, values }) => q().update(values).eq('id', x.id)),
      inserts.length > 0 && q().insert(inserts),
    ]);
    const error = results.find((r) => r?.error)?.error;
    await table.reload();
    setSaving(false);
    if (error) {
      setSaveError(`저장 중 오류가 났어요 · ${error.message}`);
      return;
    }
    setDraft(null);
    setEditingId(null);
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
      // 루틴이 없어졌으니 저장 안 한 변경도 묻지 않고 나감
      setLeaveGuard(null);
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

  // 순서는 목록 순서 그대로 저장 시 position 1부터 다시 매김
  const move = (index, dir) =>
    change((list) => {
      const next = [...list];
      [next[index], next[index + dir]] = [next[index + dir], next[index]];
      return next;
    });

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
                submitLabel="적용"
                onSubmit={(values) => {
                  change((list) => list.map((y) => (y.id === x.id ? { ...y, ...values } : y)));
                  setEditingId(null);
                  return true;
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
                  onClick={() => change((list) => list.filter((y) => y.id !== x.id))}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      <div className={`save-bar${dirty ? ' dirty' : ''}`}>
        <span>{saveError || (dirty ? '저장하지 않은 변경 사항이 있어요.' : '변경 사항이 없어요.')}</span>
        <button className="outline" onClick={cancel} disabled={!dirty || saving}>
          변경 취소
        </button>
        <button className="primary" onClick={save} disabled={!dirty || saving}>
          <Save size={15} /> {saving ? '저장 중…' : '저장'}
        </button>
      </div>
    </section>
  );
}
