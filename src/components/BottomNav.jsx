import { CalendarDays, ChartNoAxesColumnIncreasing, ClipboardList } from 'lucide-react';
import { NAV } from '../lib/constants';

const ICONS = [CalendarDays, CalendarDays, ClipboardList, ChartNoAxesColumnIncreasing];

export default function BottomNav({ tab, setTab }) {
  return (
    <div className="bottom-nav">
      {NAV.map((x, i) => {
        const Icon = ICONS[i];
        return (
          <button key={x} className={tab === x ? 'active' : ''} onClick={() => setTab(x)}>
            <Icon size={20} />
            <span>{x}</span>
          </button>
        );
      })}
    </div>
  );
}
