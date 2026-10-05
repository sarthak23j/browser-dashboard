import { useState, useEffect, useRef } from 'react';
import '../styles/Home.css';
import '../styles/Bangs.css';
import { BangsStorage } from '../services/bangsStorage';
import { getUserName, setUserName } from '../services/userSettings';
import {
  ACCENT_PRESETS,
  getThemeSettings,
  saveThemeSettings,
} from '../services/themeSettings';
import ColorPicker from '../components/ColorPicker';

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bangs, setBangs] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(
    () => typeof window !== 'undefined' && (window.location.search.includes('settings') || window.location.hash.includes('settings'))
  );

  // Settings panel state (lifted from Bangs.jsx)
  const [selectedBang, setSelectedBang] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [error, setError] = useState(null);
  const [userName, setUserNameValue] = useState('user');
  const [themeSettings, setThemeSettings] = useState(getThemeSettings);
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    searchurl: '',
    baseurl: '',
  });

  const panelRef = useRef(null);

  useEffect(() => {
    setBangs(BangsStorage.getBangs());
    setUserNameValue(getUserName());
  }, []);

  // ── Search logic ──────────────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const parts = query.split(/\s+/);
    const command = parts[0].toLowerCase();
    const rest = parts.slice(1).join(' ');
    const matchedBang = bangs.find((b) => b.alias.toLowerCase() === command);

    if (matchedBang) {
      if (rest) {
        window.location.href = matchedBang.searchurl + encodeURIComponent(rest);
      } else {
        window.location.href = matchedBang.baseurl;
      }
    } else {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  };

  const getMatchedBang = () => {
    const query = searchQuery.trim();
    if (!query) return null;
    const parts = query.split(/\s+/);
    const command = parts[0].toLowerCase();
    return bangs.find((b) => b.alias.toLowerCase() === command);
  };

  const matchedBang = getMatchedBang();

  // ── Settings panel helpers ────────────────────────────────────────────────
  const handleCardClick = (bang) => {
    setSelectedBang(bang);
    setFormData({ ...bang });
    setIsEditing(false);
    setError(null);
  };

  const handleCloseModal = () => {
    setSelectedBang(null);
    setIsCreating(false);
    setIsEditingName(false);
    setIsEditingTheme(false);
    setIsEditing(false);
    setError(null);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    setError(null);
    try {
      setUserNameValue(setUserName(userName));
      setIsEditingName(false);
    } catch {
      setError('Could not save your name in this browser.');
    }
  };

  const updateThemeSettings = (updates) => {
    const nextSettings = { ...themeSettings, ...updates };
    try {
      saveThemeSettings(nextSettings);
      setThemeSettings(nextSettings);
      setError(null);
    } catch {
      setError('Could not save theme settings in this browser.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.alias || !formData.searchurl || !formData.baseurl) return;
    setError(null);
    try {
      const updated = BangsStorage.updateBang(selectedBang.alias, {
        alias: formData.alias,
        name: formData.name,
        searchurl: formData.searchurl,
        baseurl: formData.baseurl,
      });
      setBangs(BangsStorage.getBangs());
      setSelectedBang(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = () => {
    setError(null);
    try {
      BangsStorage.deleteBang(selectedBang.alias);
      setBangs(BangsStorage.getBangs());
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.alias || !formData.searchurl || !formData.baseurl) return;
    setError(null);
    try {
      BangsStorage.createBang(formData);
      setBangs(BangsStorage.getBangs());
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', alias: '', searchurl: '', baseurl: '' });
    setError(null);
    setIsCreating(true);
  };

  const handleExport = () => {
    const json = JSON.stringify(bangs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bangs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error('Expected a JSON array.');
        for (const b of parsed) {
          if (!b.alias || !b.name || !b.searchurl || !b.baseurl) {
            throw new Error(`Entry missing required fields: ${JSON.stringify(b)}`);
          }
        }
        BangsStorage.importBangs(parsed);
        setBangs(BangsStorage.getBangs());
      } catch (err) {
        alert(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="home-container">
      <div className="home-inner">
        {/* Search bar row */}
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
            <button
              type="button"
              className={`settings-btn${settingsOpen ? ' is-active' : ''}`}
              aria-label={settingsOpen ? 'Close settings' : 'Open settings'}
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" className="gear-icon" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
            </button>
          </div>
          {matchedBang && (
            <span className="bang-pill">
              <span className="bang-alias">{matchedBang.alias}</span>
              <span className="bang-name">{matchedBang.name}</span>
            </span>
          )}
        </form>

        {/* Inline settings panel */}
        <div
          ref={panelRef}
          className={`settings-panel${settingsOpen ? ' settings-panel--open' : ''}`}
          aria-hidden={!settingsOpen}
        >
          <div className="settings-panel-inner">
            {/* Panel header */}
            <div className="bangs-header">
              <h2 className="bangs-title">Settings</h2>
              <div className="bangs-header-actions">
                <button
                  className="export-btn"
                  onClick={() => {
                    setUserNameValue(getUserName());
                    setError(null);
                    setIsEditingName(true);
                  }}
                  aria-label="Edit your name"
                  title="Edit name"
                >
                  <svg viewBox="0 0 24 24" className="export-icon" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </button>
                <button
                  className="export-btn"
                  onClick={() => {
                    setThemeSettings(getThemeSettings());
                    setError(null);
                    setIsEditingTheme(true);
                  }}
                  aria-label="Customize theme"
                  title="Customize theme"
                >
                  <svg viewBox="0 0 24 24" className="export-icon" fill="currentColor">
                    <path d="M19.14 12.94c.04-.3.06-.61.07-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.59-.22l-2.39.96a7.2 7.2 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.48-.41h-3.84a.5.5 0 0 0-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.5.5 0 0 0-.59.22L2.74 8.87a.5.5 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.5.5 0 0 0-.12.61l1.92 3.32a.5.5 0 0 0 .59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54a.5.5 0 0 0 .48.41h3.84a.5.5 0 0 0 .47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96a.5.5 0 0 0 .59-.22l1.92-3.32a.5.5 0 0 0-.12-.61zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z" />
                  </svg>
                </button>
                {/* Hidden file input for JSON import */}
                <input
                  id="import-file-input"
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={handleImport}
                />
                <button
                  className="export-btn"
                  onClick={() => document.getElementById('import-file-input').click()}
                  aria-label="Import bangs from JSON"
                  title="Import JSON"
                >
                  <svg viewBox="0 0 24 24" className="export-icon" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5v-2z" transform="scale(1,-1) translate(0,-24)" />
                  </svg>
                </button>
                <button className="export-btn" onClick={handleExport} aria-label="Export bangs as JSON" title="Export JSON">
                  <svg viewBox="0 0 24 24" className="export-icon" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5v-2z" />
                  </svg>
                </button>
                <button className="add-btn" onClick={openCreateModal} aria-label="Add Bang">
                  <svg viewBox="0 0 24 24" className="plus-icon" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </button>
              </div>
            </div>

            <h3 className="settings-section-title">Search shortcuts</h3>
            <div className="bangs-grid">
              {bangs.map((bang) => (
                <div key={bang.alias} className="bang-card" onClick={() => handleCardClick(bang)}>
                  <p className="bang-card-name">{bang.name}</p>
                  <p className="bang-card-alias">{bang.alias}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals (rendered outside the panel so they stay full-screen) ── */}
      {isEditingName && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Close name editor">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
            {error && <p className="modal-error" role="alert">{error}</p>}
            <form onSubmit={handleNameSubmit} className="bang-form">
              <h3>Edit your name</h3>
              <div className="form-group">
                <label htmlFor="user-name">Name</label>
                <input
                  id="user-name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserNameValue(e.target.value)}
                  maxLength={40}
                  autoFocus
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Save name</button>
            </form>
          </div>
        </div>
      )}

      {isEditingTheme && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content theme-settings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Close theme settings">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
            <h3>Customize theme</h3>
            <p className="theme-settings-hint">Changes are saved on this device as you make them.</p>
            {error && <p className="modal-error" role="alert">{error}</p>}
            <fieldset className="theme-setting-group">
              <legend>Backdrop</legend>
              <div className="backdrop-options">
                {['dark', 'light'].map((backdrop) => (
                  <button
                    key={backdrop}
                    type="button"
                    className={`backdrop-option${themeSettings.backdrop === backdrop ? ' is-selected' : ''}`}
                    aria-pressed={themeSettings.backdrop === backdrop}
                    onClick={() => updateThemeSettings({ backdrop })}
                  >
                    <span className={`backdrop-preview backdrop-preview-${backdrop}`} />
                    {backdrop === 'dark' ? 'Dark' : 'Light'}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="theme-setting-group">
              <legend>Accent color</legend>
              <div className="accent-presets">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className={`accent-preset${themeSettings.accent.toLowerCase() === preset.value ? ' is-selected' : ''}`}
                    style={{ '--preset-color': preset.value }}
                    aria-label={`${preset.name} accent`}
                    aria-pressed={themeSettings.accent.toLowerCase() === preset.value}
                    title={preset.name}
                    onClick={() => updateThemeSettings({ accent: preset.value })}
                  />
                ))}
                <ColorPicker
                  value={themeSettings.accent}
                  onChange={(accent) => updateThemeSettings({ accent })}
                />
              </div>
            </fieldset>
          </div>
        </div>
      )}

      {(selectedBang || isCreating) && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>

            {error && <p className="modal-error">{error}</p>}

            {isCreating ? (
              <form onSubmit={handleCreateSubmit} className="bang-form">
                <h3>Create New Bang</h3>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. YouTube" required />
                </div>
                <div className="form-group">
                  <label>Alias</label>
                  <input type="text" name="alias" value={formData.alias} onChange={handleInputChange} placeholder="e.g. y" required />
                </div>
                <div className="form-group">
                  <label>Search URL</label>
                  <input type="url" name="searchurl" value={formData.searchurl} onChange={handleInputChange} placeholder="e.g. https://www.youtube.com/results?search_query=" required />
                </div>
                <div className="form-group">
                  <label>Base URL</label>
                  <input type="url" name="baseurl" value={formData.baseurl} onChange={handleInputChange} placeholder="e.g. https://www.youtube.com" required />
                </div>
                <button type="submit" className="submit-btn">Create</button>
              </form>
            ) : isEditing ? (
              <form onSubmit={handleEditSubmit} className="bang-form">
                <h3>Edit Bang</h3>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Alias</label>
                  <input type="text" name="alias" value={formData.alias} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Search URL</label>
                  <input type="url" name="searchurl" value={formData.searchurl} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Base URL</label>
                  <input type="url" name="baseurl" value={formData.baseurl} onChange={handleInputChange} required />
                </div>
                <div className="modal-actions-container">
                  <button type="button" className="delete-btn" onClick={handleDelete}>Delete</button>
                  <button type="submit" className="submit-btn">Save Changes</button>
                </div>
              </form>
            ) : (
              <div className="bang-details">
                <h3>{selectedBang.name}</h3>
                <div className="details-grid">
                  <div className="details-row">
                    <span className="details-label">Alias:</span>
                    <span className="details-val">{selectedBang.alias}</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Base URL:</span>
                    <a href={selectedBang.baseurl} target="_blank" rel="noreferrer" className="details-val link-val">{selectedBang.baseurl}</a>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Search URL:</span>
                    <span className="details-val code-val">{selectedBang.searchurl}</span>
                  </div>
                </div>
                <div className="modal-actions-container">
                  <button className="delete-btn icon-btn" onClick={handleDelete} aria-label="Delete">
                    <svg viewBox="0 0 24 24" className="action-icon" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                  <button className="edit-btn icon-btn" onClick={() => setIsEditing(true)} aria-label="Edit">
                    <svg viewBox="0 0 24 24" className="action-icon" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
