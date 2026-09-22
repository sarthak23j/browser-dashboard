import { useState, useEffect } from 'react';
import '../styles/Bangs.css';
import { BangsStorage } from '../services/bangsStorage';

function Bangs() {
  const [bangs, setBangs] = useState([]);
  const [selectedBang, setSelectedBang] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    searchurl: '',
    baseurl: ''
  });

  // Load bangs from localStorage on mount
  useEffect(() => {
    setBangs(BangsStorage.getBangs());
  }, []);

  const handleCardClick = (bang) => {
    setSelectedBang(bang);
    setFormData({ ...bang });
    setIsEditing(false);
    setError(null);
  };

  const handleCloseModal = () => {
    setSelectedBang(null);
    setIsCreating(false);
    setIsEditing(false);
    setError(null);
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
    const json = BangsStorage.exportJson();
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
    // Reset the input so the same file can be re-imported if needed
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error('Expected a JSON array.');
        // Validate each entry has the required fields
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

  return (
    <div className="bangs-container">
      <div className="bangs-header">
        <h2 className="bangs-title">My Bangs</h2>
        <div className="bangs-header-actions">
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

      <div className="bangs-grid">
        {bangs.map((bang) => (
          <div key={bang.alias} className="bang-card" onClick={() => handleCardClick(bang)}>
            <p className="bang-card-name">{bang.name}</p>
            <p className="bang-card-alias">{bang.alias}</p>
          </div>
        ))}
      </div>

      {/* Details / Edit Modal */}
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

export default Bangs;
