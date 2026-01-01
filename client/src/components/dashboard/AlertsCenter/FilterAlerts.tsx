import { CiFilter } from "react-icons/ci";

const FilterAlerts = () => {
  return (
    <div className="bg-white border border-border rounded-lg p-5 shadow-sm w-full">
      <h3 className="flex items-center gap-2 font-semibold text-lg mb-4">
        <CiFilter className="text-xl" />
        Filter Alerts
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sector
          </label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            <option>Select a sector</option>
            <option>North Sector</option>
            <option>South Sector</option> 
            <option>East Sector</option>
            <option>West Sector</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <div className="flex gap-3">
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Start Date"
            />
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="End Date"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alert Type
          </label>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              High Temperature
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Smoke Detection
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Low Humidity
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Strong Wind
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            <option>Select severity</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <button className="w-full bg-green-500 hover:bg-green-600 transition text-white font-medium py-2 rounded-md mt-2">
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterAlerts;
