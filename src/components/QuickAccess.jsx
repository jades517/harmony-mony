import { ArrowRight, CalendarDays, ChartNoAxesColumnIncreasing, ClipboardList } from 'lucide-react';

export default function QuickAccess({ setTab }) {
  return (
    <>
      <div className="section-title">
        <div>
          <span className="eyebrow dark">QUICK ACCESS</span>
          <h2>
            오늘도 함께, 하모니! <span>✦</span>
          </h2>
        </div>
      </div>
      <div className="quick">
        <button className="tile mint" onClick={() => setTab('일정')}>
          <CalendarDays />
          <b>일정 확인</b>
          <span>다음 모임을 확인해요</span>
          <ArrowRight className="arrow" />
        </button>
        <button className="tile peach" onClick={() => setTab('훈련')}>
          <ClipboardList />
          <b>훈련표 보기</b>
          <span>90분 기본기 프로그램</span>
          <ArrowRight className="arrow" />
        </button>
        <button className="tile ice" onClick={() => setTab('기록')}>
          <ChartNoAxesColumnIncreasing />
          <b>내 기록</b>
          <span>우리의 성장 기록</span>
          <ArrowRight className="arrow" />
        </button>
      </div>
    </>
  );
}
