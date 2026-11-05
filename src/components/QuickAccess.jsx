import { CalendarDays, ChartNoAxesColumnIncreasing, ClipboardList } from 'lucide-react';

const SHORTCUTS = [
  { tab: '일정', label: '일정 확인', icon: CalendarDays, tone: 'mint' },
  { tab: '훈련', label: '훈련표', icon: ClipboardList, tone: 'peach' },
  { tab: '기록', label: '내 기록', icon: ChartNoAxesColumnIncreasing, tone: 'ice' },
];

// 홈 바로가기 (3열)
export default function QuickAccess({ setTab }) {
  return (
    <>
      <div className="section-title">
        <div>
          <span className="eyebrow dark">QUICK ACCESS</span>
          <h2>
            오늘도 함께, 하모니! <span>✦</span>
          </h2>
        </div>
      </div>
      <div className="quick">
        {SHORTCUTS.map(({ tab, label, icon: Icon, tone }) => (
          <button className={`tile ${tone}`} key={tab} onClick={() => setTab(tab)}>
            <Icon />
            <b>{label}</b>
          </button>
        ))}
      </div>
    </>
  );
}
