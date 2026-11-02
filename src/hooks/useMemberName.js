import { useState } from 'react';

const KEY = 'harmony-mony:member-name';

// 로그인 도입 전까지 이름을 브라우저에 기억해 사용자 구분에 사용
export default function useMemberName() {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(KEY) || '';
    } catch {
      return '';
    }
  });

  const save = (value) => {
    const trimmed = value.trim();
    setName(trimmed);
    try {
      localStorage.setItem(KEY, trimmed);
    } catch {
      // 저장 불가(사파리 개인 모드 등) — 이번 세션 동안만 유지
    }
  };

  return [name, save];
}
