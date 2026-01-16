interface Alert {
  alert_id: number;
  alert_level: "Low" | "Medium" | "High" | "Critical";
  alert_type: string;
  created_at: string;
  sector?: {
    sector_id: number;
    name: string;
  } | null;
  status: string;
}

interface RecentAlertsProps {
  alerts: Alert[];
  loading: boolean;
  onAlertSelect: (alertId: number) => void;
  selectedAlertId?: number | null;
}

const severityStyles: Record<Alert["alert_level"], string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const RecentAlerts = ({ alerts, loading, onAlertSelect, selectedAlertId }: RecentAlertsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Recent Alerts</h3>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No alerts found</div>
      ) : (
        <>
          <div className="grid grid-cols-4 text-sm font-medium text-gray-500 border-b pb-2">
            <span>Severity</span>
            <span>Timestamp</span>
            <span>Sector</span>
            <span>Type</span>
          </div>

          <div>
            {alerts.map((alert) => (
              <div
                key={alert.alert_id}
                onClick={() => onAlertSelect(alert.alert_id)}
                className={`grid grid-cols-4 items-center py-3 text-sm cursor-pointer hover:bg-gray-50 transition ${
                  selectedAlertId === alert.alert_id ? "bg-blue-50" : ""
                }`}
              >
                <span
                  className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${severityStyles[alert.alert_level]}`}
                >
                  {alert.alert_level}
                </span>

                <span className="text-gray-600">{formatDate(alert.created_at)}</span>
                <span>{alert.sector?.name || "N/A"}</span>
                <span>{alert.alert_type}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RecentAlerts;
