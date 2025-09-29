// Simple notification system that doesn't depend on React hooks
// Can be used anywhere in the app

let notificationContainer = null;

const createNotificationContainer = () => {
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(notificationContainer);
  }
  return notificationContainer;
};

const createNotification = (message, type = 'info', duration = 3000) => {
  const container = createNotificationContainer();
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 15px 20px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-left: 4px solid ${getTypeColor(type)};
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 400px;
    pointer-events: auto;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
  `;
  
  const icon = getTypeIcon(type);
  const iconElement = document.createElement('span');
  iconElement.textContent = icon;
  iconElement.style.fontSize = '18px';
  
  const messageElement = document.createElement('span');
  messageElement.textContent = message;
  messageElement.style.cssText = 'flex: 1; color: #374151; font-size: 14px; line-height: 1.4;';
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    background: none;
    border: none;
    font-size: 18px;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    margin-left: 10px;
    width: 20px;
    height: 20px;
  `;
  closeButton.onmouseover = () => closeButton.style.color = '#374151';
  closeButton.onmouseout = () => closeButton.style.color = '#9ca3af';
  
  notification.appendChild(iconElement);
  notification.appendChild(messageElement);
  notification.appendChild(closeButton);
  
  container.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  const remove = () => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  };
  
  closeButton.onclick = remove;
  
  // Auto remove
  setTimeout(remove, duration);
};

const getTypeColor = (type) => {
  switch (type) {
    case 'success': return '#10b981';
    case 'error': return '#ef4444';
    case 'warning': return '#f59e0b';
    default: return '#3b82f6';
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
  }
};

export const notify = {
  success: (message, duration) => createNotification(message, 'success', duration),
  error: (message, duration) => createNotification(message, 'error', duration),
  info: (message, duration) => createNotification(message, 'info', duration),
  warning: (message, duration) => createNotification(message, 'warning', duration),
  confirm: (message) => window.confirm(message) // For now, keep using native confirm
};