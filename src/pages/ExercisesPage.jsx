import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';

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

export default function ExercisesPage({ setTab, exercises }) {
  const [editingId, setEditingId] = useState(null);
  const items = exercises.rows;
  const totalMinutes = items.reduce((sum, x) => sum + x.minutes, 0);

  const add = (values) => {
    const position = Math.max(0, ...items.map((x) => x.position)) + 1;
    return exercises.insert({ ...values, position });
  };

  // 바뀐 순서대로 position을 1부터 다시 매김 (값이 겹쳐 있어도 정리됨)
  const move = async (index, dir) => {
    const next = [...items];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    for (const [i, x] of next.entries()) {
      if (x.position !== i + 1) await exercises.update(x.id, { position: i + 1 });
    }
  };

  return (
    <section className="section">
      <button className="text-btn back" onClick={() => setTab('훈련')}>
        <ArrowLeft size={16} /> 훈련으로 돌아가기
      </button>
      <div className="section-title">
        <div>
          <span className="eyebrow dark">TRAINING PROGRAM</span>
          <h2>훈련 프로그램 편집</h2>
        </div>
        <span className="pink-tag">
          {items.length}개 항목 · 총 {totalMinutes}분
        </span>
      </div>

      <div className="training">
        <b className="form-label">새 훈련 항목 추가</b>
        <ExerciseForm submitLabel={<><Plus size={15} /> 추가</>} onSubmit={add} />
      </div>

      <div className="manage-list">
        {exercises.loading && <div className="empty">불러오는 중…</div>}
        {!exercises.loading && items.length === 0 && <div className="empty">훈련 항목이 없어요. 위에서 추가해 주세요.</div>}
        {items.map((x, i) =>
          editingId === x.id ? (
            <div className="manage-row editing" key={x.id}>
              <ExerciseForm
                initial={x}
                submitLabel="저장"
                onSubmit={async (values) => {
                  const ok = await exercises.update(x.id, values);
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
                  onClick={() => confirm(`'${x.name}' 항목을 삭제할까요?`) && exercises.remove(x.id)}
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
