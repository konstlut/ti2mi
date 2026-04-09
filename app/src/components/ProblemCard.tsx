import { useTranslation } from 'react-i18next';

interface ProblemCardProps {
  questionKey: string;
  questionParams: Record<string, string | number>;
  problemNumber: number;
  totalProblems: number;
}

export default function ProblemCard({ questionKey, questionParams, problemNumber, totalProblems }: ProblemCardProps) {
  const { t } = useTranslation();

  // Resolve only i18n key params (containing "."), pass others as-is
  const resolved: Record<string, string> = {};
  for (const [key, val] of Object.entries(questionParams)) {
    const s = String(val);
    if (s.includes('.')) {
      const translated = t(s, { defaultValue: s });
      resolved[key] = translated;
    } else {
      resolved[key] = s;
    }
  }

  return (
    <div className="problem-card">
      <div className="problem-card__header">
        {t('game.problemOf', { current: problemNumber, total: totalProblems })}
      </div>
      <div className="problem-card__question">
        {t(questionKey, resolved)}
      </div>
    </div>
  );
}
