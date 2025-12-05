import type { FC } from "react";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

const SensorSidePanel: FC = () => {
  return (
    <aside className="bg-white border border-border rounded-r-lg shadow-sm px-5 py-4 h-full flex flex-col gap-4">
      {/* search */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sector..."
            className="flex-1 outline-none bg-transparent text-sm"
          />
        </div>

        <button className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-gray-500 hover:bg-bgMain">
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
        </button>
      </div>

      {/* risk badge */}
      <div className="inline-flex items-center self-start rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold">
        High Risk
      </div>

      {/* current sensor data */}
      <div className="rounded-2xl border border-border bg-bgMain/60 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Current Sensor Data
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Temperature</dt>
            <dd className="font-medium text-gray-900">38.5°C</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Humidity</dt>
            <dd className="font-medium text-gray-900">25%</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Cigarette Index</dt>
            <dd className="font-medium text-gray-900">0.78</dd>
          </div>
        </dl>
      </div>

      {/* historical trends */}
      <div className="rounded-2xl border border-border bg-bgMain/60 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Historical Trends (Last 7h)
          </h3>
          <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-gray-500 hover:bg-white">
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>

        {/* placeholder mini-chart */}
        <div className="h-28 w-full mb-3 flex items-center justify-center">
          <span className="text-[11px] text-gray-400">
            (Mini trend chart placeholder)
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Temperature (°C)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Humidity (%)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-700" />
            Cigarette Index
          </span>
        </div>
      </div>

      {/* button */}
      <button className="mt-auto inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2.5">
        <ArrowsPointingOutIcon className="w-4 h-4 mr-2" />
        View Full Details
      </button>
    </aside>
  );
};

export default SensorSidePanel;
