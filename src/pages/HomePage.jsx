import QuickAccess from '../components/QuickAccess';
import ScheduleSection from '../components/ScheduleSection';
import TrainingSection from '../components/TrainingSection';
import ActivitySection from '../components/ActivitySection';

export default function HomePage(props) {
  return (
    <>
      <ScheduleSection {...props} items={props.upcoming} limit={3} compact />
      <QuickAccess {...props} />
      <TrainingSection {...props} />
      <ActivitySection {...props} />
    </>
  );
}
