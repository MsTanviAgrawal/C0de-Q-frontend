import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getLoginHistory } from '../../api';
import './LoginHistory.css';

const LoginHistory = () => {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.currentuserreducer);

    useEffect(() => {
        fetchLoginHistory();
        fetchLoginStats();
    }, []);

    const fetchLoginHistory = async () => {
        if (!user?.result?._id) return;
        
        try {
            const { data } = await getLoginHistory(user.result._id);
            setHistory(data.data || []);
        } catch (error) {
            console.error('Error fetching login history:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLoginStats = async () => {
        if (!user?.result?._id) return;
        
        try {
            const { data } = await getLoginHistory(user.result._id);
            // Calculate stats from data
            const totalLogins = data.data.filter(l => l.success).length;
            const failedLogins = data.data.filter(l => !l.success).length;
            const uniqueDevices = [...new Set(data.data.map(l => l.deviceType))];
            const uniqueBrowsers = [...new Set(data.data.map(l => l.browser))];
            
            setStats({
                totalLogins,
                failedLogins,
                uniqueDevices,
                uniqueBrowsers,
                lastLogin: data.data[0]
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDeviceIcon = (deviceType) => {
        switch(deviceType) {
            case 'mobile': return '📱';
            case 'tablet': return '📱';
            case 'desktop': return '🖥️';
            case 'laptop': return '💻';
            default: return '🖥️';
        }
    };

    const getBrowserIcon = (browser) => {
        if (browser.includes('Chrome')) return '🌐';
        if (browser.includes('Edge')) return '🔷';
        if (browser.includes('Firefox')) return '🦊';
        if (browser.includes('Safari')) return '🧭';
        return '🌐';
    };

    if (loading) {
        return <div className="login-history-container">Loading...</div>;
    }

    return (
        <div className="login-history-container">
            <h1>🔐 Login History</h1>
            
            {/* Statistics Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{stats.totalLogins}</div>
                        <div className="stat-label">Total Logins</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">❌</div>
                        <div className="stat-value">{stats.failedLogins}</div>
                        <div className="stat-label">Failed Attempts</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📱</div>
                        <div className="stat-value">{stats.uniqueDevices.length}</div>
                        <div className="stat-label">Device Types</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🌐</div>
                        <div className="stat-value">{stats.uniqueBrowsers.length}</div>
                        <div className="stat-label">Browsers Used</div>
                    </div>
                </div>
            )}

            {/* Login History Table */}
            <div className="history-table-container">
                <h2>Recent Login Activity</h2>
                
                {history.length === 0 ? (
                    <p className="no-history">No login history available</p>
                ) : (
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Device</th>
                                <th>Browser</th>
                                <th>OS</th>
                                <th>IP Address</th>
                                <th>Method</th>
                                <th>OTP Required</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item, index) => (
                                <tr key={index} className={item.success ? 'success' : 'failed'}>
                                    <td>{formatDate(item.loginTime)}</td>
                                    <td>
                                        {getDeviceIcon(item.deviceType)} {item.deviceType}
                                    </td>
                                    <td>
                                        {getBrowserIcon(item.browser)} {item.browser}
                                    </td>
                                    <td>{item.os}</td>
                                    <td className="ip-address">{item.ipAddress}</td>
                                    <td>
                                        <span className={`method-badge ${item.loginMethod}`}>
                                            {item.loginMethod === 'email' && '📧'}
                                            {item.loginMethod === 'phone' && '📱'}
                                            {item.loginMethod === 'google' && '🔐'}
                                            {' '}{item.loginMethod}
                                        </span>
                                    </td>
                                    <td>
                                        {item.requireOtp ? 
                                            <span className="badge otp-required">Yes</span> : 
                                            <span className="badge otp-not-required">No</span>
                                        }
                                    </td>
                                    <td>
                                        {item.success ? 
                                            <span className="status-badge success">✅ Success</span> : 
                                            <span className="status-badge failed">❌ Failed</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Device & Browser Info */}
            <div className="info-section">
                <div className="info-card">
                    <h3>🔒 Security Notice</h3>
                    <ul>
                        <li><strong>Chrome Users:</strong> OTP verification required via email</li>
                        <li><strong>Edge Users:</strong> Direct login without OTP</li>
                        <li><strong>Mobile Users:</strong> Access limited to 10 AM - 1 PM</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LoginHistory;
