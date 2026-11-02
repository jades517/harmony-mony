import QuickAccess from '../components/QuickAccess';
import ScheduleSection from '../components/ScheduleSection';
import TrainingSection from '../components/TrainingSection';
import ActivitySection from '../components/ActivitySection';

export default function HomePage(props) {
  return (
    <>
      <QuickAccess {...props} />
      <ScheduleSection {...props} items={props.upcoming} limit={2} />
      <TrainingSection {...props} />
      <ActivitySection {...props} />
    </>
  );
}
