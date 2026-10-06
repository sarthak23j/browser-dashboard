import { Outlet } from 'react-router-dom';
import Calendar from './Calendar';
import { applyThemeSettings, getThemeSettings } from '../services/themeSettings';
import { applyStoredBgImage } from '../services/bgImageStorage';
import '../styles/Layout.css';

import { useEffect } from 'react';

function Layout() {
  useEffect(() => {
    applyThemeSettings(getThemeSettings());
    applyStoredBgImage();
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
