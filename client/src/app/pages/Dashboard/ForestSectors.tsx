import SectorOverview from "../../../components/dashboard/Forest/SectorOverview";
import SectorTools from "../../../components/dashboard/Forest/SectorTools";
import { useState } from "react";
import ProjectBoundaryModal from "../../../components/dashboard/Forest/ProjectBoundaryModal";

const ForestSectors = () => {
  const [openBoundary, setOpenBoundary] = useState(false);

  return (
    <div className="flex gap-6 justify-be">
      <div className="min-w-4xl h-full">
        <SectorOverview />
      </div>

      <div className="w-full">
        <SectorTools onDefineBoundary={() => setOpenBoundary(true)} />
      </div>

      <ProjectBoundaryModal
        open={openBoundary}
        onClose={() => setOpenBoundary(false)}
        onSaved={() => {
          // refresh happens via existing polling in RiskMap
        }}
      />
    </div>
  );
};

export default ForestSectors;
