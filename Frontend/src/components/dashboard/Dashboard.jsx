import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../authContext';
import Navbar from './Navbar';
import RepoCard from './RepoCard';
import NewRepoModal from './NewRepoModal';
import './Dashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://github-clone-scsa.onrender.com';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [repos, setRepos] = useState([]);
  const [issues, setIssues] = useState([]);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('repositories');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '', repository: '' });
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  const showBanner = (message, type = 'info') => {
    setBanner({ message, type });
    window.setTimeout(() => setBanner(null), 4200);
  };

  const fetchRepos = async () => {
    if (!currentUser) return;
    setLoading(true);
    setBanner(null);

    try {
      const res = await axios.get(`${API_BASE}/repository/user/${currentUser}`);
      setRepos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setBanner({ message: 'Unable to load repositories. Try refreshing.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    setBanner(null);

    try {
      const res = await axios.get(`${API_BASE}/issue/all`);
      setIssues(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setBanner({ message: 'Unable to load issues.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`${API_BASE}/userProfile/${currentUser}`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRepos();
      fetchProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    if (tab === 'issues') {
      fetchIssues();
    }
  }, [tab]);

  const filteredRepos = useMemo(() => {
    if (!search.trim()) return repos;
    const query = search.trim().toLowerCase();
    return repos.filter((repo) => {
      return (
        repo.name.toLowerCase().includes(query) ||
        (repo.description || '').toLowerCase().includes(query)
      );
    });
  }, [repos, search]);

  const handleCreateRepo = async (payload) => {
    try {
      await axios.post(`${API_BASE}/createRepository`, {
        ...payload,
        owner: currentUser,
      });
      setModalOpen(false);
      showBanner('Repository created successfully.', 'success');
      fetchRepos();
    } catch (err) {
      console.error(err);
      showBanner(err?.response?.data?.message || 'Unable to create repository.', 'error');
    }
  };

  const handleToggleVisibility = async (repo) => {
    try {
      await axios.patch(`${API_BASE}/repository/toggle/${repo._id}`, {
        visibility: !repo.visibility,
      });
      showBanner(`Visibility updated for ${repo.name}.`, 'success');
      fetchRepos();
    } catch (err) {
      console.error(err);
      showBanner('Failed to update repository visibility.', 'error');
    }
  };

  const handleDeleteRepo = async (repo) => {
    const confirmed = window.confirm(`Delete repository "${repo.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE}/repository/delete/${repo._id}`);
      showBanner(`Deleted ${repo.name}.`, 'success');
      fetchRepos();
    } catch (err) {
      console.error(err);
      showBanner('Failed to delete repository.', 'error');
    }
  };

  const handleCreateIssue = async (payload) => {
    try {
      await axios.post(`${API_BASE}/createIssue`, payload);
      setIssueModalOpen(false);
      showBanner('Issue created successfully.', 'success');
      fetchIssues();
    } catch (err) {
      console.error(err);
      showBanner(err?.response?.data?.message || 'Unable to create issue.', 'error');
    }
  };

  const handleToggleIssueStatus = async (issue) => {
    try {
      const newStatus = issue.status === 'open' ? 'closed' : 'open';
      await axios.put(`${API_BASE}/issue/${issue._id}`, { status: newStatus });
      showBanner(`Issue marked ${newStatus}.`, 'success');
      fetchIssues();
    } catch (err) {
      console.error(err);
      showBanner('Failed to update issue status.', 'error');
    }
  };

  const myRepositoriesLabel = `${filteredRepos.length} ${filteredRepos.length === 1 ? 'repository' : 'repositories'}`;

  return (
    <div className="dashboard">
      <Navbar searchValue={search} onSearch={setSearch} />

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <div className="dashboard-profile">
            <div className="dashboard-avatar" aria-hidden="true">
              {(profile?.username || currentUser || 'U').toString().slice(0, 2).toUpperCase()}
            </div>
            <div className="dashboard-user">
              <div className="dashboard-user-name">{profile?.username || currentUser || 'Guest'}</div>
              <div className="dashboard-user-handle">@{(profile?.username || currentUser || 'anonymous').toString().slice(0, 8)}</div>
            </div>
          </div>

          <div className="dashboard-sidebar-section">
            <div className="sidebar-section-title">Quick links</div>
            <button className="sidebar-link" onClick={() => setTab('repositories')}>
              Repositories
            </button>
            <button className="sidebar-link" onClick={() => setTab('issues')}>
              Issues
            </button>
            <button className="sidebar-link" onClick={() => navigate('/profile')}>
              Profile
            </button>
          </div>
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">{tab === 'repositories' ? 'Your repositories' : 'Your issues'}</h1>
              {tab === 'repositories' && <p className="dashboard-subtitle">{myRepositoriesLabel} — manage them here.</p>}
            </div>
            <button
              className="primary-btn"
              onClick={() => {
                if (tab === 'repositories') {
                  setModalOpen(true);
                } else {
                  setIssueModalOpen(true);
                }
              }}
            >
              {tab === 'repositories' ? 'New repository' : 'New issue'}
            </button>
          </div>

          <div className="dashboard-tabs">
            <button
              className={`dashboard-tab ${tab === 'repositories' ? 'active' : ''}`}
              onClick={() => setTab('repositories')}
            >
              Repositories
            </button>
            <button
              className={`dashboard-tab ${tab === 'issues' ? 'active' : ''}`}
              onClick={() => setTab('issues')}
            >
              Issues
            </button>
          </div>

          {banner && (
            <div className={`dashboard-banner ${banner.type}`}>{banner.message}</div>
          )}

          {tab === 'repositories' ? (
            <section className="repo-grid">
              {loading && <div className="loading">Loading repositories…</div>}
              {!loading && filteredRepos.length === 0 && (
                <div className="empty-state">
                  <h3>No repositories yet</h3>
                  <p>Click "New repository" to start your first one.</p>
                </div>
              )}
              {!loading && filteredRepos.map((repo) => (
                <RepoCard
                  key={repo._id}
                  repo={repo}
                  onToggleVisibility={handleToggleVisibility}
                  onDelete={handleDeleteRepo}
                />
              ))}
            </section>
          ) : (
            <section className="issues-grid">
              {loading && <div className="loading">Loading issues…</div>}
              {!loading && issues.length === 0 && (
                <div className="empty-state">
                  <h3>No issues found</h3>
                  <p>Issues will appear here when someone creates them.</p>
                </div>
              )}
              {!loading && issues.length > 0 && (
                <ul className="issues-list">
                  {issues
                    .filter((issue) => {
                      const issueRepoId = issue.repository?._id || issue.repository;
                      return repos.some((repo) => String(repo._id) === String(issueRepoId));
                    })
                    .map((issue) => {
                      const repoName = issue.repository?.name || issue.repository;
                      return (
                        <li key={issue._id} className="issue-item">
                          <div className="issue-title">{issue.title}</div>
                          <div className="issue-meta">
                            <span className={`issue-status ${issue.status}`}>{issue.status}</span>
                            <span className="issue-repo">Repo: {repoName}</span>
                          </div>
                          <div className="issue-description">{issue.description}</div>
                          <div className="issue-actions">
                            <button
                              className="repo-action"
                              onClick={() => handleToggleIssueStatus(issue)}
                            >
                              Mark {issue.status === 'open' ? 'Closed' : 'Open'}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
            </section>
          )}
        </main>
      </div>

      {modalOpen && (
        <NewRepoModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateRepo}
        />
      )}

      {issueModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <header className="modal-header">
              <h2>Create a new issue</h2>
              <button className="modal-close" onClick={() => setIssueModalOpen(false)} aria-label="Close">
                ×
              </button>
            </header>
            <form
              className="modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newIssue.title.trim()) {
                  showBanner('Issue title is required.', 'error');
                  return;
                }
                if (!newIssue.repository) {
                  showBanner('Please select a repository.', 'error');
                  return;
                }
                handleCreateIssue(newIssue);
              }}
            >
              <label className="modal-label">
                Title
                <input
                  className="modal-input"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  placeholder="Issue title"
                />
              </label>

              <label className="modal-label">
                Description
                <textarea
                  className="modal-textarea"
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  placeholder="Describe the issue"
                />
              </label>

              <label className="modal-label">
                Repository
                <select
                  className="modal-input"
                  value={newIssue.repository}
                  onChange={(e) => setNewIssue({ ...newIssue, repository: e.target.value })}
                >
                  <option value="">Select a repository</option>
                  {repos.map((repo) => (
                    <option key={repo._id} value={repo._id}>
                      {repo.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="modal-secondary" onClick={() => setIssueModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-primary">
                  Create issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
