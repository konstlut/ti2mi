import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  loadProfile, saveProfile, resetProfile,
  listProfiles, createProfile, switchProfile, deleteProfile,
} from '../store/profileStore';
import { useState } from 'react';
import { exportProfile, importProfile } from '../store/storage';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'cs', label: 'Čeština' },
  { code: 'ru', label: 'Русский' },
];

const AVATARS = ['🧒', '👧', '👦', '👩', '🦁', '🐯', '🐼', '🦊', '🐶', '🐱', '🦄', '🐉', '🦸', '🧙', '🤖', '👽'];

const COLOR_SCHEMES = [
  { id: 'sunset', colors: ['#f59e0b', '#a855f7', '#1a1225'] },
  { id: 'ocean', colors: ['#22d3ee', '#3b82f6', '#0c1929'] },
  { id: 'forest', colors: ['#4ade80', '#a3e635', '#0f1a12'] },
  { id: 'desert', colors: ['#e8a87c', '#c17850', '#1a1520'] },
  { id: 'aurora', colors: ['#38bdf8', '#818cf8', '#0a1628'] },
  { id: 'volcano', colors: ['#ef4444', '#f97316', '#1a0f0c'] },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(loadProfile);
  const [profiles, setProfiles] = useState(listProfiles);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🧒');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const refreshProfiles = () => {
    setProfiles(listProfiles());
    setProfile(loadProfile());
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    const updated = { ...profile, selectedLanguage: lang };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleSoundToggle = () => {
    const updated = { ...profile, soundEnabled: !profile.soundEnabled };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleNameChange = (name: string) => {
    const updated = { ...profile, name };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleAvatarChange = (avatarId: string) => {
    const updated = { ...profile, avatarId };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleColorSchemeChange = (colorScheme: string) => {
    const updated = { ...profile, colorScheme };
    setProfile(updated);
    saveProfile(updated);
    document.documentElement.setAttribute('data-theme', colorScheme);
  };

  const handleReset = () => {
    const fresh = resetProfile();
    setProfile(fresh);
    setShowResetConfirm(false);
  };

  const handleSwitchProfile = (id: string) => {
    const p = switchProfile(id);
    if (p) {
      setProfile(p);
      if (p.selectedLanguage) i18n.changeLanguage(p.selectedLanguage);
    }
  };

  const handleCreateProfile = () => {
    if (!newName.trim()) return;
    const p = createProfile(newName.trim(), newAvatar);
    setProfile(p);
    setShowNewProfile(false);
    setNewName('');
    setNewAvatar('🧒');
    refreshProfiles();
  };

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id);
    setShowDeleteConfirm(null);
    refreshProfiles();
  };

  const handleExport = () => {
    const json = exportProfile();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ti2mi-profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const success = importProfile(reader.result as string);
        if (success) {
          refreshProfiles();
          alert(t('settings.importSuccess'));
        } else {
          alert(t('settings.importError'));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="screen settings-screen">
      <div className="settings-screen__header">
        <button className="btn btn--back" onClick={() => navigate('/')}>← {t('menu.back')}</button>
        <h2>{t('menu.settings')}</h2>
      </div>

      {/* Profile switcher */}
      <div className="settings-group">
        <label className="settings-label">{t('settings.profiles')}</label>
        <div className="profile-list">
          {profiles.map((p) => (
            <div
              key={p.id}
              className={`profile-item ${p.id === profile.id ? 'profile-item--active' : ''}`}
            >
              <button
                className="profile-item__select"
                onClick={() => handleSwitchProfile(p.id)}
              >
                <span className="profile-item__avatar">
                  {p.avatarId === 'default' ? '🧒' : p.avatarId}
                </span>
                <span className="profile-item__name">
                  {p.name || t('profile.anonymous')}
                </span>
                {p.id === profile.id && <span className="profile-item__badge">✓</span>}
              </button>
              {profiles.length > 1 && (
                showDeleteConfirm === p.id ? (
                  <div className="profile-item__delete-confirm">
                    <button className="btn btn--danger btn--small" onClick={() => handleDeleteProfile(p.id)}>
                      {t('settings.resetYes')}
                    </button>
                    <button className="btn btn--small" onClick={() => setShowDeleteConfirm(null)}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <button className="btn btn--small btn--ghost" onClick={() => setShowDeleteConfirm(p.id)}>
                    🗑️
                  </button>
                )
              )}
            </div>
          ))}
        </div>

        {showNewProfile ? (
          <div className="new-profile-form">
            <input
              className="settings-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('settings.enterName')}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProfile()}
            />
            <div className="avatar-picker">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  className={`avatar-option ${newAvatar === a ? 'avatar-option--selected' : ''}`}
                  onClick={() => setNewAvatar(a)}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="settings-options">
              <button className="btn btn--primary" onClick={handleCreateProfile} disabled={!newName.trim()}>
                {t('settings.create')}
              </button>
              <button className="btn btn--secondary" onClick={() => setShowNewProfile(false)}>
                {t('settings.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn--secondary" onClick={() => setShowNewProfile(true)} style={{ marginTop: 8 }}>
            ➕ {t('settings.addProfile')}
          </button>
        )}
      </div>

      {/* Current profile name & avatar */}
      <div className="settings-group">
        <label className="settings-label">{t('settings.playerName')}</label>
        <input
          type="text"
          className="settings-input"
          value={profile.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder={t('settings.enterName')}
        />
        <label className="settings-label" style={{ marginTop: 12 }}>{t('settings.avatar')}</label>
        <div className="avatar-picker">
          {AVATARS.map((a) => (
            <button
              key={a}
              className={`avatar-option ${profile.avatarId === a ? 'avatar-option--selected' : ''}`}
              onClick={() => handleAvatarChange(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.language')}</label>
        <div className="settings-options">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`btn btn--option ${i18n.language === lang.code ? 'btn--active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.colorScheme')}</label>
        <div className="color-scheme-picker">
          {COLOR_SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              className={`color-scheme-option ${(profile.colorScheme || 'sunset') === scheme.id ? 'color-scheme-option--selected' : ''}`}
              onClick={() => handleColorSchemeChange(scheme.id)}
            >
              <div className="color-scheme-preview" style={{
                background: `linear-gradient(135deg, ${scheme.colors[0]}, ${scheme.colors[1]}, ${scheme.colors[2]})`
              }} />
              <span>{t(`settings.scheme.${scheme.id}`)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.sound')}</label>
        <button
          className={`btn btn--option ${profile.soundEnabled ? 'btn--active' : ''}`}
          onClick={handleSoundToggle}
        >
          {profile.soundEnabled ? `🔊 ${t('settings.on')}` : `🔇 ${t('settings.off')}`}
        </button>
      </div>

      <div className="settings-group">
        <label className="settings-label">{t('settings.data')}</label>
        <div className="settings-options">
          <button className="btn btn--secondary" onClick={handleExport}>
            📤 {t('settings.exportProfile')}
          </button>
          <button className="btn btn--secondary" onClick={handleImport}>
            📥 {t('settings.importProfile')}
          </button>
        </div>
      </div>

      <div className="settings-group settings-group--danger">
        {showResetConfirm ? (
          <div className="reset-confirm">
            <p>{t('settings.resetConfirm')}</p>
            <button className="btn btn--danger" onClick={handleReset}>
              {t('settings.resetYes')}
            </button>
            <button className="btn btn--secondary" onClick={() => setShowResetConfirm(false)}>
              {t('settings.resetNo')}
            </button>
          </div>
        ) : (
          <button className="btn btn--danger" onClick={() => setShowResetConfirm(true)}>
            🗑️ {t('settings.resetProgress')}
          </button>
        )}
      </div>
    </div>
  );
}
