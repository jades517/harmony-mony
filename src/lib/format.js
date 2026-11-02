const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 로컬 기준 YYYY-MM-DD
export const today = () => new Date().toLocaleDateString('sv-SE');

export const formatDate = (date) => date.slice(5).replace('-', '.');

export const weekday = (date) => WEEKDAYS[new Date(`${date}T00:00:00`).getDay()];

export const formatTimeRange = (start, end) =>
  [start, end].filter(Boolean).map((t) => t.slice(0, 5)).join(' - ') || '시간 미정';

export const formatDuration = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
