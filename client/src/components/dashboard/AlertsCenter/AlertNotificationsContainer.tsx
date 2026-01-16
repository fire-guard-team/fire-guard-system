import React from 'react';
import AlertNotification from './AlertNotification';

interface Alert {
  alert_id: number;
  alert_level: "Low" | "Medium" | "High" | "Critical";
  alert_type: string;
  sector?: {
    sector_id: number;
    name: string;
  } | null;
  sensor?: {
    sensor_id: number;
    name: string;
  } | null;
  created_at: string;
  acknowledged_at: string | null;
}

interface AlertNotificationsContainerProps {
  notifications: Array<{
    id: string;
    alert: Alert;
    timestamp: number;
  }>;
  onAcknowledge: (alertId: number) => void;
  onDismiss: (notificationId: string) => void;
}

const AlertNotificationsContainer: React.FC<AlertNotificationsContainerProps> = ({
  notifications,
  onAcknowledge,
  onDismiss
}) => {
  if (notifications.length === 0) {
    return null;
  }

  // Sort notifications by priority (Critical first, then High, etc.)
  const sortedNotifications = [...notifications].sort((a, b) => {
    const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    const aPriority = priorityOrder[a.alert.alert_level] || 0;
    const bPriority = priorityOrder[b.alert.alert_level] || 0;
    return bPriority - aPriority;
  });

  return (
    <>
      {sortedNotifications.map(notification => (
        <AlertNotification
          key={notification.id}
          alert={notification.alert}
          onAcknowledge={onAcknowledge}
          onDismiss={() => onDismiss(notification.id)}
          autoClose={notification.alert.alert_level !== 'Critical'}
          autoCloseDelay={notification.alert.alert_level === 'Critical' ? 0 : 15000}
        />
      ))}
    </>
  );
};

export default AlertNotificationsContainer;