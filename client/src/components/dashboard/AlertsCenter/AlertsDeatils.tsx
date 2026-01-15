import { MdOutlineNotificationsActive } from "react-icons/md";

interface Alert {
  alert_id: number;
  alert_level: "Low" | "Medium" | "High" | "Critical";
  alert_type: string;
  status: string;
  created_at: string;
  acknowledged_at: string | null;
  sector?: {
    sector_id: number;
    name: string;
  } | null;
  sensor?: {
    sensor_id: number;
    name: string;
  } | null;
}

interface AlertsDeatilsProps {
  alert: Alert | null;
  onAcknowledge: (alertId: number) => void;
}

const levelStyles: Record<Alert["alert_level"], string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusStyles: Record<string, string> = {
  Active: "bg-orange-100 text-orange-700",
  Acknowledged: "bg-green-100 text-green-700",
};

const AlertsDeatils = ({ alert, onAcknowledge }: AlertsDeatilsProps) => {
  if (!alert) {
    return (
      <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
        <h3 className="flex items-center gap-2 font-semibold text-lg mb-4">
          <MdOutlineNotificationsActive className="text-xl" />
          Alert Details
        </h3>
        <div className="text-center py-8 text-gray-500">
          Select an alert to view details
        </div>
      </div>
    );
  }

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 font-semibold text-lg">
          <MdOutlineNotificationsActive className="text-xl" />
          Alert Details
        </h3>
        {alert.status === "Active" && (
          <button
            onClick={() => onAcknowledge(alert.alert_id)}
            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition"
          >
            Acknowledge
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-3">
          <div>
            <p className="text-gray-500">Alert ID:</p>
            <p className="font-medium">#{alert.alert_id}</p>
          </div>

          <div>
            <p className="text-gray-500">Status:</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                statusStyles[alert.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {alert.status}
            </span>
          </div>

          <div>
            <p className="text-gray-500">Created At:</p>
            <p className="font-medium">{formatDate(alert.created_at)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-gray-500">Alert Type:</p>
            <p className="font-medium">{alert.alert_type}</p>
          </div>

          <div>
            <p className="text-gray-500">Severity:</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${levelStyles[alert.alert_level]}`}
            >
              {alert.alert_level}
            </span>
          </div>

          <div>
            <p className="text-gray-500">Sector:</p>
            <p className="font-medium">{alert.sector?.name || "N/A"}</p>
          </div>

          {alert.sensor && (
            <div>
              <p className="text-gray-500">Sensor:</p>
              <p className="font-medium">{alert.sensor.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsDeatils;
