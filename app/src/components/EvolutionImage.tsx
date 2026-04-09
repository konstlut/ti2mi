interface EvolutionImageProps {
  themeId: string;
  stage: number;
  emoji: string;
  stageName: string;
  color: string;
}

export default function EvolutionImage({ themeId, stage, emoji, stageName, color }: EvolutionImageProps) {
  return (
    <div
      className="evolution-image"
      style={{ '--accent-color': color } as React.CSSProperties}
      data-theme={themeId}
      data-stage={stage}
    >
      <div className="evolution-image__emoji">{emoji}</div>
      <div className="evolution-image__name">{stageName}</div>
      <div className="evolution-image__level">Stage {stage}</div>
    </div>
  );
}
