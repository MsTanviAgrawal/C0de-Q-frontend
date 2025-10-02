export const requestNotificationPermission = () => {
  if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
          if (permission !== "granted") {
              localStorage.setItem("notificationsEnabled", "false");
          }
      });
  }
};

export const showNotification = (title, body) => {
  const isEnabled = localStorage.getItem("notificationsEnabled") === "true";

  if (!isEnabled) return;

  if (Notification.permission === "granted") {
      new Notification(title, { body });
  }
};
