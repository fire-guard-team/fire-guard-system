import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../utils/api';

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

interface AlertNotification {
  id: string;
  alert: Alert;
  timestamp: number;
}

export const useAlertManager = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load alerts from API
  const loadAlerts = useCallback(async () => {
    try {
      const response = await apiService.getAlerts({ status: 'active' });
      const newAlerts = response.data || [];

      setAlerts(newAlerts);
      setUnreadCount(newAlerts.filter(alert => !alert.acknowledged_at).length);

      // Check for new alerts and create notifications
      checkForNewAlerts(newAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }, []);

  // Check for new alerts and create notifications
  const checkForNewAlerts = useCallback((currentAlerts: Alert[]) => {
    const now = Date.now();
    const recentThreshold = now - (5 * 60 * 1000); // Last 5 minutes

    currentAlerts.forEach(alert => {
      const alertTime = new Date(alert.created_at).getTime();

      // Only show notifications for recent alerts that aren't acknowledged
      if (alertTime > recentThreshold && !alert.acknowledged_at) {
        const existingNotification = notifications.find(n => n.alert.alert_id === alert.alert_id);

        if (!existingNotification) {
          const newNotification: AlertNotification = {
            id: `alert-${alert.alert_id}-${now}`,
            alert,
            timestamp: now
          };

          setNotifications(prev => [...prev, newNotification]);

          // Auto remove notification after 30 seconds for non-critical alerts
          if (alert.alert_level !== 'Critical') {
            setTimeout(() => {
              removeNotification(newNotification.id);
            }, 30000);
          }
        }
      }
    });
  }, [notifications]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: number) => {
    try {
      await apiService.acknowledgeAlert(alertId);

      // Update local state
      setAlerts(prev =>
        prev.map(alert =>
          alert.alert_id === alertId
            ? { ...alert, acknowledged_at: new Date().toISOString() }
            : alert
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));

      // Remove notification
      setNotifications(prev =>
        prev.filter(n => n.alert.alert_id !== alertId)
      );

    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Get alert statistics
  const getAlertStats = useCallback(() => {
    const critical = alerts.filter(a => a.alert_level === 'Critical').length;
    const high = alerts.filter(a => a.alert_level === 'High').length;
    const medium = alerts.filter(a => a.alert_level === 'Medium').length;
    const low = alerts.filter(a => a.alert_level === 'Low').length;

    return { critical, high, medium, low, total: alerts.length, unread: unreadCount };
  }, [alerts, unreadCount]);

  // Poll for new alerts every 30 seconds
  useEffect(() => {
    loadAlerts(); // Initial load

    const interval = setInterval(() => {
      loadAlerts();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [loadAlerts]);

  return {
    alerts,
    notifications,
    unreadCount,
    isLoading,
    loadAlerts,
    acknowledgeAlert,
    removeNotification,
    getAlertStats
  };
};