import { Outlet } from 'react-router-dom';
import Calendar from './Calendar';
import Greeting from './Greeting';
import PiMonitor from './PiMonitor';
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
        <div className="center-content-wrapper">
          <Greeting />
          <div className="outlet-scroll-container">
            <Outlet />
          </div>
        </div>
      </main>

      <PiMonitor />
    </div>
  );
}

export default Layout;
