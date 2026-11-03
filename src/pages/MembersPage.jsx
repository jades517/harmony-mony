import { supabase } from '../lib/supabase';

// 운영진 전용: 회원 목록과 권한 변경
export default function MembersPage({ me, profiles }) {
  const admins = profiles.rows.filter((p) => p.role === 'admin').length;

  const setRole = async (p, role) => {
    const label = role === 'admin' ? '운영진으로 지정' : '회원으로 변경';
    if (!confirm(`${p.name} 님을 ${label}할까요?`)) return;
    const { error } = await supabase.rpc('set_member_role', { target: p.id, new_role: role });
    if (error) alert(error.message);
    await profiles.reload();
  };

  return (
    <section className="section">
      <div className="section-title">
        <div>
          <span className="eyebrow dark">MEMBERS</span>
          <h2>회원 관리</h2>
          <p className="sub">운영진은 일정 등록·수정, 훈련 편집, 회원 권한 변경을 할 수 있어요.</p>
        </div>
        <span className="pink-tag">
          {profiles.rows.length}명 · 운영진 {admins}명
        </span>
      </div>
      <div className="manage-list">
        {profiles.loading && <div className="empty">불러오는 중…</div>}
        {profiles.rows.map((p) => (
          <div className="manage-row member-row" key={p.id}>
            <span className="order">{p.name.slice(0, 1)}</span>
            <span className="name">
              {p.name}
              {p.id === me.id && <small> (나)</small>}
            </span>
            <small>{p.created_at.slice(0, 10)} 가입</small>
            <em className={`role-badge${p.role === 'admin' ? ' admin' : ''}`}>{p.role === 'admin' ? '운영진' : '회원'}</em>
            {p.role === 'admin' ? (
              <button className="outline" onClick={() => setRole(p, 'member')} disabled={admins <= 1}>
                회원으로 변경
              </button>
            ) : (
              <button className="outline" onClick={() => setRole(p, 'admin')}>
                운영진 지정
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
