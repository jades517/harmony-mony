import { NAV_LABELS, navItems } from '../lib/constants';

// 로그인 전(setTab 없음)에는 로고만. 로그인 후 PC에서는 상단 메뉴 + 플로팅 메뉴, 모바일은 플로팅 메뉴만
export default function Header({ tab, setTab, memberName, isAdmin }) {
  const go = (x) => {
    setTab?.(x);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="header">
      <div className="container head">
        <button className="brand" onClick={() => go('홈')}>
          <span className="brand-icon">⚽</span>
          <div>
            하모니모니 <small>HARMONY MONY</small>
          </div>
        </button>
        {setTab && (
          <>
            <nav>
              {navItems(isAdmin).map((x) => (
                <button className={tab === x ? 'active' : ''} key={x} onClick={() => go(x)}>
                  {NAV_LABELS[x] ?? x}
                </button>
              ))}
            </nav>
            <span className="avatar" title={memberName}>
              {memberName.slice(0, 2)}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
