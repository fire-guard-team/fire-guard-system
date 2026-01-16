import type { FC } from "react";
import RiskMap from "../../../components/maps/RiskMap";

const InteractiveMap: FC = () => {
  return (
    <section className="space-y-4">
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          Interactive Forest Fire Monitoring Map
        </h2>

        <div className="relative rounded-lg overflow-hidden">
          <RiskMap className="h-[700px]" />

          {/* Risk Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg text-sm z-10 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              Risk Legend
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-gray-700">Safe</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="text-gray-700">Moderate Risk</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-gray-700">High Risk</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-orange-600" />
                <span className="text-gray-700">Active Fire</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;


