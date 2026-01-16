import SectorOverview from "../../../components/dashboard/Forest/SectorOverview";
import SectorTools from "../../../components/dashboard/Forest/SectorTools";
import React, { useState, useEffect } from "react";
import ProjectBoundaryModal from "../../../components/dashboard/Forest/ProjectBoundaryModal";

const ForestSectors = () => {
  console.log('=== ForestSectors COMPONENT RENDER ===');

  const [openBoundary, setOpenBoundary] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawnBoundary, setDrawnBoundary] = useState<any>(null);

  console.log('ForestSectors render - drawingMode:', drawingMode);
  console.log('ForestSectors render - current state:', { drawingMode, openBoundary, drawnBoundary });

  useEffect(() => {
    console.log('=== DRAWINGMODE STATE CHANGED in ForestSectors:', drawingMode);
    console.log('This should trigger a re-render of all components');
    console.log('drawingMode is now:', drawingMode);
  }, [drawingMode]);

  const handleSectorCreated = () => {
    window.dispatchEvent(new CustomEvent('project-area-updated'));
    setDrawnBoundary(null);
  };

  const handlePolygonDrawn = (boundary: any) => {
    console.log('handlePolygonDrawn called in ForestSectors');
    console.log('Boundary received in ForestSectors:', boundary);
    setDrawnBoundary(boundary);
    console.log('drawnBoundary set to:', boundary);
  };

  const handleDrawingCanceled = () => {
    console.log('Drawing canceled');
    setDrawingMode(false);
    setDrawnBoundary(null);
  };

  return (
    <div className="flex gap-6 justify-be">
      <div className="min-w-3xl h-full">
        <SectorOverview
          drawingMode={drawingMode}
          onPolygonDrawn={handlePolygonDrawn}
          onDrawingCanceled={handleDrawingCanceled}
        />
      </div>

      <div className="w-full">
        <SectorTools
          onDefineBoundary={() => setOpenBoundary(true)}
          onSectorCreated={handleSectorCreated}
          drawingMode={drawingMode}
          onStartDrawing={() => {
            console.log('=== onStartDrawing CALLED in ForestSectors ===');
            console.log('Current drawingMode before:', drawingMode);
            console.log('Setting drawing mode to true');
            setDrawingMode(prevMode => {
              console.log('setDrawingMode callback - prevMode:', prevMode);
              const newMode = true;
              console.log('setDrawingMode callback - setting to:', newMode);
              return newMode;
            });

            console.log('Note: setDrawingMode is asynchronous, so drawingMode is still false here');
            setTimeout(() => {
              console.log('Timeout check - drawingMode should be true now in next render');
            }, 0);
          }}
          onCancelDrawing={handleDrawingCanceled}
          boundaryData={drawnBoundary}
        />
      </div>

      <ProjectBoundaryModal
        open={openBoundary}
        onClose={() => setOpenBoundary(false)}
        onSaved={() => {
        }}
      />
    </div>
  );
};

export default ForestSectors;
