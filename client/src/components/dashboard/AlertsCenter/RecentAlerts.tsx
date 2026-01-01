type Alert = {
  severity: "Critical" | "High" | "Medium" | "Low";
  timestamp: string;
  sector: string;
  type: string;
};

const severityStyles: Record<Alert["severity"], string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const alerts: Alert[] = [
  {
    severity: "Critical",
    timestamp: "2024-07-26 14:30:15",
    sector: "Sector A1",
    type: "High Temperature",
  },
  {
    severity: "High",
    timestamp: "2024-07-26 14:20:00",
    sector: "Sector B2",
    type: "Smoke Detection",
  },
  {
    severity: "Medium",
    timestamp: "2024-07-26 14:10:30",
    sector: "Sector C3",
    type: "Low Humidity",
  },
  {
    severity: "Low",
    timestamp: "2024-07-26 14:05:00",
    sector: "Sector D4",
    type: "Strong Wind",
  },
  {
    severity: "High",
    timestamp: "2024-07-26 13:55:40",
    sector: "Sector A1",
    type: "High Temperature",
  },
];

const RecentAlerts = () => {
  return (
    <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Recent Alerts</h3>

      <div className="grid grid-cols-4 text-sm font-medium text-gray-500 border-b pb-2">
        <span>Severity</span>
        <span>Timestamp</span>
        <span>Sector</span>
        <span>Type</span>
      </div>

      <div>
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="grid grid-cols-4 items-center py-3 text-sm"
          >
            <span
              className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${severityStyles[alert.severity]}`}
            >
              {alert.severity}
            </span>

            <span className="text-gray-600">{alert.timestamp}</span>
            <span>{alert.sector}</span>
            <span>{alert.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlerts;
