import SectorOverview from "../../../components/dashboard/Forest/SectorOverview";
import SectorTools from "../../../components/dashboard/Forest/SectorTools";

const ForestSectors = () => {
  return (
    <div className="flex gap-6 justify-be">
      <div className="min-w-4xl h-full">
        <SectorOverview />
      </div>

      <div className="w-full">
        <SectorTools />
      </div>
    </div>
  );
};

export default ForestSectors;
