import React, { useEffect, useState } from 'react';
import { getLoginHistory } from '../../api';
import './LoginHistorySection.css';

const LoginHistorySection = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getLoginHistory(userId)
      .then(res => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load login history');
        setLoading(false);
      });
  }, [userId]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      success: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
      blocked_time_restriction: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
      failed_otp: { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
      failed_credentials: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }
    };

    const statusText = {
      success: '✅ Success',
      blocked_time_restriction: '🚫 Time Restricted',
      failed_otp: '⚠️ OTP Failed',
      failed_credentials: '❌ Invalid Credentials'
    };

    return (
      <span 
        style={{
          ...statusStyles[status] || statusStyles.success,
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {statusText[status] || status}
      </span>
    );
  };

  const getAuthMethodBadge = (method) => {
    const methodStyles = {
      password_only: { backgroundColor: '#e2e3e5', color: '#383d41' },
      email_otp: { backgroundColor: '#cce5ff', color: '#004085' },
      phone_otp: { backgroundColor: '#d1ecf1', color: '#0c5460' },
      google_oauth: { backgroundColor: '#f8d7da', color: '#721c24' }
    };

    const methodText = {
      password_only: '🔑 Password',
      email_otp: '📧 Email OTP',
      phone_otp: '📱 Phone OTP',
      google_oauth: '🔍 Google'
    };

    return (
      <span 
        style={{
          ...methodStyles[method] || methodStyles.password_only,
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: 'bold'
        }}
      >
        {methodText[method] || method}
      </span>
    );
  };

  if (loading) return (
    <div className="login-history-loading">
      <div className="spinner"></div>
      Loading login history...
    </div>
  );
  
  if (error) return (
    <div className="login-history-error">
      <span>⚠️ {error}</span>
    </div>
  );
  
  if (!history.length) return (
    <div className="login-history-empty">
      <span>📝 No login history found.</span>
    </div>
  );

  return (
    <div className="login-history-section">
      <h3>🔐 Login History</h3>
      <div className="login-history-stats">
        <div className="stat-item">
          <span className="stat-number">{history.length}</span>
          <span className="stat-label">Total Logins</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {history.filter(h => h.status === 'success').length}
          </span>
          <span className="stat-label">Successful</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {new Set(history.map(h => h.ipAddress)).size}
          </span>
          <span className="stat-label">Unique IPs</span>
        </div>
      </div>
      
      <div className="login-history-table-container">
        <table className="login-history-table">
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Status</th>
              <th>Browser</th>
              <th>OS</th>
              <th>Device</th>
              <th>IP Address</th>
              <th>Auth Method</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, idx) => (
              <tr key={idx} className={`login-row ${entry.status}`}>
                <td className="datetime-cell">
                  <div className="datetime">
                    {new Date(entry.loginTime).toLocaleDateString()}
                  </div>
                  <div className="time">
                    {new Date(entry.loginTime).toLocaleTimeString()}
                  </div>
                </td>
                <td>{getStatusBadge(entry.status)}</td>
                <td className="browser-cell">
                  <span className="browser-name">{entry.browser}</span>
                </td>
                <td className="os-cell">{entry.os}</td>
                <td className="device-cell">
                  <span className={`device-type ${entry.deviceType}`}>
                    {entry.deviceType === 'mobile' ? '📱' : 
                     entry.deviceType === 'tablet' ? '📱' : '💻'} 
                    {entry.deviceType}
                  </span>
                </td>
                <td className="ip-cell">
                  <code>{entry.ipAddress}</code>
                </td>
                <td>{getAuthMethodBadge(entry.authMethod)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoginHistorySection;
