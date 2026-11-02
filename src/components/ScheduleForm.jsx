import { useState } from 'react';
import { today } from '../lib/format';

const EMPTY = { title: '', date: '', start_time: '', end_time: '', place: '' };

export default function ScheduleForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    date: today(),
    ...Object.fromEntries(Object.entries(initial || {}).map(([k, v]) => [k, v ?? ''])),
  }));
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onSubmit({
      title: form.title.trim(),
      date: form.date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      place: form.place.trim() || null,
    });
    setSaving(false);
    if (ok) onCancel();
  };

  return (
    <form className="form-card" onSubmit={submit}>
      <label className="wide">
        제목
        <input value={form.title} onChange={set('title')} placeholder="예: 주말 풋살 기본기 훈련" required />
      </label>
      <label>
        날짜
        <input type="date" value={form.date} onChange={set('date')} required />
      </label>
      <label>
        시작
        <input type="time" value={form.start_time} onChange={set('start_time')} />
      </label>
      <label>
        종료
        <input type="time" value={form.end_time} onChange={set('end_time')} />
      </label>
      <label className="wide">
        장소
        <input value={form.place} onChange={set('place')} placeholder="예: OO 풋살장" />
      </label>
      <div className="form-actions wide">
        <button type="button" className="outline" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? '저장 중…' : initial ? '수정 저장' : '일정 추가'}
        </button>
      </div>
    </form>
  );
}
