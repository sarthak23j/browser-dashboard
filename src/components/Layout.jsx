import { Outlet } from 'react-router-dom';
import Calendar from './Calendar';
import Greeting from './Greeting';
import '../styles/Layout.css';

function Layout() {
  const changeTheme = (themeName) => {
    if (themeName === 'theme-1') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeName);
    }
  };

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
        <div className="right-themes">
          <button className="theme-btn theme-1" title="Purple Theme" onClick={() => changeTheme('theme-1')}></button>
          <button className="theme-btn theme-2" title="Blue Theme" onClick={() => changeTheme('theme-2')}></button>
          <button className="theme-btn theme-3" title="Emerald Theme" onClick={() => changeTheme('theme-3')}></button>
          <button className="theme-btn theme-4" title="Red Theme" onClick={() => changeTheme('theme-4')}></button>
        </div>
      </main>
    </div>
  );
}

export default Layout;
