import { ArrowRight } from 'lucide-react';

export default function Hero({ onCta }) {
  return (
    <section className="hero">
      <div>
        <div className="eyebrow">OUR TEAM · OUR MOMENT</div>
        <h1>
          함께 뛰면
          <br />더 즐거운 우리 ⚽
        </h1>
        <p>
          풋살 일정부터 훈련 기록까지,
          <br />
          우리 팀의 모든 순간을 하모니모니에서.
        </p>
        {onCta && (
          <button className="hero-btn" onClick={onCta}>
            일정 확인하기 <ArrowRight size={17} />
          </button>
        )}
      </div>
      <div className="hero-art">
        <div className="orbit one"></div>
        <div className="orbit two"></div>
        <span>⚽</span>
      </div>
    </section>
  );
}
