import { useState, useEffect } from "react";
import type { FC } from "react";
import { FaTimes } from "react-icons/fa";
import { apiService } from "../../../utils/api";

interface Sector {
  sector_id: number;
  name: string;
}

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
  battery_level?: number | null;
}

interface AddSensorModalProps {
  open: boolean;
  onClose: () => void;
  onSensorAdded?: () => void;
  sensor?: Sensor | null;
}

const AddSensorModal: FC<AddSensorModalProps> = ({ open, onClose, onSensorAdded, sensor }) => {
  const isEditMode = !!sensor;
  const [name, setName] = useState("");
  const [type, setType] = useState("Temperature");
  const [sectorId, setSectorId] = useState<number | null>(null);
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [batteryLevel, setBatteryLevel] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    if (open) {
      loadSectors();
      if (isEditMode && sensor) {
        // Fill form with current sensor data
        setName(sensor.name || "");
        setType(sensor.type || "Temperature");
        setSectorId(sensor.sector?.sector_id || null);
        setLat(sensor.lat !== null && sensor.lat !== undefined ? String(sensor.lat) : "");
        setLng(sensor.lng !== null && sensor.lng !== undefined ? String(sensor.lng) : "");
        setStatus(sensor.status || "active");
        setBatteryLevel(sensor.battery_level !== null && sensor.battery_level !== undefined ? String(sensor.battery_level) : "");
        setError("");
      } else {
        // Reset form when modal opens for adding new sensor
        setName("");
        setType("Temperature");
        setSectorId(null);
        setLat("");
        setLng("");
        setStatus("active");
        setBatteryLevel("");
        setError("");
      }
    }
  }, [open, isEditMode, sensor]);

  const loadSectors = async () => {
    try {
      const response = await apiService.getSectors();
      setSectors(response || []);
    } catch (error) {
      console.error("Error loading sectors:", error);
      setSectors([]);
    }
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !type) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate coordinates if provided
    if (lat && isNaN(Number(lat))) {
      setError("Latitude must be a valid number");
      return;
    }
    if (lng && isNaN(Number(lng))) {
      setError("Longitude must be a valid number");
      return;
    }
    if (lat && (Number(lat) < -90 || Number(lat) > 90)) {
      setError("Latitude must be between -90 and 90");
      return;
    }
    if (lng && (Number(lng) < -180 || Number(lng) > 180)) {
      setError("Longitude must be between -180 and 180");
      return;
    }

    // Validate battery level if provided
    if (batteryLevel) {
      const battery = Number(batteryLevel);
      if (isNaN(battery) || battery < 0 || battery > 100) {
        setError("Battery level must be between 0 and 100");
        return;
      }
    }

    setLoading(true);
    try {
      const sensorData = {
        name: name.trim(),
        type: type,
        sector_id: sectorId || undefined,
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        status: status || undefined,
        battery_level: batteryLevel ? Number(batteryLevel) : undefined,
      };

      if (isEditMode && sensor) {
        await apiService.updateSensor(sensor.sensor_id, sensorData);
      } else {
        await apiService.createSensor(sensorData);
      }
      
      onSensorAdded?.();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (isEditMode ? "Failed to update sensor" : "Failed to add sensor");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{isEditMode ? "Edit Sensor" : "Add New Sensor"}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Sensor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="e.g. Sector Alpha"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              required
            >
              <option>Temperature</option>
              <option>Humidity</option>
              <option>Smoke</option>
              <option>Multi-sensor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sector (Optional)</label>
            <select
              value={sectorId || ""}
              onChange={(e) => setSectorId(e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
            >
              <option value="">Select a sector</option>
              {sectors.map((sector) => (
                <option key={sector.sector_id} value={sector.sector_id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Latitude (Optional)</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                placeholder="e.g. 34.0522"
                min="-90"
                max="90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude (Optional)</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                placeholder="e.g. -118.2437"
                min="-180"
                max="180"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status (Optional)</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
            >
              <option value="active">Active</option>
              <option value="offline">Offline</option>
              <option value="faulty">Faulty</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Battery Level (Optional)</label>
            <input
              type="number"
              value={batteryLevel}
              onChange={(e) => setBatteryLevel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="0-100"
              min="0"
              max="100"
            />
          </div>
        </form>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-btn text-[#015109] font-semibold disabled:opacity-50"
          >
            {loading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Sensor" : "Add Sensor")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSensorModal;
