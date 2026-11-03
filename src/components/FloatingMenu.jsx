import { useEffect, useState } from 'react';
import { CalendarDays, ChartNoAxesColumnIncreasing, ClipboardList, House, Menu, X } from 'lucide-react';
import { NAV } from '../lib/constants';

const ICONS = { 홈: House, 일정: CalendarDays, 훈련: ClipboardList, 기록: ChartNoAxesColumnIncreasing };

// 오른쪽 아래 플로팅 버튼 — 누르면 메뉴가 위로 펼쳐짐
export default function FloatingMenu({ tab, setTab }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (x) => {
    setTab(x);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {open && <div className="fab-backdrop" onClick={() => setOpen(false)} />}
      <nav className={`fab${open ? ' open' : ''}`}>
        <ul className="fab-menu" aria-hidden={!open}>
          {NAV.map((x, i) => {
            const Icon = ICONS[x];
            return (
              <li key={x} style={{ transitionDelay: open ? `${(NAV.length - 1 - i) * 30}ms` : '0ms' }}>
                <button className={tab === x ? 'active' : ''} onClick={() => go(x)} tabIndex={open ? 0 : -1}>
                  <span>{x}</span>
                  <Icon size={19} />
                </button>
              </li>
            );
          })}
        </ul>
        <button className="fab-toggle" onClick={() => setOpen(!open)} aria-label={open ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
    </>
  );
}
