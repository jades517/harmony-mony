import MyUpcoming from '../components/MyUpcoming';
import MyStats from '../components/MyStats';
import MyNotes from '../components/MyNotes';
import TrainingLogList from '../components/TrainingLogList';
import { myStats } from '../lib/stats';

// 마이 보드: 내 다음 일정 · 통계 · 목표/메모 · 훈련 기록
export default function RecordsPage(props) {
  const stats = myStats(props);

  return (
    <>
      <MyUpcoming {...props} />
      <MyStats stats={stats} />
      <MyNotes {...props} stats={stats} />
      <TrainingLogList {...props} />
    </>
  );
}
