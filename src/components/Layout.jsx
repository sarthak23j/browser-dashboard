import { Outlet } from 'react-router-dom';
import Calendar from './Calendar';
import { applyThemeSettings, getThemeSettings } from '../services/themeSettings';
import { applyStoredBgImage } from '../services/bgImageStorage';
import '../styles/Layout.css';

import { useEffect } from 'react';

function Layout() {
  useEffect(() => {
    try {
      applyThemeSettings(getThemeSettings());
      applyStoredBgImage();
    } catch {
      // localStorage corrupted or unavailable — CSS variable defaults remain active
    }
  }, []);

  return (
    <div className="layout-container">
      <header className="layout-header">
        <Calendar />
      </header>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
