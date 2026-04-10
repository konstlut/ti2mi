import { useTranslation } from 'react-i18next';

interface ProblemCardProps {
  questionKey: string;
  questionParams: Record<string, string | number>;
  problemNumber: number;
  totalProblems: number;
}

export default function ProblemCard({ questionKey, questionParams, problemNumber, totalProblems }: ProblemCardProps) {
  const { t, i18n } = useTranslation();

  const bundle = i18n.getResourceBundle(i18n.language, 'translation') || {};

  function resolveKey(key: string): string {
    const parts = key.split('.');
    // Try nested path (e.g., "item.apples" → item → apples)
    let val: unknown = bundle;
    for (const p of parts) {
      val = (val as Record<string, unknown>)?.[p];
      if (val === undefined) break;
    }
    if (typeof val === 'string') return val;

    // Try flat key under first segment (e.g., "person.dad.bought" → person["dad.bought"])
    if (parts.length >= 2) {
      const section = bundle[parts[0]];
      if (section && typeof section === 'object') {
        const flatKey = parts.slice(1).join('.');
        const flatVal = (section as Record<string, unknown>)[flatKey];
        if (typeof flatVal === 'string') return flatVal;
      }
    }

    return key;
  }

  const resolved: Record<string, string> = {};
  for (const [key, val] of Object.entries(questionParams)) {
    const s = String(val);
    resolved[key] = s.includes('.') ? resolveKey(s) : s;
  }

  const raw = resolveKey(questionKey);
  const question = raw.replace(/\{\{(\w+)\}\}/g, (_, k: string) => resolved[k] ?? `{{${k}}}`);

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
