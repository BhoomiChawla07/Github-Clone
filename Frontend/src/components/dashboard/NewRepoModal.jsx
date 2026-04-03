import React, { useState } from 'react';
import './Dashboard.css';

const NewRepoModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Repository name is required.');
      return;
    }

    onCreate({ name: name.trim(), description: description.trim(), visibility });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          <h2>Create a new repository</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="modal-error">{error}</div>}
          <label className="modal-label">
            Repository name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="modal-input"
              placeholder="e.g. my-awesome-repo"
              autoFocus
            />
          </label>
          <label className="modal-label">
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="modal-textarea"
              placeholder="Add a short description"
            />
          </label>
          <div className="modal-row">
            <label className="modal-radio">
              <input
                type="radio"
                checked={visibility === true}
                onChange={() => setVisibility(true)}
              />
              Public
            </label>
            <label className="modal-radio">
              <input
                type="radio"
                checked={visibility === false}
                onChange={() => setVisibility(false)}
              />
              Private
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-primary">
              Create repository
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRepoModal;
