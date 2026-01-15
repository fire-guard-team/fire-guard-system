interface SectorToolsProps {
  onDefineBoundary?: () => void;
}

const SectorTools = ({ onDefineBoundary }: SectorToolsProps) => {
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

          <button className="bg-green-500 text-white rounded-md px-4 py-2 text-sm">
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
