import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import MemberBar from './components/MemberBar';
import FloatingMenu from './components/FloatingMenu';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import TrainingPage from './pages/TrainingPage';
import RecordsPage from './pages/RecordsPage';
import ExercisesPage from './pages/ExercisesPage';
import MembersPage from './pages/MembersPage';
import useTable from './hooks/useTable';
import { today } from './lib/format';
import { DEFAULT_SOURCE, canEditSource } from './lib/programs';

// 로그인한 팀원 화면. 로그인 후에 마운트되므로 데이터도 이때 불러옴
export default function TeamApp({ auth }) {
  const [tab, setTabState] = useState('홈');
  const [checked, setChecked] = useState([]);

  // 탭 이동을 브라우저 기록에 남겨서 휴대폰 뒤로가기로 이전 화면에 돌아감
  useEffect(() => {
    window.history.replaceState({ tab: '홈' }, '');
    const onPop = (e) => {
      setTabState(e.state?.tab ?? '홈');
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setTab = (next) => {
    if (next === tab) return;
    window.history.pushState({ tab: next }, '');
    setTabState(next);
  };
  const goBack = () => window.history.back();

  const profiles = useTable('profiles');
  const notes = useTable('personal_notes', { order: 'updated_at' });
  const profile = profiles.rows.find((p) => p.id === auth.user.id);
  // 화면에서 버튼을 숨기는 용도. 실제 권한은 DB(RLS)에서 막음
  const me = {
    id: auth.user.id,
    name: profile?.name || auth.name,
    isAdmin: profile?.role === 'admin',
    joinedOn: (profile?.created_at ?? auth.user.created_at).slice(0, 10),
  };

  const schedules = useTable('schedules', { order: 'date' });
  const attendances = useTable('attendances');
  const exercises = useTable('exercises', { order: 'position' });
  const scheduleExercises = useTable('schedule_exercises', { order: 'position' });
  const personalPrograms = useTable('personal_programs');
  const personalExercises = useTable('personal_exercises', { order: 'position' });
  const logs = useTable('training_logs', { order: 'created_at', ascending: false });

  const now = today();
  const upcoming = schedules.rows.filter((s) => s.date >= now);
  const past = schedules.rows.filter((s) => s.date < now).reverse();

  const programFor = (src) =>
    src.kind === 'schedule'
      ? scheduleExercises.rows.filter((x) => x.schedule_id === src.id)
      : src.kind === 'personal'
        ? personalExercises.rows.filter((x) => x.program_id === src.id)
        : exercises.rows;

  // 훈련 탭에서 고른 출처. 직접 고르기 전에는 가장 가까운 예정 일정을 기본값으로 사용
  const [pickedSource, setPickedSource] = useState(null);
  const trainingSource =
    pickedSource ?? (upcoming[0] ? { kind: 'schedule', id: upcoming[0].id } : DEFAULT_SOURCE);
  const trainingItems = programFor(trainingSource);

  // 프로그램 편집 페이지 대상과 돌아갈 탭
  const [editTarget, setEditTarget] = useState({ source: DEFAULT_SOURCE, returnTab: '훈련' });
  const openProgramEditor = (source) => {
    setEditTarget({ source, returnTab: tab });
    setTab('훈련 편집');
  };

  // 새 내 훈련 루틴을 만들고 선택한 뒤 바로 편집 화면으로
  const createPersonalProgram = async () => {
    const title = prompt('새 내 훈련 루틴 이름', '내 훈련 루틴')?.trim();
    if (!title) return;
    const rows = await personalPrograms.insert({ user_id: me.id, title });
    if (!rows) return;
    const created = { kind: 'personal', id: rows[0].id };
    setPickedSource(created);
    setChecked([]);
    openProgramEditor(created);
  };

  const toggleExercise = (id) =>
    setChecked((v) => (v.includes(id) ? v.filter((z) => z !== id) : [...v, id]));
  // 다른 일정으로 바꾸거나 항목이 삭제되면 해당 체크는 제외
  const checkedIds = checked.filter((id) => trainingItems.some((e) => e.id === id));

  const shared = {
    setTab,
    goBack,
    me,
    schedules,
    upcoming,
    past,
    attendances,
    exercises,
    scheduleExercises,
    personalPrograms,
    personalExercises,
    programFor,
    trainingSource,
    setTrainingSource: (src) => {
      setPickedSource(src);
      setChecked([]);
    },
    trainingItems,
    openProgramEditor,
    createPersonalProgram,
    editTarget,
    logs,
    profiles,
    notes,
    checked: checkedIds,
    toggleExercise,
    clearChecked: () => setChecked([]),
  };

  const error = [
    schedules,
    attendances,
    exercises,
    scheduleExercises,
    personalPrograms,
    personalExercises,
    logs,
    profiles,
    notes,
  ]
    .map((t) => t.error)
    .find(Boolean);
  // '훈련 편집'은 하위 페이지라 메뉴에서는 들어온 탭을 활성으로 표시
  const navTab = tab === '훈련 편집' ? editTarget.returnTab : tab;
  // 권한 없는 화면은 열리지 않도록 (회원은 내 루틴 편집만 가능)
  const blocked =
    (tab === '회원' && !me.isAdmin) || (tab === '훈련 편집' && !canEditSource(editTarget.source, me));
  const page = blocked ? '홈' : tab;

  return (
    <>
      <Header tab={navTab} setTab={setTab} memberName={me.name} isAdmin={me.isAdmin} />
      <main className="container">
        <Hero onCta={() => setTab('일정')} />
        {error && <div className="demo-note error">저장소 오류 · {error}</div>}
        <MemberBar auth={auth} me={me} onRenamed={(name) => profiles.update(me.id, { name })} />
        {/* 훈련 편집은 페이지 안에 자체 돌아가기 버튼이 있음 */}
        {page !== '홈' && page !== '훈련 편집' && (
          <button className="text-btn back" onClick={goBack}>
            <ArrowLeft size={16} /> 돌아가기
          </button>
        )}
        {page === '홈' && <HomePage {...shared} />}
        {page === '일정' && <SchedulePage {...shared} />}
        {page === '훈련' && <TrainingPage {...shared} />}
        {page === '기록' && <RecordsPage {...shared} />}
        {page === '훈련 편집' && <ExercisesPage {...shared} />}
        {page === '회원' && <MembersPage {...shared} />}
      </main>
      <footer>HARMONY MONY · 함께 뛰는 즐거움</footer>
      <FloatingMenu tab={navTab} setTab={setTab} isAdmin={me.isAdmin} />
    </>
  );
}
