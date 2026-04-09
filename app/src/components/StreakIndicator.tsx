interface StreakIndicatorProps {
  streak: number;
}

export default function StreakIndicator({ streak }: StreakIndicatorProps) {
  if (streak < 2) return null;
  
  return (
    <div className={`streak-indicator ${streak >= 5 ? 'streak--max' : streak >= 3 ? 'streak--hot' : ''}`}>
      <span className="streak-fire">🔥</span>
      <span className="streak-count">{streak}</span>
    </div>
  );
}
