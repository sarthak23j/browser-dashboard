import { useState, useEffect } from 'react';
import initialBangs from '../assets/bangs.json';
import '../styles/Bangs.css';

function Bangs() {
  const [bangs, setBangs] = useState([]);
  const [selectedBang, setSelectedBang] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    searchurl: '',
    baseurl: ''
  });

  // Load initial data
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
      localStorage.setItem('bangs', JSON.stringify(initialBangs));
    }
  }, []);

  // Save updates
  const saveBangs = (newList) => {
    setBangs(newList);
    localStorage.setItem('bangs', JSON.stringify(newList));
  };

  const handleCardClick = (bang) => {
    setSelectedBang(bang);
    setFormData({ ...bang });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setSelectedBang(null);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.alias || !formData.searchurl || !formData.baseurl) return;

    const newList = bangs.map((b) => (b.alias === selectedBang.alias ? formData : b));
    saveBangs(newList);
    setSelectedBang(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    const newList = bangs.filter((b) => b.alias !== selectedBang.alias);
    saveBangs(newList);
    handleCloseModal();
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.alias || !formData.searchurl || !formData.baseurl) return;

    // Avoid duplicate aliases
    if (bangs.some((b) => b.alias === formData.alias)) {
      alert('A bang with this alias already exists!');
      return;
    }

    const newList = [...bangs, formData];
    saveBangs(newList);
    handleCloseModal();
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      alias: '',
      searchurl: '',
      baseurl: ''
    });
    setIsCreating(true);
  };

  return (
    <div className="bangs-container">
      <div className="bangs-header">
        <h2 className="bangs-title">My Bangs</h2>
        <button className="add-btn" onClick={openCreateModal} aria-label="Add Bang">
          <svg viewBox="0 0 24 24" className="plus-icon" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
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
