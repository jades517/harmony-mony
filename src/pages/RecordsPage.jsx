import ActivitySection from '../components/ActivitySection';
import TrainingLogList from '../components/TrainingLogList';

export default function RecordsPage(props) {
  return (
    <>
      <ActivitySection {...props} />
      <TrainingLogList {...props} />
    </>
  );
}
