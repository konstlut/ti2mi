import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { themes } from '../data/themes';
import { loadProfile, getThemeProgress } from '../store/profileStore';
import StarRating from '../components/StarRating';

export default function ThemeSelect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = loadProfile();

  return (
    <div className="screen theme-select">
      <div className="theme-select__header">
        <button className="btn btn--back" onClick={() => navigate('/')}>← {t('menu.back')}</button>
        <h2>{t('menu.selectTheme')}</h2>
      </div>

      <div className="theme-select__grid">
        {themes.map((theme) => {
          const progress = getThemeProgress(profile, theme.id);
          const starsEarned = Object.values(progress.stars).reduce((a, b) => a + b, 0);

          return (
            <button
              key={theme.id}
              className={`theme-card ${progress.completed ? 'theme-card--completed' : ''}`}
              onClick={() => navigate(`/play/${theme.id}`)}
              style={{ '--theme-color': theme.colorPalette[0] } as React.CSSProperties}
            >
              <div className="theme-card__icon">{theme.icon}</div>
              <div className="theme-card__name">{t(theme.name)}</div>
              <div className="theme-card__progress">
                {t('game.level')} {progress.currentLevel}/15
              </div>
              {starsEarned > 0 && (
                <div className="theme-card__stars">
                  <StarRating stars={Math.min(3, Math.floor(starsEarned / 5))} />
                </div>
              )}
              {progress.completed && <div className="theme-card__badge">✅</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
