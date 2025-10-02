import React, { useEffect, useState } from 'react';
import { requestNotificationPermission } from '../../Utils/Notification';

const NotificationToggle = () => {
  const [enabled, setEnabled] = useState(
    localStorage.getItem("notificationsEnabled") === "true"
  );

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem("notificationsEnabled", newValue);
    if (newValue) {
      requestNotificationPermission();
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h4>Browser Notifications</h4>
      <label>
        <input type="checkbox" checked={enabled} onChange={handleToggle} />
        Enable Notifications
      </label>
    </div>
  );
};

export default NotificationToggle;
