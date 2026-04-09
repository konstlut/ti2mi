import { useTranslation } from 'react-i18next';

interface ProblemCardProps {
  questionKey: string;
  questionParams: Record<string, string | number>;
  problemNumber: number;
  totalProblems: number;
}

export default function ProblemCard({ questionKey, questionParams, problemNumber, totalProblems }: ProblemCardProps) {
  const { t } = useTranslation();

  // First resolve i18n keys in params (e.g. "person.mom.bought" → "Mom bought")
  const resolved: Record<string, string> = {};
  for (const [key, val] of Object.entries(questionParams)) {
    const s = String(val);
    if (s.includes('.')) {
      resolved[key] = t(s, { defaultValue: s });
    } else {
      resolved[key] = s;
    }
  }

  // Get the raw template string without i18next interpolation
  const template = t(questionKey, { interpolation: { prefix: '[[', suffix: ']]' } });
  const question = template.replace(/\{\{(\w+)\}\}/g, (_, key) => resolved[key] ?? `{{${key}}}`);

  return (
    <div className="problem-card">
      <div className="problem-card__header">
        {t('game.problemOf', { current: problemNumber, total: totalProblems })}
      </div>
      <div className="problem-card__question">
        {question}
      </div>
    </div>
  );
}
