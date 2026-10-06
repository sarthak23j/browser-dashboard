import { Outlet } from 'react-router-dom';
import Calendar from './Calendar';
import { applyThemeSettings, getThemeSettings } from '../services/themeSettings';
import '../styles/Layout.css';

import { useEffect } from 'react';

function Layout() {
  useEffect(() => {
    applyThemeSettings(getThemeSettings());
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
