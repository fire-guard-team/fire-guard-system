import type { FC } from "react";

type SensorStatus = "normal" | "elevated" | "critical";

interface SensorRow {
  id: string;
  type: string;
  value: string;
  status: SensorStatus;
  timestamp: string;
  sector: string;
}

const statusStyles: Record<SensorStatus, string> = {
  normal: "bg-green-100 text-green-700",
  elevated: "bg-yellow-100 text-yellow-700",
  critical: "bg-red-100 text-red-700",
};

const statusLabels: Record<SensorStatus, string> = {
  normal: "Normal",
  elevated: "Elevated",
  critical: "Critical",
};

interface LiveSensorDataSectionProps {
  sensorData: SensorRow[];
  loading?: boolean;
}

const LiveSensorDataSection: FC<LiveSensorDataSectionProps> = ({
  sensorData = [],
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-border rounded-lg px-5 py-4 shadow-sm h-full">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Live Sensor Data
        </h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-lg px-5 py-4 shadow-sm h-full">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Live Sensor Data
      </h2>

      {sensorData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No sensor data available</p>
          <p className="text-sm mt-1">Please start the simulation to display sensor data</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-border">
                <th className="py-2 pr-4 font-medium">Sensor ID</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Value</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Sector</th>
                <th className="py-2 pr-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {sensorData.map((sensor) => (
                <tr
                  key={sensor.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="py-3 pr-4 font-medium text-gray-900">
                    {sensor.id}
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{sensor.type}</td>
                  <td className="py-3 pr-4 text-gray-900">{sensor.value}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[sensor.status]}`}
                    >
                      {statusLabels[sensor.status]}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{sensor.sector}</td>
                  <td className="py-3 pr-4 text-gray-500">{sensor.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LiveSensorDataSection;
