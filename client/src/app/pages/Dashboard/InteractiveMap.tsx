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


