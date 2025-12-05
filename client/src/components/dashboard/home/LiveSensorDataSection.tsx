import type { FC } from "react";

type SensorStatus = "normal" | "elevated" | "critical";

interface SensorRow {
  id: string;
  type: string;
  value: string;
  status: SensorStatus;
  timestamp: string;
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

const sensors: SensorRow[] = [
  {
    id: "S001",
    type: "Temperature",
    value: "32.5 °C",
    status: "elevated",
    timestamp: "2023-10-27 10:30:05",
  },
  {
    id: "S002",
    type: "Humidity",
    value: "45 %",
    status: "normal",
    timestamp: "2023-10-27 10:28:55",
  },
  {
    id: "S003",
    type: "Wind Speed",
    value: "15.2 km/h",
    status: "elevated",
    timestamp: "2023-10-27 10:28:45",
  },
  {
    id: "S004",
    type: "Smoke Level",
    value: "0.8 ppm",
    status: "critical",
    timestamp: "2023-10-27 10:29:30",
  },
];

const LiveSensorDataSection: FC = () => {
  return (
    <div className="bg-white border border-border rounded-lg px-5 py-4 shadow-sm h-full">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Live Sensor Data
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-border">
              <th className="py-2 pr-4 font-medium">Sensor ID</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 pr-4 font-medium">Value</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((sensor) => (
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
                <td className="py-3 pr-4 text-gray-500">{sensor.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveSensorDataSection;
