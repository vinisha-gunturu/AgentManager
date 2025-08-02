import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/dashboard" className="brand-link">
            <h3>Agent Management</h3>
          </Link>
        </div>

        <div className="nav-menu">
          <Link to="/dashboard" className={isActive('/dashboard')}>
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link to="/agents" className={isActive('/agents')}>
            <span className="nav-icon">👥</span>
            Agents
          </Link>
          <Link to="/lists" className={isActive('/lists')}>
            <span className="nav-icon">📋</span>
            Lists
          </Link>
        </div>

        <div className="nav-user">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
