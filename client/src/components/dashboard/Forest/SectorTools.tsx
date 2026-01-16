import { useState, useEffect } from "react";
import { apiService } from "../../../utils/api";

interface SectorToolsProps {
  onDefineBoundary?: () => void;
  onSectorCreated?: () => void;
  drawingMode?: boolean;
  onStartDrawing?: () => void;
  onCancelDrawing?: () => void;
  boundaryData?: any;
}

const SectorTools = ({
  onDefineBoundary,
  onSectorCreated,
  drawingMode,
  onStartDrawing,
  onCancelDrawing,
  boundaryData
}: SectorToolsProps) => {
  console.log('SectorTools received props:', { drawingMode, boundaryData });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    status: 'Safe',
    boundary: null as any
  });
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('boundaryData changed in SectorTools:', boundaryData);
  }, [boundaryData]);

  useEffect(() => {
    console.log('drawingMode changed in SectorTools:', drawingMode);
    console.log('SectorTools will re-render with new drawingMode:', drawingMode);
  }, [drawingMode]);

  const handleCreateSector = async () => {
    if (!createForm.name.trim()) {
      setError('اسم القطاع مطلوب');
      return;
    }

    console.log('Checking boundaryData:', boundaryData);
    console.log('boundaryData exists:', !!boundaryData);
    if (!boundaryData) {
      console.log('No boundary data found, showing error');
      setError('يجب رسم حدود القطاع أولاً');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      await apiService.createSector({
        name: createForm.name,
        status: createForm.status,
        boundary: boundaryData
      });

      setCreateForm({ name: '', status: 'Safe', boundary: null });
      setShowCreateForm(false);
      onCancelDrawing?.(); // إيقاف وضع الرسم
      onSectorCreated?.();
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء إنشاء القطاع');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setCreateForm({ name: '', status: 'Safe', boundary: null });
    setShowCreateForm(false);
    setError('');
    onCancelDrawing?.(); // إيقاف وضع الرسم
  };

  return (
    <div className="space-y-2 bg-white shadow-sm border border-border rounded-xl">
      
      <div className="p-4 space-y-4">
        <h2 className="font-semibold text-lg">Boundary & Sector Tools</h2>
        <p className="text-sm text-gray-500">
          Manage forest boundaries and sector definitions.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onDefineBoundary}
            className="px-4 py-2 text-sm cursor-pointer border border-border rounded-md hover:bg-gray-50"
          >
            Define Forest Boundary
          </button>

          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 text-white rounded-md px-4 py-2 text-sm hover:bg-green-600"
          >
            Create New Sector
          </button>

          <button className="border rounded-md px-4 py-2 text-sm border border-border">
            Merge Sectors
          </button>

          <button className="bg-red-500 text-white rounded-md px-4 py-2 text-sm">
            Delete Sector
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white border-t border-border p-4 space-y-4">
          <h2 className="font-semibold text-lg">Create New Sector</h2>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-sm font-medium">Sector Name</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm"
                placeholder="Enter sector name"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm"
              >
                <option value="Safe">Safe</option>
                <option value="Warning">Warning</option>
                <option value="Fire">Fire</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Boundary</label>
              <div className="text-xs text-gray-500 mb-2">
                رسم حدود القطاع على الخريطة
              </div>

              {!drawingMode && !boundaryData && (
                <button
                  type="button"
                  onClick={() => {
                    console.log('=== START DRAWING BUTTON CLICKED ===');
                    console.log('onStartDrawing function:', onStartDrawing);
                    console.log('onStartDrawing exists:', !!onStartDrawing);
                    console.log('Current drawingMode prop:', drawingMode);
                    setError('');
                    if (onStartDrawing) {
                      console.log('Calling onStartDrawing...');
                      onStartDrawing();
                      console.log('onStartDrawing called successfully');
                    } else {
                      console.log('ERROR: onStartDrawing is undefined!');
                    }
                  }}
                  className="w-full border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md px-3 py-2 text-sm transition-colors"
                >
                  🖊️ ابدأ رسم حدود القطاع
                </button>
              )}

              {drawingMode && (
                <div className="space-y-2">
                  <div className="w-full border border-orange-300 bg-orange-50 text-orange-700 rounded-md px-3 py-2 text-sm">
                    🖊️ جاري الرسم... ارسم المضلع على الخريطة
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onCancelDrawing?.();
                    }}
                    className="w-full border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md px-3 py-1 text-xs"
                  >
                    إلغاء الرسم
                  </button>
                </div>
              )}

              {boundaryData && !drawingMode && (
                <div className="space-y-2">
                  <div className="w-full border border-green-300 bg-green-50 text-green-700 rounded-md px-3 py-2 text-sm">
                    ✅ تم رسم الحدود بنجاح
                    <div className="text-xs mt-1 opacity-75">
                      Type: {boundaryData?.type} | Coordinates: {boundaryData?.coordinates?.[0]?.length || 0} points
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onCancelDrawing}
                    className="w-full border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 rounded-md px-3 py-1 text-xs"
                  >
                    إعادة رسم الحدود
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Debug info */}
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            Debug: boundaryData exists = {boundaryData ? 'YES' : 'NO'}
            {boundaryData && ` | Type: ${boundaryData.type} | Points: ${boundaryData.coordinates?.[0]?.length || 0}`}
            <br />
            drawingMode = {drawingMode ? 'TRUE' : 'FALSE'}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCancelCreate}
              className="px-4 py-2 border border-border rounded-md cursor-pointer text-sm hover:bg-gray-50"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSector}
              disabled={isCreating}
              className="px-4 py-2 bg-green-500 text-white rounded-md cursor-pointer text-sm hover:bg-green-600 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Sector'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border-t border-border p-4 space-y-4">
        <h2 className="font-semibold text-lg">Selected Sector Details</h2>
        <p className="text-sm text-gray-500">
          View and edit metadata for the selected sector.
        </p>

        <div className="space-y-3 text-sm">
          <div>
            <label className="block mb-1">Sector Name</label>
            <input
              className="w-full border border-border rounded-md px-3 py-2"
              defaultValue="Sector Alpha"
            />
          </div>

          <div>
            <label className="block mb-1">Area (sq km)</label>
            <input
              className="w-full border border-border rounded-md px-3 py-2"
              defaultValue="120.5"
            />
          </div>

          <div>
            <label className="block mb-1">Risk Profile</label>
            <select className="w-full border border-border rounded-md px-3 py-2">
              <option>High Risk</option>
              <option>Moderate Risk</option>
              <option>Low Risk</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Boundary Coordinates</label>
            <textarea
              rows={3}
              className="w-full border border-border rounded-md px-3 py-2"
              defaultValue="[[34.0522, -118.2437], [34.0530, -118.2420], [34.0515, -118.2410]]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="px-4 py-2 border border-border rounded-md cursor-pointer">
            Cancel
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-md cursor-pointer">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectorTools;
