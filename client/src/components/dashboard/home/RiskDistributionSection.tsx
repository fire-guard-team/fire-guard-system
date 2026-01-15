import type { FC } from "react";
import RiskMap from "../../maps/RiskMap";

const RiskDistributionSection: FC = () => {
  return (
    <div className="bg-white border border-border rounded-lg px-5 py-4 shadow-sm h-full">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Global Risk Distribution
      </h2>

      <div className="mb-4 relative">
        <RiskMap />
        <div className="absolute bottom-3 left-3 z-11 bg-white/80 backdrop-blur-sm shadow-md border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <div className="font-medium text-gray-800 mb-1">Risk Legend:</div>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-gray-700">Low Risk</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="text-gray-700">Medium Risk</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-gray-700">High Risk</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RiskDistributionSection;
