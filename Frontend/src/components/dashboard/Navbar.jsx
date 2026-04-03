import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../authContext';
import logo from '../../assets/github-mark-white.svg';
import './Navbar.css';

const Navbar = ({ searchValue, onSearch }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="github-navbar">
      <div className="github-navbar-left">
        <button
          type="button"
          className="github-logo-button"
          onClick={() => navigate('/dashboard')}
          aria-label="Go to dashboard"
        >
          <img src={logo} alt="Logo" className="github-logo-img" />
        </button>

        <nav className="github-nav">
          <button type="button" className="github-nav-item" onClick={() => navigate('/dashboard')}>
            Pull requests
          </button>
          <button type="button" className="github-nav-item" onClick={() => navigate('/dashboard')}>
            Issues
          </button>
          <button type="button" className="github-nav-item" onClick={() => navigate('/dashboard')}>
            Marketplace
          </button>
          <button type="button" className="github-nav-item" onClick={() => navigate('/dashboard')}>
            Explore
          </button>
        </nav>
      </div>

      <div className="github-navbar-search">
        <span className="github-search-icon">🔍</span>
        <input
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className="github-search-input"
          placeholder="Search or jump to…"
          aria-label="Search repositories"
        />
      </div>

      <div className="github-navbar-right">
        <button type="button" className="github-new-btn" onClick={() => navigate('/dashboard')}>
          New
        </button>
        <button type="button" className="github-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
