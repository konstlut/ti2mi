import { useTranslation } from 'react-i18next';

interface ProblemCardProps {
  questionKey: string;
  questionParams: Record<string, string | number>;
  problemNumber: number;
  totalProblems: number;
}

export default function ProblemCard({ questionKey, questionParams, problemNumber, totalProblems }: ProblemCardProps) {
  const { t, i18n } = useTranslation();

  // Resolve i18n key params (containing "."), pass others as-is
  const resolved: Record<string, string> = {};
  for (const [key, val] of Object.entries(questionParams)) {
    const s = String(val);
    if (s.includes('.')) {
      resolved[key] = t(s, { defaultValue: s });
    } else {
      resolved[key] = s;
    }
  }

  // Get raw template from i18n resources (bypass interpolation entirely)
  const parts = questionKey.split('.');
  let template: unknown = i18n.getResourceBundle(i18n.language, 'translation');
  for (const p of parts) {
    template = (template as Record<string, unknown>)?.[p];
  }
  const raw = typeof template === 'string' ? template : questionKey;
  const question = raw.replace(/\{\{(\w+)\}\}/g, (_, key) => resolved[key] ?? `{{${key}}}`);

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
