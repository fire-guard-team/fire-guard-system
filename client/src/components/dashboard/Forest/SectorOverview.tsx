import React from "react";
import RiskMap from "../../maps/RiskMap";

interface SectorOverviewProps {
  drawingMode?: boolean;
  onPolygonDrawn?: (boundary: any) => void;
  onDrawingCanceled?: () => void;
}

const SectorOverview = ({ drawingMode, onPolygonDrawn, onDrawingCanceled }: SectorOverviewProps) => {
  console.log('SectorOverview props:', { drawingMode, hasOnPolygonDrawn: !!onPolygonDrawn, hasOnDrawingCanceled: !!onDrawingCanceled });

  // تتبع تغييرات drawingMode
  React.useEffect(() => {
    console.log('drawingMode changed in SectorOverview:', drawingMode);
  }, [drawingMode]);
  return (
    <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col ">
      
      <h2 className="text-lg font-semibold mb-4">
        Forest & Sector Overview
      </h2>

      <div className="relative flex-1 rounded-lg overflow-hidden">
        <RiskMap
          className="h-[700px]"
          drawingMode={drawingMode}
          onPolygonDrawn={onPolygonDrawn}
          onDrawingCanceled={onDrawingCanceled}
        />

        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow text-sm space-y-2 z-9">
          <p className="font-semibold">Map Legend</p>

          <div className="space-y-1">
            <p className="font-medium text-xs">Risk Levels:</p>
            <LegendItem color="bg-red-500" label="Fire Risk (Temp >80°C)" />
            <LegendItem color="bg-orange-500" label="High Risk (Smoke >2.0)" />
            <LegendItem color="bg-green-500" label="Low Risk" />
          </div>

          <div className="space-y-1 border-t pt-2">
            <p className="font-medium text-xs">Sensor Status:</p>
            <LegendItem color="bg-green-500" label="Active" />
            <LegendItem color="bg-red-500" label="Offline" />
            <LegendItem color="bg-yellow-400" label="Faulty" />
          </div>

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
