import { useState, useEffect } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import AddSensorModal from "./AddSensorModal";
import { apiService } from "../../../utils/api";

interface Sensor {
  sensor_id: number;
  name: string;
  type: string;
  status: "active" | "offline" | "faulty";
  sector?: {
    sector_id: number;
    name: string;
  } | null;
  lat?: number | null;
  lng?: number | null;
}

interface DeployedSensorsProps {
  onSensorSelect?: (sensorId: number) => void;
  selectedSensorId?: number | null;
}

const ITEMS_PER_PAGE = 6;

const DeployedSensors = ({ onSensorSelect, selectedSensorId }: DeployedSensorsProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const loadSensors = async () => {
    setLoading(true);
    try {
      const response = await apiService.getSensors({ page });
      setSensors(response.data || []);
      setTotalPages(response.last_page || 1);
    } catch (error) {
      console.error("Error loading sensors:", error);
      setSensors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSensors();
  }, [page]);

  const handleSensorAdded = () => {
    loadSensors();
    setOpenModal(false);
  };

  const filteredSensors = sensors.filter((sensor) =>
    `${sensor.sensor_id} ${sensor.name} ${sensor.type} ${sensor.sector?.name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      active: { text: "online", className: "bg-green-100 text-green-700" },
      offline: { text: "offline", className: "bg-red-100 text-red-700" },
      faulty: { text: "faulty", className: "bg-orange-100 text-orange-700" },
    };
    return statusMap[status] || { text: status, className: "bg-gray-100 text-gray-700" };
  };

  return (
    <div className="bg-white border border-border rounded-xl p-8 shadow-sm space-y-8 max-w-4xl">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Deployed Sensors</h1>
          <p className="text-sm text-gray-600 max-w-md">
            Manage and monitor all environmental sensors in your network.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Search sensors..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-btn rounded-lg px-4 py-2.5 text-[#015109] font-semibold cursor-pointer"
          >
            <CiCirclePlus size={22} />
            Add Sensor
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-border text-gray-500">
            <tr className="text-left">
              <th className="py-5">ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Loading sensors...
                </td>
              </tr>
            ) : filteredSensors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No sensors found
                </td>
              </tr>
            ) : (
              filteredSensors.map((sensor) => {
                const statusDisplay = getStatusDisplay(sensor.status);
                const isSelected = selectedSensorId === sensor.sensor_id;
                return (
                  <tr
                    key={sensor.sensor_id}
                    onClick={() => onSensorSelect?.(sensor.sensor_id)}
                    className={`hover:bg-gray-50 transition cursor-pointer ${isSelected ? "bg-blue-50" : ""}`}
                  >
                    <td className="py-8 font-medium">SN-{String(sensor.sensor_id).padStart(3, "0")}</td>
                    <td>{sensor.name}</td>
                    <td>{sensor.type}</td>
                    <td>{sensor.sector?.name || "N/A"}</td>
                    <td>
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold ${statusDisplay.className}`}
                      >
                        {statusDisplay.text}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="text-gray-500 hover:text-gray-700 text-lg">
                        •••
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-8 pt-6 border-t-2 border-border">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="flex items-center gap-2 text-gray-600 disabled:opacity-50"
        >
          <FaAngleLeft size={18} />
          Previous
        </button>

        <span className="w-10 h-10 flex items-center justify-center border border-border rounded-full font-semibold">
          {page}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="flex items-center gap-2 text-gray-600 disabled:opacity-50"
        >
          Next
          <FaAngleRight size={18} />
        </button>
      </div>
      <div className="">
        <AddSensorModal
          onClose={() => setOpenModal(false)}
          open={openModal}
          onSensorAdded={handleSensorAdded}
        />
      </div>
    </div>
  );
};

export default DeployedSensors;
