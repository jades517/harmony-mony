import { useState } from 'react';
import { Lock } from 'lucide-react';

// 개인 목표·메모 — personal_notes, 본인만 읽고 쓸 수 있음(RLS)
export default function MyNotes({ me, notes, stats }) {
  const saved = notes.rows.find((n) => n.user_id === me.id);
  const [goal, setGoal] = useState(saved?.monthly_goal ?? '');
  const [memo, setMemo] = useState(saved?.memo ?? '');
  const [message, setMessage] = useState('');

  // 처음 렌더 때 아직 불러오기 전이었다면, 불러온 값으로 채움
  const [synced, setSynced] = useState(Boolean(saved));
  if (!synced && saved) {
    setSynced(true);
    setGoal(saved.monthly_goal ?? '');
    setMemo(saved.memo ?? '');
  }

  const target = Number(saved?.monthly_goal) || 0;
  const percent = target ? Math.min(100, Math.round((stats.monthCount / target) * 100)) : 0;

  const save = async (e) => {
    e.preventDefault();
    const ok = await notes.upsert(
      { user_id: me.id, monthly_goal: goal ? Number(goal) : null, memo, updated_at: new Date().toISOString() },
      'user_id',
    );
    if (ok) {
      setMessage('저장했어요!');
      setTimeout(() => setMessage(''), 2500);
    }
  };

  return (
    <section className="section">
      <div className="section-title">
        <div>
          <span className="eyebrow dark">MY GOAL</span>
          <h2>목표 & 메모</h2>
        </div>
        <span className="pink-tag">
          <Lock size={11} /> 나만 볼 수 있어요
        </span>
      </div>
      <form className="training my-notes" onSubmit={save}>
        <div className="goal-head">
          <b>이번 달 훈련 목표</b>
          {target ? (
            <span>
              {stats.monthCount} / {target}회 · {percent}%
            </span>
          ) : (
            <span>목표를 정해 보세요</span>
          )}
        </div>
        <div className="bar">
          <div style={{ width: `${percent}%` }} />
        </div>
        <label className="goal-input">
          월
          <input type="number" min="1" max="100" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="8" />
          회 훈련하기
        </label>
        <label className="memo">
          메모
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: 왼발 퍼스트 터치 연습하기, 다음 경기 전까지 체력 올리기"
            rows={4}
            maxLength={1000}
          />
        </label>
        <div className="save-log">
          {message && <span>{message}</span>}
          <button className="primary" type="submit">
            저장
          </button>
        </div>
      </form>
    </section>
  );
}
