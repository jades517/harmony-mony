export const NAV = ['홈', '일정', '훈련', '기록'];

// 메뉴에 보이는 이름 (탭 키와 다른 것만)
export const NAV_LABELS = { 기록: '마이 보드', 회원: '회원 관리' };

// 운영진은 회원 관리 메뉴가 추가됨
export const navItems = (isAdmin) => (isAdmin ? [...NAV, '회원'] : NAV);

export const RSVP_OPTIONS = ['참석', '불참', '미정'];
// 홈 일정 카드에 보여줄 투표 결과 이름
export const RSVP_LABELS = { 참석: '참석예정', 불참: '미참석', 미정: '미정' };
