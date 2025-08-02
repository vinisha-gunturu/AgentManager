import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Agents.css';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/agents');
      setAgents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\+\d{1,4}\d{10,}$/.test(formData.mobile)) {
      errors.mobile = 'Mobile number must include country code (e.g., +1234567890)';
    }
    
    if (!editingAgent && !formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const submitData = { ...formData };
      if (editingAgent && !submitData.password) {
        delete submitData.password; // Don't send empty password on edit
      }
      
      if (editingAgent) {
        await axios.put(`/agents/${editingAgent._id}`, submitData);
      } else {
        await axios.post('/agents', submitData);
      }
      
      await fetchAgents();
      resetForm();
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred';
      setFormErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      password: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }
    
    try {
      await axios.delete(`/agents/${agentId}`);
      await fetchAgents();
    } catch (error) {
      alert('Error deleting agent: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: ''
    });
    setFormErrors({});
    setEditingAgent(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="agents-container">
        <div className="loading">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="agents-container">
      <div className="agents-header">
        <h1>Agents Management</h1>
        <button 
          className="add-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Agent
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-overlay" onClick={resetForm}></div>
          <div className="form-container">
            <div className="form-header">
              <h3>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter agent name"
                />
                {formErrors.name && <span className="error">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
                {formErrors.email && <span className="error">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="mobile">Mobile Number *</label>
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter mobile with country code (e.g., +1234567890)"
                />
                {formErrors.mobile && <span className="error">{formErrors.mobile}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password {editingAgent ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                />
                {formErrors.password && <span className="error">{formErrors.password}</span>}
              </div>

              {formErrors.submit && (
                <div className="error-message">{formErrors.submit}</div>
              )}

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="submit-btn">
                  {submitting ? 'Saving...' : (editingAgent ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="agents-list">
        {agents.length > 0 ? (
          <div className="agents-grid">
            {agents.map((agent) => (
              <div key={agent._id} className="agent-card">
                <div className="agent-header">
                  <h3>{agent.name}</h3>
                  <div className="agent-actions">
                    <button 
                      onClick={() => handleEdit(agent)}
                      className="edit-btn"
                      title="Edit agent"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(agent._id)}
                      className="delete-btn"
                      title="Delete agent"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="agent-details">
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{agent.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mobile:</span>
                    <span className="detail-value">{agent.mobile}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No agents found. Create your first agent to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agents;
