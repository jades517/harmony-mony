import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV } from '../lib/constants';

export default function Header({ tab, setTab, memberName }) {
  const [menu, setMenu] = useState(false);

  return (
    <header className="header">
      <div className="container head">
        <div className="brand">
          <span className="brand-icon">⚽</span>
          <div>
            하모니모니 <small>HARMONY MONY</small>
          </div>
        </div>
        <nav>
          {NAV.map((x) => (
            <button className={tab === x ? 'active' : ''} key={x} onClick={() => setTab(x)}>
              {x}
            </button>
          ))}
        </nav>
        <button className="avatar" title={memberName || '이름 미입력'}>
          {memberName ? memberName.slice(0, 2) : 'HM'}
        </button>
        <button className="hamb" onClick={() => setMenu(!menu)}>
          {menu ? <X /> : <Menu />}
        </button>
      </div>
      {menu && (
        <div className="mobile-menu">
          {NAV.map((x) => (
            <button
              key={x}
              onClick={() => {
                setTab(x);
                setMenu(false);
              }}
            >
              {x}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
