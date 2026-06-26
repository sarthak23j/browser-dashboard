import { useState, useEffect } from 'react';
import '../styles/Home.css';
import { Link } from 'react-router-dom';
import initialBangs from '../assets/bangs.json';

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bangs, setBangs] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('bangs');
    if (saved) {
      try {
        setBangs(JSON.parse(saved));
      } catch (e) {
        setBangs(initialBangs);
      }
    } else {
      setBangs(initialBangs);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Split search query to check for command / bang alias
    const parts = query.split(/\s+/);
    const command = parts[0].toLowerCase();
    const rest = parts.slice(1).join(' ');

    // Match exact alias
    const matchedBang = bangs.find((b) => b.alias.toLowerCase() === command);

    if (matchedBang) {
      if (rest) {
        const searchUrl = matchedBang.searchurl + encodeURIComponent(rest);
        window.location.href = searchUrl;
      } else {
        window.location.href = matchedBang.baseurl;
      }
    } else {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  };

  // Find active bang for visual feedback
  const getMatchedBang = () => {
    const query = searchQuery.trim();
    if (!query) return null;
    const parts = query.split(/\s+/);
    const command = parts[0].toLowerCase();
    return bangs.find((b) => b.alias.toLowerCase() === command);
  };

  const matchedBang = getMatchedBang();

  return (
    <div className="home-container">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search Google..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <Link to="/bangs" className="settings-btn" aria-label="Settings">
            <svg viewBox="0 0 24 24" className="gear-icon" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </Link>
        </div>
        {matchedBang && (
          <span className="bang-pill">
            <span className="bang-alias">{matchedBang.alias}</span>
            <span className="bang-name">{matchedBang.name.toLowerCase()}</span>
          </span>
        )}
      </form>
    </div>
  );
}

export default Home;
