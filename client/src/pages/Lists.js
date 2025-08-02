import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Lists.css';

const Lists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/lists');
      setLists(response.data.data || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['csv', 'xls', 'xlsx'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setUploadError('Please select a CSV, XLS, or XLSX file');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/lists/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
      
      // Refresh lists
      await fetchLists();
      
      alert('File uploaded and distributed successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed';
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleViewDetails = async (listId) => {
    try {
      const response = await axios.get(`/lists/${listId}`);
      setSelectedList(response.data.data);
      setShowDetails(true);
    } catch (error) {
      alert('Error fetching list details: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list?')) {
      return;
    }

    try {
      await axios.delete(`/lists/${listId}`);
      await fetchLists();
    } catch (error) {
      alert('Error deleting list: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="lists-container">
        <div className="loading">Loading lists...</div>
      </div>
    );
  }

  return (
    <div className="lists-container">
      <div className="lists-header">
        <h1>Lists Management</h1>
        <p>Upload CSV/Excel files and distribute among agents</p>
      </div>

      <div className="upload-section">
        <div className="upload-card">
          <h3>Upload New List</h3>
          <div className="upload-form">
            <div className="file-input-wrapper">
              <input
                type="file"
                id="file-input"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <label htmlFor="file-input" className="file-input-label">
                {selectedFile ? selectedFile.name : 'Choose CSV, XLS, or XLSX file'}
              </label>
            </div>
            
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="upload-btn"
            >
              {uploading ? 'Uploading...' : 'Upload & Distribute'}
            </button>
          </div>
          
          {uploadError && (
            <div className="error-message">{uploadError}</div>
          )}
          
          <div className="upload-info">
            <h4>File Requirements:</h4>
            <ul>
              <li>Supported formats: CSV, XLS, XLSX</li>
              <li>Maximum file size: 5MB</li>
              <li>Required columns: FirstName, Phone, Notes (case insensitive)</li>
              <li>Files will be automatically distributed among active agents</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="lists-section">
        <h2>Uploaded Lists ({lists.length})</h2>
        
        {lists.length > 0 ? (
          <div className="lists-grid">
            {lists.map((list) => (
              <div key={list.id} className="list-card">
                <div className="list-header">
                  <h4>{list.fileName}</h4>
                  <div className="list-actions">
                    <button
                      onClick={() => handleViewDetails(list.id)}
                      className="view-btn"
                      title="View details"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="delete-btn"
                      title="Delete list"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="list-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Items:</span>
                    <span className="stat-value">{list.totalItems}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Agents:</span>
                    <span className="stat-value">{list.distributedLists.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Uploaded:</span>
                    <span className="stat-value">
                      {new Date(list.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">By:</span>
                    <span className="stat-value">{list.uploadedBy}</span>
                  </div>
                </div>

                <div className="agent-distribution">
                  <h5>Distribution:</h5>
                  {list.distributedLists.map((dist, index) => (
                    <div key={index} className="agent-dist">
                      <span className="agent-name">{dist.agent.name}</span>
                      <span className="agent-count">{dist.itemCount} items</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No lists uploaded yet. Upload your first CSV file to get started!</p>
          </div>
        )}
      </div>

      {showDetails && selectedList && (
        <div className="details-modal">
          <div className="details-overlay" onClick={() => setShowDetails(false)}></div>
          <div className="details-container">
            <div className="details-header">
              <h3>List Details: {selectedList.fileName}</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="details-content">
              <div className="details-summary">
                <div className="summary-item">
                  <strong>Total Items:</strong> {selectedList.totalItems}
                </div>
                <div className="summary-item">
                  <strong>Uploaded:</strong> {new Date(selectedList.uploadedAt).toLocaleDateString()}
                </div>
                <div className="summary-item">
                  <strong>Uploaded By:</strong> {selectedList.uploadedBy}
                </div>
              </div>

              <div className="agent-details">
                {selectedList.distributedLists.map((dist, index) => (
                  <div key={index} className="agent-section">
                    <div className="agent-info">
                      <h4>{dist.agent.name}</h4>
                      <p>Email: {dist.agent.email}</p>
                      <p>Mobile: {dist.agent.mobile}</p>
                      <p>Assigned Items: {dist.itemCount}</p>
                    </div>
                    
                    <div className="items-list">
                      <h5>Items:</h5>
                      <div className="items-table">
                        <div className="table-header">
                          <span>First Name</span>
                          <span>Phone</span>
                          <span>Notes</span>
                        </div>
                        {dist.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="table-row">
                            <span>{item.firstName}</span>
                            <span>{item.phone}</span>
                            <span>{item.notes || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lists;
