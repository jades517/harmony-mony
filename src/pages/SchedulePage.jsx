import ScheduleSection from '../components/ScheduleSection';

export default function SchedulePage(props) {
  return (
    <>
      <ScheduleSection {...props} items={props.upcoming} canAdd />
      {props.past.length > 0 && (
        <ScheduleSection {...props} items={props.past} eyebrow="PAST SCHEDULE" title="지난 일정" isPast />
      )}
    </>
  );
}
