import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { themes } from '../data/themes';
import { generateProblems } from '../engine/problems';
import { getLevelConfig } from '../engine/levels';
import { calculateResult } from '../engine/scoring';
import {
  loadProfile,
  saveProfile,
  getThemeProgress,
  updateThemeProgress,
  updateStats,
} from '../store/profileStore';
import EvolutionImage from '../components/EvolutionImage';
import ProblemCard from '../components/ProblemCard';
import AnswerInput from '../components/AnswerInput';
import ProgressBar from '../components/ProgressBar';
import StreakIndicator from '../components/StreakIndicator';

export default function GameScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { themeId } = useParams<{ themeId: string }>();

  const theme = useMemo(() => themes.find((th) => th.id === themeId), [themeId]);
  const profile = loadProfile();

  const themeProgress = useMemo(
    () => (themeId ? getThemeProgress(profile, themeId) : null),
    [themeId]
  );

  const level = Math.min(themeProgress?.currentLevel ?? 1, 15);
  const themeCompleted = (themeProgress?.currentLevel ?? 1) > 15;
  const levelConfig = useMemo(() => getLevelConfig(level), [level]);

  const problems = useMemo(
    () => themeCompleted ? [] : generateProblems(level, levelConfig.problemCount),
    [level, levelConfig.problemCount, themeCompleted]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; timeMs: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'tryAgain'; answer?: string; remaining?: number } | null>(null);
  const [problemStartTime, setProblemStartTime] = useState(Date.now());
  const [_levelStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setProblemStartTime(Date.now());
    setAttemptsLeft(3);
  }, [currentIndex]);

  const currentProblem = problems[currentIndex];
  const stage = theme ? theme.stages[Math.min(level - 1, 14)] : null;

  const advanceToNext = useCallback(() => {
    setFeedback(null);
    if (currentIndex + 1 < problems.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResult(true);
    }
  }, [currentIndex, problems.length]);

  const handleAnswer = useCallback(
    (input: string) => {
      if (!currentProblem) return;

      const normalized = input.replace(',', '.').trim();
      const userAnswer = parseFloat(normalized);
      const isCorrect =
        !isNaN(userAnswer) && Math.abs(userAnswer - currentProblem.answer) < 0.01;

      if (isCorrect) {
        const timeMs = Date.now() - problemStartTime;
        setStreak(streak + 1);
        setFeedback({ type: 'correct' });
        setAnswers([...answers, { correct: true, timeMs }]);
        setTimeout(advanceToNext, 1200);
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);

        if (remaining > 0) {
          setFeedback({ type: 'tryAgain', remaining });
          setTimeout(() => setFeedback(null), 1500);
        } else {
          const timeMs = Date.now() - problemStartTime;
          setStreak(0);
          setFeedback({
            type: 'wrong',
            answer: `${currentProblem.answer} ${currentProblem.answerUnit}`,
          });
          setAnswers([...answers, { correct: false, timeMs }]);
          setTimeout(advanceToNext, 3000);
        }
      }
    },
    [currentProblem, problemStartTime, streak, answers, attemptsLeft, advanceToNext]
  );

  const result = useMemo(() => {
    if (!showResult) return null;
    return calculateResult(answers, level);
  }, [showResult, answers, level]);

  useEffect(() => {
    if (result && themeId) {
      let updated = updateThemeProgress(profile, themeId, level, result.stars, result.passed);
      updated = updateStats(
        updated,
        result.correct,
        result.total,
        result.longestStreak,
        result.timeMs,
        result.passed,
        result.stars
      );
      saveProfile(updated);
    }
  }, [result]);

  if (!theme || !stage) {
    return (
      <div className="screen">
        <p>{t('game.themeNotFound')}</p>
        <button className="btn" onClick={() => navigate('/themes')}>{t('menu.back')}</button>
      </div>
    );
  }

  if (themeCompleted) {
    return (
      <div className="screen level-result">
        <EvolutionImage
          themeId={theme.id}
          stage={15}
          emoji={theme.stages[14].emoji}
          stageName={t(theme.stages[14].name)}
          color={theme.stages[14].color}
        />
        <h2>{t('levelup.themeComplete')}</h2>
        <p className="level-result__complete">{t('levelup.allLevelsComplete')}</p>
        <div className="level-result__buttons">
          <button className="btn btn--primary" onClick={() => navigate('/themes')}>
            {t('menu.selectTheme')}
          </button>
          <button className="btn btn--secondary" onClick={() => navigate('/')}>
            {t('menu.mainMenu')}
          </button>
        </div>
      </div>
    );
  }

  if (showResult && result) {
    return (
      <div className="screen level-result">
        <EvolutionImage
          themeId={theme.id}
          stage={level}
          emoji={stage.emoji}
          stageName={t(stage.name)}
          color={stage.color}
        />

        <h2>{result.passed ? t('levelup.complete') : t('levelup.failed')}</h2>

        <div className="level-result__score">
          {result.correct}/{result.total} {t('game.correct')}
        </div>

        <div className="level-result__stars">
          {'⭐'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}
        </div>

        {result.passed && level < 15 && (
          <p className="level-result__next">
            {t('levelup.nextLevel', { level: level + 1 })}
          </p>
        )}

        {result.passed && level >= 15 && (
          <p className="level-result__complete">{t('levelup.themeComplete')}</p>
        )}

        <div className="level-result__buttons">
          {result.passed && level < 15 ? (
            <button
              className="btn btn--primary"
              onClick={() => navigate(`/play/${themeId}?t=${Date.now()}`)}
            >
              {t('levelup.continue')}
            </button>
          ) : (
            <button
              className="btn btn--primary"
              onClick={() => navigate('/themes')}
            >
              {t('menu.selectTheme')}
            </button>
          )}
          {!result.passed && (
            <button
              className="btn btn--secondary"
              onClick={() => navigate(`/play/${themeId}?t=${Date.now()}`)}
            >
              {t('levelup.tryAgain')}
            </button>
          )}
          <button className="btn btn--secondary" onClick={() => navigate('/')}>
            {t('menu.mainMenu')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen game-screen">
      <div className="game-screen__top">
        <button className="btn btn--back" onClick={() => navigate('/themes')}>
          ← {t('menu.back')}
        </button>
        <div className="game-screen__level">
          {t('game.level')} {level} — {t(stage.name)}
        </div>
        <StreakIndicator streak={streak} />
      </div>

      <EvolutionImage
        themeId={theme.id}
        stage={level}
        emoji={stage.emoji}
        stageName={t(stage.name)}
        color={stage.color}
      />

      {currentProblem && (
        <>
          <ProblemCard
            questionKey={currentProblem.questionTemplate}
            questionParams={currentProblem.questionParams}
            problemNumber={currentIndex + 1}
            totalProblems={problems.length}
          />

          {feedback ? (
            <div className={`feedback feedback--${feedback.type === 'tryAgain' ? 'wrong' : feedback.type}`}>
              {feedback.type === 'correct'
                ? t('feedback.correct')
                : feedback.type === 'tryAgain'
                ? t('feedback.tryAgain', { remaining: feedback.remaining })
                : t('feedback.wrong', { answer: feedback.answer })}
            </div>
          ) : (
            <AnswerInput
              onSubmit={handleAnswer}
              placeholder={t('game.enterAnswer')}
            />
          )}
        </>
      )}

      <ProgressBar
        current={currentIndex}
        total={problems.length}
        correct={answers.filter((a) => a.correct).length}
      />
    </div>
  );
}
