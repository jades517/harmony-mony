import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MemberBar from './components/MemberBar';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import TrainingPage from './pages/TrainingPage';
import RecordsPage from './pages/RecordsPage';
import ExercisesPage from './pages/ExercisesPage';
import useTimer from './hooks/useTimer';
import useTable from './hooks/useTable';
import useMemberName from './hooks/useMemberName';
import { isSupabaseConfigured } from './lib/supabase';
import { today } from './lib/format';

export default function App() {
  const [tab, setTab] = useState('홈');
  const [checked, setChecked] = useState([]);
  const [memberName, setMemberName] = useMemberName();
  const timer = useTimer();

  const schedules = useTable('schedules', { order: 'date' });
  const attendances = useTable('attendances');
  const exercises = useTable('exercises', { order: 'position' });
  const logs = useTable('training_logs', { order: 'created_at', ascending: false });

  const toggleExercise = (id) =>
    setChecked((v) => (v.includes(id) ? v.filter((z) => z !== id) : [...v, id]));
  // 삭제된 항목이 체크 목록에 남지 않도록 현재 프로그램 기준으로 거름
  const checkedIds = checked.filter((id) => exercises.rows.some((e) => e.id === id));

  const now = today();
  const upcoming = schedules.rows.filter((s) => s.date >= now);
  const past = schedules.rows.filter((s) => s.date < now).reverse();

  const shared = {
    setTab,
    memberName,
    schedules,
    upcoming,
    past,
    attendances,
    exercises,
    logs,
    checked: checkedIds,
    toggleExercise,
    clearChecked: () => setChecked([]),
    timer,
  };

  const error = [schedules, attendances, exercises, logs].map((t) => t.error).find(Boolean);
  // '훈련 편집'은 훈련 탭의 하위 페이지라 메뉴에서는 훈련을 활성으로 표시
  const navTab = tab === '훈련 편집' ? '훈련' : tab;

  return (
    <>
      <Header tab={navTab} setTab={setTab} memberName={memberName} />
      <main className="container">
        <Hero onCta={() => setTab('일정')} />
        {!isSupabaseConfigured && (
          <div className="demo-note warn">
            Supabase 접속 정보가 없어요. <code>.env.example</code>을 <code>.env.local</code>로 복사해 URL과 키를
            채운 뒤 dev 서버를 다시 시작하세요.
          </div>
        )}
        {error && <div className="demo-note error">저장소 오류 · {error}</div>}
        <MemberBar memberName={memberName} onSave={setMemberName} />
        {tab === '홈' && <HomePage {...shared} />}
        {tab === '일정' && <SchedulePage {...shared} />}
        {tab === '훈련' && <TrainingPage {...shared} />}
        {tab === '기록' && <RecordsPage {...shared} />}
        {tab === '훈련 편집' && <ExercisesPage {...shared} />}
      </main>
      <footer>HARMONY MONY · 함께 뛰는 즐거움</footer>
      <BottomNav tab={navTab} setTab={setTab} />
    </>
  );
}
