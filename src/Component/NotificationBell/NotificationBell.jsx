import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../../api/index';
import './NotificationBell.css';

const NotificationBell = () => {
  const [requests, setRequests] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const { data } = await getPendingFriendRequests();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Poll every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccept = async (requestId) => {
    setLoading(true);
    try {
      await acceptFriendRequest(requestId);
      alert('Friend request accepted!');
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setLoading(true);
    try {
      await rejectFriendRequest(requestId);
      alert('Friend request rejected');
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const count = requests.length;

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className="notification-bell-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {count > 0 && <span className="notification-badge">{count}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Friend Requests</h3>
            {count > 0 && <span className="count-badge">{count} pending</span>}
          </div>

          <div className="notification-list">
            {requests.length === 0 ? (
              <div className="no-notifications">
                <p>No pending friend requests</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request._id} className="notification-item">
                  <div className="notification-user">
                    <div className="user-avatar">
                      {request.from?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <strong>{request.from?.name}</strong>
                      <span>wants to be friends</span>
                      <small>{new Date(request.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                  <div className="notification-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => handleAccept(request._id)}
                      disabled={loading}
                    >
                      ✓ Accept
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleReject(request._id)}
                      disabled={loading}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {count > 3 && (
            <div className="notification-footer">
              <button onClick={() => {
                setShowDropdown(false);
                navigate('/friends/requests');
              }}>
                View All Requests
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
