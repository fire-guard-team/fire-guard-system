import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { apiService } from "../../../utils/api";
import AddSensorModal from "./AddSensorModal";

interface Sensor {
  sensor_id: number;
  name: string;
  type: string;
  status: string;
  sector?: {
    sector_id: number;
    name: string;
  } | null;
  lat?: number | null;
  lng?: number | null;
  created_at?: string;
  last_seen?: string | null;
  battery_level?: number | null;
}

interface SectorAlphaTempProps {
  sensor: Sensor | null;
  onSensorUpdated?: () => void;
  onSensorDeleted?: (sensorId: number) => void;
}

type DataType = "temperature" | "humidity" | "smoke";
type TimeRange = 24 | 168;

const SectorAlphaTemp = ({ sensor, onSensorUpdated, onSensorDeleted }: SectorAlphaTempProps) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState<DataType>("temperature");
  const [timeRange, setTimeRange] = useState<TimeRange>(24);

  // Get default data type based on sensor type
  const getDefaultDataType = (sensorType: string): DataType => {
    switch (sensorType) {
      case "Temperature":
        return "temperature";
      case "Humidity":
        return "humidity";
      case "Smoke":
        return "smoke";
      case "Multi-sensor":
        return "temperature";
      default:
        return "temperature";
    }
  };

  // Get available data types based on sensor type
  const getAvailableDataTypes = (sensorType: string): DataType[] => {
    switch (sensorType) {
      case "Temperature":
        return ["temperature"];
      case "Humidity":
        return ["humidity"];
      case "Smoke":
        return ["smoke"];
      case "Multi-sensor":
        return ["temperature", "humidity", "smoke"];
      default:
        return ["temperature"];
    }
  };

  // Get Y-axis unit based on data type
  const getYAxisUnit = (dataType: DataType): string => {
    switch (dataType) {
      case "temperature":
        return "°C";
      case "humidity":
        return "%";
      case "smoke":
        return "PPM";
      default:
        return "";
    }
  };

  // Get data type label
  const getDataTypeLabel = (dataType: DataType): string => {
    switch (dataType) {
      case "temperature":
        return "Temperature";
      case "humidity":
        return "Humidity";
      case "smoke":
        return "Smoke";
      default:
        return "";
    }
  };

  // Load telemetry data
  const loadTelemetryData = async () => {
    if (!sensor) {
      setChartData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.getSensorTelemetry(sensor.sensor_id, {
        type: selectedDataType,
        hours: timeRange,
      });

      setChartData(response.data || []);
    } catch (error) {
      console.error("Error loading telemetry data:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when sensor, data type, or time range changes
  useEffect(() => {
    if (sensor) {
      // Set default data type based on sensor type
      const defaultType = getDefaultDataType(sensor.type);
      setSelectedDataType(defaultType);
      loadTelemetryData();
    } else {
      setChartData([]);
    }
  }, [sensor?.sensor_id]);

  // Reload data when data type or time range changes
  useEffect(() => {
    if (sensor) {
      loadTelemetryData();
    }
  }, [selectedDataType, timeRange]);

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      active: { text: "online", className: "bg-green-100 text-green-700" },
      offline: { text: "offline", className: "bg-red-100 text-red-700" },
      faulty: { text: "faulty", className: "bg-orange-100 text-orange-700" },
    };
    return statusMap[status] || { text: status, className: "bg-gray-100 text-gray-700" };
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (!sensor || !onSensorDeleted) return;

    if (!confirm(`Are you sure you want to delete sensor "${sensor.name}"?`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      await onSensorDeleted(sensor.sensor_id);
    } catch (error) {
      console.error("Error deleting sensor:", error);
      alert("Failed to delete sensor. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleSensorUpdated = () => {
    onSensorUpdated?.();
    setEditModalOpen(false);
    loadTelemetryData();
  };

  if (!sensor) {
    return (
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm w-full max-w-2xl space-y-6">
        <div className="text-center py-12 text-gray-500">
          Select a sensor to view details
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(sensor.status);
  const availableDataTypes = getAvailableDataTypes(sensor.type);
  const yAxisUnit = getYAxisUnit(selectedDataType);

  return (
    <>
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm w-full max-w-2xl space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold">
              {sensor.name} (SN-{String(sensor.sensor_id).padStart(3, "0")})
            </h2>
            <p className="text-sm text-gray-500">
              Detailed information and historical data for this sensor.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 border px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-gray-50"
            >
              <FiEdit2 /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-red-600 disabled:opacity-50"
            >
              <FiTrash2 /> {deleteLoading ? "Deleting..." : "Remove"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 text-sm border-b border-border pb-8">
          <p className="text-gray-500">Type</p>
          <p>{sensor.type}</p>

          <p className="text-gray-500">Status</p>
          <span className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.className}`}>
            {statusDisplay.text}
          </span>

          <p className="text-gray-500">Location</p>
          <p>{sensor.sector?.name || "N/A"}</p>

          <p className="text-gray-500">Coordinates</p>
          <p>
            {sensor.lat && sensor.lng ? `${sensor.lat}, ${sensor.lng}` : "N/A"}
          </p>

          <p className="text-gray-500">Installation Date</p>
          <p>{formatDate(sensor.created_at)}</p>

          <p className="text-gray-500">Last Seen</p>
          <p>{sensor.last_seen ? formatDate(sensor.last_seen) : "N/A"}</p>

          {sensor.battery_level !== null && (
            <>
              <p className="text-gray-500">Battery Level</p>
              <p>{sensor.battery_level}%</p>
            </>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="font-semibold text-xl">Historical Data</h3>

          <div className="flex items-center gap-2">
            {availableDataTypes.includes("temperature") && (
              <button
                onClick={() => setSelectedDataType("temperature")}
                className={`border px-3 py-1 rounded-md text-sm ${
                  selectedDataType === "temperature"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Temperature
              </button>
            )}
            {availableDataTypes.includes("humidity") && (
              <button
                onClick={() => setSelectedDataType("humidity")}
                className={`border px-3 py-1 rounded-md text-sm ${
                  selectedDataType === "humidity"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Humidity
              </button>
            )}
            {availableDataTypes.includes("smoke") && (
              <button
                onClick={() => setSelectedDataType("smoke")}
                className={`border px-3 py-1 rounded-md text-sm ${
                  selectedDataType === "smoke"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Smoke
              </button>
            )}

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value) as TimeRange)}
              className="ml-auto border rounded-md px-2 py-1 text-sm"
            >
              <option value={24}>Last 24 Hours</option>
              <option value={168}>Last 7 Days</option>
            </select>
          </div>

          <div className="h-68">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading data...
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available for the selected time range
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis unit={yAxisUnit} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <AddSensorModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSensorAdded={handleSensorUpdated}
        sensor={sensor}
      />
    </>
  );
};

export default SectorAlphaTemp;
