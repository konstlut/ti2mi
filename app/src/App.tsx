import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import MainMenu from './screens/MainMenu';
import ThemeSelect from './screens/ThemeSelect';
import GameScreen from './screens/GameScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import { loadProfile } from './store/profileStore';
import './styles/global.css';

function GameScreenWrapper() {
  const location = useLocation();
  return <GameScreen key={location.key} />;
}

function applyColorScheme() {
  const profile = loadProfile();
  document.documentElement.setAttribute('data-theme', profile.colorScheme || 'sunset');
}

export default function App() {
  useEffect(() => { applyColorScheme(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/themes" element={<ThemeSelect />} />
        <Route path="/play/:themeId" element={<GameScreenWrapper />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
