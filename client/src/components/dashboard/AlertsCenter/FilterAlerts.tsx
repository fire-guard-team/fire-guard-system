import { useState } from "react";
import { CiFilter } from "react-icons/ci";

interface AlertFilters {
  status?: "active" | "acknowledged" | "";
  level?: "Low" | "Medium" | "High" | "Critical" | "";
}

interface FilterAlertsProps {
  filters: AlertFilters;
  onFilterChange: (filters: AlertFilters) => void;
}

const FilterAlerts = ({ filters, onFilterChange }: FilterAlertsProps) => {
  const [localFilters, setLocalFilters] = useState<AlertFilters>(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters: AlertFilters = { status: "", level: "" };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white border border-border rounded-lg p-5 shadow-sm w-full">
      <h3 className="flex items-center gap-2 font-semibold text-lg mb-4">
        <CiFilter className="text-xl" />
        Filter Alerts
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={localFilters.status || ""}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, status: e.target.value as AlertFilters["status"] })
            }
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={localFilters.level || ""}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, level: e.target.value as AlertFilters["level"] })
            }
          >
            <option value="">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 bg-green-500 hover:bg-green-600 transition text-white font-medium py-2 rounded-md"
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-200 hover:bg-gray-300 transition text-gray-700 font-medium py-2 rounded-md"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterAlerts;
