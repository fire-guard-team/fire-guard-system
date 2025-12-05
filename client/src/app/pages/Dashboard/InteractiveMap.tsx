import type { FC } from "react";
import RiskMap from "../../../components/maps/RiskMap";
import MapLayersPanel from "../../../components/dashboard/interactiveMap/MapLayersPanel";
import SensorSidePanel from "../../../components/dashboard/interactiveMap/SensorSidePanel";

const InteractiveMap: FC = () => {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <MapLayersPanel />

        <div className="">
          <RiskMap className="h-[600px] rounded-none" />
        </div>

        <SensorSidePanel />
      </div>
    </section>
  );
};

export default InteractiveMap;

//   <header className="flex items-center justify-between">
//     <h1 className="text-lg font-semibold text-gray-900">Interactive Map</h1>
//     <p className="text-xs text-gray-500">
//       Monitor live fire risk predictions and sensor activity.
//     </p>
//   </header>
