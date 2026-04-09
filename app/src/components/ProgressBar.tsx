interface ProgressBarProps {
  current: number;
  total: number;
  correct: number;
}

export default function ProgressBar({ current, total, correct }: ProgressBarProps) {
  return (
    <div className="progress-bar">
      <div className="progress-bar__track">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`progress-bar__dot ${
              i < current ? (i < correct ? 'correct' : 'wrong') : ''
            } ${i === current ? 'active' : ''}`}
          />
        ))}
      </div>
      <span className="progress-bar__label">
        {current}/{total}
      </span>
    </div>
  );
}
