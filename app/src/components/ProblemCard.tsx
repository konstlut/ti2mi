import { useTranslation } from 'react-i18next';

interface ProblemCardProps {
  questionKey: string;
  questionParams: Record<string, string | number>;
  problemNumber: number;
  totalProblems: number;
}

export default function ProblemCard({ questionKey, questionParams, problemNumber, totalProblems }: ProblemCardProps) {
  const { t } = useTranslation();

  // Resolve nested i18n keys in params (e.g. "person.mom" → "Mom")
  const resolved: Record<string, string> = {};
  for (const [key, val] of Object.entries(questionParams)) {
    const s = String(val);
    const translated = t(s, { defaultValue: '' });
    resolved[key] = translated || s;
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
