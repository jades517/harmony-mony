// 훈련 프로그램 출처
//   { kind: 'default' }               기본 프로그램 (exercises)
//   { kind: 'schedule', id }          일정별 훈련 (schedule_exercises)
//   { kind: 'personal', id }          나만의 루틴 (personal_exercises, 본인만)
export const DEFAULT_SOURCE = { kind: 'default' };

// <select> 값과 출처 객체 변환
export const sourceKey = (src) => (src.kind === 'default' ? 'default' : `${src.kind}:${src.id}`);
export const parseSourceKey = (key) => {
  if (key === 'default') return DEFAULT_SOURCE;
  const [kind, id] = key.split(':');
  return { kind, id };
};

export const sameSource = (a, b) => sourceKey(a) === sourceKey(b);

// 출처별 테이블과 새 항목에 붙일 연결 컬럼
export const sourceTable = (src, tables) =>
  ({ default: tables.exercises, schedule: tables.scheduleExercises, personal: tables.personalExercises })[src.kind];

export const sourceLink = (src) =>
  src.kind === 'schedule' ? { schedule_id: src.id } : src.kind === 'personal' ? { program_id: src.id } : {};

// 회원은 내 루틴만, 운영진은 전부 편집 가능
export const canEditSource = (src, me) => src.kind === 'personal' || me.isAdmin;
