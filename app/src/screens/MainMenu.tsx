import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { loadProfile } from '../store/profileStore';

export default function MainMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = loadProfile();

  return (
    <div className="screen main-menu">
      <div className="main-menu__header">
        <h1 className="main-menu__title">TI2MI</h1>
        <p className="main-menu__subtitle">{t('menu.subtitle')}</p>
      </div>

      {profile.name && (
        <div className="main-menu__welcome">
          <span style={{ fontSize: '1.5rem' }}>{profile.avatarId === 'default' ? '🧒' : profile.avatarId}</span>
          {' '}{t('menu.welcome', { name: profile.name })}
        </div>
      )}

      <div className="main-menu__buttons">
        <button className="btn btn--primary btn--large" onClick={() => navigate('/themes')}>
          {t('menu.startGame')}
        </button>
        <button className="btn btn--secondary" onClick={() => navigate('/profile')}>
          {t('menu.progress')}
        </button>
        <button className="btn btn--secondary" onClick={() => navigate('/settings')}>
          {t('menu.settings')}
        </button>
      </div>
    </div>
  );
}
