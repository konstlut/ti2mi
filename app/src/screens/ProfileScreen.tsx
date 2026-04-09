import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { loadProfile, getThemeProgress } from '../store/profileStore';
import { themes } from '../data/themes';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = loadProfile();
  const { stats } = profile;

  const accuracy = stats.totalProblems > 0
    ? Math.round((stats.totalCorrect / stats.totalProblems) * 100)
    : 0;

  return (
    <div className="screen profile-screen">
      <div className="profile-screen__header">
        <button className="btn btn--back" onClick={() => navigate('/')}>← {t('menu.back')}</button>
        <h2>{t('menu.progress')}</h2>
      </div>

      <div className="profile-screen__avatar">
        <div className="avatar">{profile.avatarId === 'default' ? '🧒' : profile.avatarId}</div>
        <h3>{profile.name || t('profile.anonymous')}</h3>
      </div>

      <div className="profile-screen__stats">
        <div className="stat-card">
          <div className="stat-card__value">{stats.totalProblems}</div>
          <div className="stat-card__label">{t('profile.totalProblems')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{accuracy}%</div>
          <div className="stat-card__label">{t('profile.accuracy')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.levelsCompleted}</div>
          <div className="stat-card__label">{t('profile.levelsCompleted')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.longestStreak}</div>
          <div className="stat-card__label">{t('profile.longestStreak')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.themesCompleted}</div>
          <div className="stat-card__label">{t('profile.themesCompleted')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.perfectLevels}</div>
          <div className="stat-card__label">{t('profile.perfectLevels')}</div>
        </div>
      </div>

      {profile.earnedBadges.length > 0 && (
        <div className="profile-screen__badges">
          <h3>{t('profile.badges')}</h3>
          <div className="badge-grid">
            {profile.earnedBadges.map((badgeId) => (
              <div key={badgeId} className="badge">
                {t(`badges.${badgeId}.name`)}
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ marginTop: 8 }}>{t('profile.themeProgress')}</h3>

      <div className="gallery-grid">
        {themes.map((theme) => {
          const progress = getThemeProgress(profile, theme.id);
          const unlockedStages = progress.currentLevel;

          return (
            <div key={theme.id} className="gallery-theme">
              <h3>{theme.icon} {t(theme.name)}</h3>
              <div className="gallery-stages">
                {theme.stages.map((stage, index) => {
                  const unlocked = index < unlockedStages;
                  return (
                    <div
                      key={index}
                      className={`gallery-stage ${unlocked ? 'gallery-stage--unlocked' : 'gallery-stage--locked'}`}
                      style={unlocked ? { '--accent-color': stage.color } as React.CSSProperties : undefined}
                      title={unlocked ? t(stage.name) : '???'}
                    >
                      {unlocked ? stage.emoji : '🔒'}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
