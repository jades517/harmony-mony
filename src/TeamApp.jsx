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
import { today } from './lib/format';

// 로그인한 팀원 화면. 로그인 후에 마운트되므로 데이터도 이때 불러옴
export default function TeamApp({ auth }) {
  const [tab, setTab] = useState('홈');
  const [checked, setChecked] = useState([]);
  const timer = useTimer();
  const me = { id: auth.user.id, name: auth.name };

  const schedules = useTable('schedules', { order: 'date' });
  const attendances = useTable('attendances');
  const exercises = useTable('exercises', { order: 'position' });
  const scheduleExercises = useTable('schedule_exercises', { order: 'position' });
  const logs = useTable('training_logs', { order: 'created_at', ascending: false });

  const now = today();
  const upcoming = schedules.rows.filter((s) => s.date >= now);
  const past = schedules.rows.filter((s) => s.date < now).reverse();

  // scheduleId가 null이면 기본 프로그램, 아니면 해당 일정의 훈련 목록
  const programFor = (scheduleId) =>
    scheduleId ? scheduleExercises.rows.filter((x) => x.schedule_id === scheduleId) : exercises.rows;

  // 훈련 탭에서 고른 일정. 직접 고르기 전에는 가장 가까운 예정 일정을 기본값으로 사용
  const [pickedScheduleId, setPickedScheduleId] = useState(undefined);
  const trainingScheduleId = pickedScheduleId === undefined ? (upcoming[0]?.id ?? null) : pickedScheduleId;
  const trainingItems = programFor(trainingScheduleId);

  // 프로그램 편집 페이지 대상 (null = 기본 프로그램) 과 돌아갈 탭
  const [editTarget, setEditTarget] = useState({ scheduleId: null, returnTab: '훈련' });
  const openProgramEditor = (scheduleId) => {
    setEditTarget({ scheduleId, returnTab: tab });
    setTab('훈련 편집');
  };

  const toggleExercise = (id) =>
    setChecked((v) => (v.includes(id) ? v.filter((z) => z !== id) : [...v, id]));
  // 다른 일정으로 바꾸거나 항목이 삭제되면 해당 체크는 제외
  const checkedIds = checked.filter((id) => trainingItems.some((e) => e.id === id));

  const shared = {
    setTab,
    me,
    schedules,
    upcoming,
    past,
    attendances,
    exercises,
    scheduleExercises,
    programFor,
    trainingScheduleId,
    setTrainingScheduleId: (id) => {
      setPickedScheduleId(id);
      setChecked([]);
    },
    trainingItems,
    openProgramEditor,
    editTarget,
    logs,
    checked: checkedIds,
    toggleExercise,
    clearChecked: () => setChecked([]),
    timer,
  };

  const error = [schedules, attendances, exercises, scheduleExercises, logs].map((t) => t.error).find(Boolean);
  // '훈련 편집'은 하위 페이지라 메뉴에서는 들어온 탭을 활성으로 표시
  const navTab = tab === '훈련 편집' ? editTarget.returnTab : tab;

  return (
    <>
      <Header tab={navTab} setTab={setTab} memberName={me.name} />
      <main className="container">
        <Hero onCta={() => setTab('일정')} />
        {error && <div className="demo-note error">저장소 오류 · {error}</div>}
        <MemberBar auth={auth} />
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
