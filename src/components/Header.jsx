// 메뉴는 오른쪽 아래 FloatingMenu에서. 헤더는 로고(홈 이동)와 프로필만
export default function Header({ setTab, memberName }) {
  return (
    <header className="header">
      <div className="container head">
        <button
          className="brand"
          onClick={() => {
            setTab?.('홈');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="brand-icon">⚽</span>
          <div>
            하모니모니 <small>HARMONY MONY</small>
          </div>
        </button>
        {memberName && (
          <span className="avatar" title={memberName}>
            {memberName.slice(0, 2)}
          </span>
        )}
      </div>
    </header>
  );
}
