import RiskMap from "../../maps/RiskMap";

const SectorOverview = () => {
  return (
    <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col ">
      
      <h2 className="text-lg font-semibold mb-4">
        Forest & Sector Overview
      </h2>

      <div className="relative flex-1 rounded-lg overflow-hidden">
        <RiskMap className="h-[700px]"/>

        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow text-sm space-y-2 z-9">
          <p className="font-semibold">Map Legend</p>

          <LegendItem color="bg-red-500" label="Active Fire Risk" />
          <LegendItem color="bg-orange-500" label="High Risk" />
          <LegendItem color="bg-yellow-400" label="Moderate Risk" />بخف
          <LegendItem color="bg-green-500" label="Low Risk" />
          <LegendItem border label="Forest Boundary" />
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({
  color,
  label,
  border,
}: {
  color?: string;
  label: string;
  border?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <span
      className={`w-3 h-3 rounded ${
        border ? "border-2 border-blue-500" : color
      }`}
    />
    <span>{label}</span>
  </div>
);

export default SectorOverview;
