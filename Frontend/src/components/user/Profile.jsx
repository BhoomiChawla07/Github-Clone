import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../authContext';
import ContributionsHeatmap from './ContributionsHeatmap';
import './Profile.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://github-clone-scsa.onrender.com';

const formatDate = (date) => date.toISOString().slice(0, 10);

const getDateFromObjectId = (id) => {
  try {
    // MongoDB ObjectId contains a timestamp in its first 4 bytes
    return new Date(parseInt(id.substring(0, 8), 16) * 1000);
  } catch {
    return null;
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!currentUser) return;
    fetchProfile();
    fetchRepos();
    fetchFollowers();
    fetchFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/userProfile/${currentUser}`);
      setUser(res.data);
      setEmail(res.data.email || '');
    } catch (err) {
      console.error(err);
      setError('Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepos = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`${API_BASE}/repository/user/${currentUser}`);
      setRepos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFollowers = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`${API_BASE}/user/${currentUser}/followers`);
      setFollowers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFollowing = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`${API_BASE}/user/${currentUser}/following`);
      setFollowing(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const contributions = useMemo(() => {
    const days = 30;
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1));

    const contributionsMap = {};
    for (let i = 0; i < days; i += 1) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      contributionsMap[formatDate(d)] = 0;
    }

    repos.forEach((repo) => {
      const created = getDateFromObjectId(repo._id);
      if (!created) return;
      const key = formatDate(created);
      if (key in contributionsMap) {
        contributionsMap[key] += 1;
      }
    });

    return Object.entries(contributionsMap).map(([date, count]) => ({ date, count }));
  }, [repos]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    setSaving(true);

    try {
      const payload = { email: email.trim() };
      if (password.trim()) payload.password = password.trim();

      await axios.put(`${API_BASE}/updateProfile/${currentUser}`, payload);
      setMessage('Profile updated successfully.');
      setPassword('');
      fetchProfile();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleFollow = async (targetId) => {
    try {
      await axios.post(`${API_BASE}/user/${currentUser}/follow`, { targetId });
      fetchFollowing();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfollow = async (targetId) => {
    try {
      await axios.post(`${API_BASE}/user/${currentUser}/unfollow`, { targetId });
      fetchFollowing();
    } catch (err) {
      console.error(err);
    }
  };

  const displayName = (user?.username || 'User').toString();
  const avatarLetters = displayName.slice(0, 2).toUpperCase() || 'US';
  const handle = `@${(user?.username || 'user').toString().slice(0, 10)}`;


return (
  <div className="profile-page">
    <div className="profile-body">
      {/* Left Sidebar */}
      <div className="profile-sidebar">
        <div className="profile-avatar-large">
          {avatarLetters}
        </div>
        <h1 className="profile-name-large">{displayName}</h1>
        <p className="profile-handle-large">{handle}</p>
        <p className="profile-meta">{user?.email || 'No email provided'}</p>
        
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-number">{repos.length}</span>
            <span className="profile-stat-label">repositories</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-number">{followers.length}</span>
            <span className="profile-stat-label">followers</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-number">{following.length}</span>
            <span className="profile-stat-label">following</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-main">
        {/* Back to dashboard button at top */}
        <div className="profile-top-bar">
          <button className="profile-button" onClick={() => navigate('/dashboard')}>
            ← Back to dashboard
          </button>
        </div>

        {/* Heatmap */}
        <ContributionsHeatmap contributions={contributions} />

        {/* Popular repositories */}
        <div className="repo-section">
          <div className="repo-header">
            <h2>Popular repositories</h2>
          </div>

          {loading && <div>Loading repositories…</div>}
          
          {!loading && repos.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              You don't have any public repositories yet.
            </div>
          )}

          {!loading && repos.length > 0 && (
            <div className="repo-list">
              {repos.map((repo) => (
                <div key={repo._id} className="repo-item">
                  <a href="#" className="repo-name">{repo.name}</a>
                  <p className="repo-description">
                    {repo.description || 'No description'}
                  </p>
                  <div className="repo-meta">
                    <span>⭐ 0</span>
                    <span>⑂ 0</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Account settings */}
        <div className="settings-section">
          <h2>Account settings</h2>
          
          {message && <div className={`message ${message.includes('success') ? 'success' : ''}`}>{message}</div>}
          {error && <div className="message error">{error}</div>}

          <form className="settings-form" onSubmit={handleSave}>
            <div className="settings-field">
              <label>Email address</label>
              <input
                type="email"
                className="settings-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label>New password</label>
              <input
                type="password"
                className="settings-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </div>

            <button 
              type="submit" 
              className="settings-button"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Update profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
)};

export default Profile;