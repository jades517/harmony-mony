import { useState } from 'react';

export default function MemberBar({ auth }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(auth.name);

  if (editing) {
    return (
      <form
        className="member-bar"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!value.trim()) return;
          const { error } = await auth.updateName(value.trim());
          if (error) alert(error.message);
          else setEditing(false);
        }}
      >
        <span>팀에서 보일 이름을 바꿔요 (이미 남긴 참석·기록의 이름은 그대로예요)</span>
        <div className="inline-form">
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="이름" maxLength={20} autoFocus />
          <button type="button" className="outline" onClick={() => setEditing(false)}>
            취소
          </button>
          <button className="primary" type="submit">
            저장
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="member-bar">
      <span>
        <b>{auth.name}</b> 님으로 로그인 중 <small>{auth.user.email}</small>
      </span>
      <div className="inline-form">
        <button
          className="text-btn"
          onClick={() => {
            setValue(auth.name);
            setEditing(true);
          }}
        >
          이름 변경
        </button>
        <button className="text-btn muted" onClick={auth.signOut}>
          로그아웃
        </button>
      </div>
    </div>
  );
}
