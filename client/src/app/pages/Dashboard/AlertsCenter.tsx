import { useState, useEffect } from "react";
import AlertsDeatils from "../../../components/dashboard/AlertsCenter/AlertsDeatils";
import FilterAlerts from "../../../components/dashboard/AlertsCenter/FilterAlerts";
import RecentAlerts from "../../../components/dashboard/AlertsCenter/RecentAlerts";
import TriggerConditions from "../../../components/dashboard/AlertsCenter/TriggerConditions";
import AlertNotificationsContainer from "../../../components/dashboard/AlertsCenter/AlertNotificationsContainer";
import { apiService } from "../../../utils/api";
import { useAlertManager } from "../../../hooks/useAlertManager";

interface Alert {
  alert_id: number;
  event_id: number | null;
  sector_id: number | null;
  sensor_id: number | null;
  alert_source: string;
  alert_level: "Low" | "Medium" | "High" | "Critical";
  alert_type: string;
  meta: any;
  created_at: string;
  acknowledged_at: string | null;
  acknowledged_by: number | null;
  status: string;
  sector?: {
    sector_id: number;
    name: string;
  } | null;
  sensor?: {
    sensor_id: number;
    name: string;
  } | null;
  event?: any;
}

interface AlertFilters {
  status?: "active" | "acknowledged" | "";
  level?: "Low" | "Medium" | "High" | "Critical" | "";
}

const AlertsCenter = () => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filters, setFilters] = useState<AlertFilters>({
    status: "",
    level: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const {
    alerts,
    notifications,
    acknowledgeAlert,
    removeNotification,
    loadAlerts
  } = useAlertManager();

  useEffect(() => {
    loadAlerts();
  }, [filters, currentPage, loadAlerts]);

  const handleFilterChange = (newFilters: AlertFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleAlertSelect = async (alertId: number) => {
    try {
      const alert = await apiService.getAlert(alertId);
      setSelectedAlert(alert);
    } catch (error) {
      console.error("Error loading alert details:", error);
    }
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      await acknowledgeAlert(alertId);
      if (selectedAlert?.alert_id === alertId) {
        const updatedAlert = await apiService.getAlert(alertId);
        setSelectedAlert(updatedAlert);
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  const handleNotificationDismiss = (notificationId: string) => {
    removeNotification(notificationId);
  };

  return (
    <>
      {/* Alert Notifications */}
      <AlertNotificationsContainer
        notifications={notifications}
        onAcknowledge={handleAcknowledge}
        onDismiss={handleNotificationDismiss}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] gap-6">
        <div className="flex flex-col gap-6">
          <FilterAlerts
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <RecentAlerts
            alerts={alerts}
            loading={false}
            onAlertSelect={handleAlertSelect}
            selectedAlertId={selectedAlert?.alert_id}
          />
        </div>

        <div className="flex flex-col gap-6">
        <AlertsDeatils
          alert={selectedAlert}
          onAcknowledge={handleAcknowledge}
        />
        <TriggerConditions alert={selectedAlert} />
      </div>
    </div>
    </>
  );
};

export default AlertsCenter;
