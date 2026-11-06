import { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { NAV_LABELS, navItems } from '../lib/constants';

// 로그인 전(setTab 없음)에는 로고만. 로그인 후 PC에서는 상단 메뉴 + 플로팅 메뉴, 모바일은 플로팅 메뉴만
export default function Header({ tab, setTab, memberName, isAdmin, onSignOut }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // 아바타 메뉴: 바깥 클릭이나 Esc로 닫기
  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e) => !profileRef.current?.contains(e.target) && setProfileOpen(false);
    const onKey = (e) => e.key === 'Escape' && setProfileOpen(false);
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

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
            {/* 아바타를 누르면 오른쪽으로 이름·권한이 펼쳐짐 (아바타는 왼쪽으로 밀려남) */}
            <div className={`profile${profileOpen ? ' open' : ''}`} ref={profileRef}>
              <button
                className="avatar"
                title={memberName}
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                {memberName.slice(0, 2)}
              </button>
              <span className="profile-info" aria-hidden={!profileOpen}>
                <b>{memberName}</b> 님
                <em className={`role-badge${isAdmin ? ' admin' : ''}`}>{isAdmin ? '운영진' : '회원'}</em>
                <button
                  className="icon-btn logout"
                  title="로그아웃"
                  aria-label="로그아웃"
                  onClick={onSignOut}
                  tabIndex={profileOpen ? 0 : -1}
                >
                  <LogOut size={16} />
                </button>
              </span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
