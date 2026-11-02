import { useState } from 'react';

export default function MemberBar({ memberName, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(memberName);

  if (memberName && !editing) {
    return (
      <div className="member-bar">
        <span>
          <b>{memberName}</b> 님으로 참여 중
        </span>
        <button
          className="text-btn"
          onClick={() => {
            setValue(memberName);
            setEditing(true);
          }}
        >
          이름 변경
        </button>
      </div>
    );
  }

  return (
    <form
      className="member-bar"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onSave(value);
        setEditing(false);
      }}
    >
      <span>참석 여부와 훈련 기록을 남기려면 이름을 입력해 주세요</span>
      <div className="inline-form">
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="이름" maxLength={20} />
        <button className="primary" type="submit">
          저장
        </button>
      </div>
    </form>
  );
}
