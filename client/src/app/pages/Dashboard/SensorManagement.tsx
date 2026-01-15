import { useState } from "react";
import DeployedSensors from "../../../components/dashboard/SensorManagement/DeployedSensors";
import SectorAlphaTemp from "../../../components/dashboard/SensorManagement/SectorAlphaTemp";
import { apiService } from "../../../utils/api";

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

const SensorManagement = () => {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSensorSelect = async (sensorId: number) => {
    try {
      const sensor = await apiService.getSensor(sensorId);
      setSelectedSensor(sensor);
    } catch (error) {
      console.error("Error loading sensor details:", error);
    }
  };

  const handleSensorUpdated = async () => {
    if (selectedSensor) {
      await handleSensorSelect(selectedSensor.sensor_id);
    }
    setRefreshKey((prev) => prev + 1);
  };

  const handleSensorDeleted = async (sensorId: number) => {
    try {
      await apiService.deleteSensor(sensorId);
      setSelectedSensor(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting sensor:", error);
      throw error;
    }
  };

  return (
    <div className="flex gap-6">
      <DeployedSensors
        key={refreshKey}
        onSensorSelect={handleSensorSelect}
        selectedSensorId={selectedSensor?.sensor_id}
      />
      <SectorAlphaTemp
        sensor={selectedSensor}
        onSensorUpdated={handleSensorUpdated}
        onSensorDeleted={handleSensorDeleted}
      />
    </div>
  );
};

export default SensorManagement;
