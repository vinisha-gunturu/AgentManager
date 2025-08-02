import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalLists: 0,
    totalItems: 0
  });
  const [recentLists, setRecentLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch agents
      const agentsResponse = await axios.get('/agents');
      const agents = agentsResponse.data.data || [];
      
      // Fetch lists
      const listsResponse = await axios.get('/lists');
      const lists = listsResponse.data.data || [];
      
      // Calculate stats
      const totalItems = lists.reduce((sum, list) => sum + list.totalItems, 0);
      
      setStats({
        totalAgents: agents.length,
        totalLists: lists.length,
        totalItems
      });
      
      // Get recent lists (last 5)
      setRecentLists(lists.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to the Agent Management System</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalAgents}</h3>
            <p>Total Agents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalLists}</h3>
            <p>Lists Uploaded</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalItems}</h3>
            <p>Total Items</p>
          </div>
        </div>
      </div>

      <div className="recent-section">
        <h2>Recent Lists</h2>
        {recentLists.length > 0 ? (
          <div className="recent-lists">
            {recentLists.map((list) => (
              <div key={list.id} className="list-card">
                <div className="list-header">
                  <h4>{list.fileName}</h4>
                  <span className="list-date">
                    {new Date(list.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="list-stats">
                  <span className="list-items">{list.totalItems} items</span>
                  <span className="list-agents">
                    {list.distributedLists.length} agents
                  </span>
                </div>
                <div className="list-uploader">
                  Uploaded by: {list.uploadedBy}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No lists uploaded yet. Start by uploading your first CSV file!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
