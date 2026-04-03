import React from 'react';
import './Dashboard.css';

const RepoCard = ({ repo, onToggleVisibility, onDelete }) => {
  const visibilityLabel = repo?.visibility ? 'Public' : 'Private';

  return (
    <div className="repo-card" key={repo._id}>
      <div className="repo-card-header">
        <div className="repo-card-title">
          <span className="repo-name">{repo.name}</span>
          <span className={`repo-badge ${repo.visibility ? 'public' : 'private'}`}>{visibilityLabel}</span>
        </div>
        <div className="repo-actions">
          <button className="repo-action" onClick={() => onToggleVisibility(repo)}>
            {repo.visibility ? 'Make Private' : 'Make Public'}
          </button>
          <button className="repo-action danger" onClick={() => onDelete(repo)}>
            Delete
          </button>
        </div>
      </div>
      <p className="repo-description">{repo.description || 'No description provided.'}</p>
      <div className="repo-meta">
        <span>{repo.issues?.length ?? 0} issue{repo.issues?.length === 1 ? '' : 's'}</span>
        <span>Owner: {repo.owner?.email || repo.owner?._id || 'You'}</span>
      </div>
    </div>
  );
};

export default RepoCard;
