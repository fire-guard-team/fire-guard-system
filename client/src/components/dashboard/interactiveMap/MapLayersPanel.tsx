import type { FC } from "react";

const layers = [
  { id: "sensors", label: "Sensor Locations", color: "bg-emerald-500", defaultChecked: true },
  { id: "water", label: "Water Sources", defaultChecked: false },
  { id: "forest", label: "Forest Boundaries", defaultChecked: true },
  { id: "wind", label: "Wind Direction", defaultChecked: false },
  { id: "history", label: "Historical Fires", defaultChecked: false },
];

const MapLayersPanel: FC = () => {
  return (
    <aside className="bg-white rounded-l-lg shadow-sm px-5 py-4 h-full">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Map Layers</h2>
        <p className="text-xs text-gray-500">
          Toggle visibility of different data layers.
        </p>
      </div>

      {/* layers checkboxes */}
      <div className="space-y-2 mb-6">
        {layers.map((layer) => (
          <label
            key={layer.id}
            className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              defaultChecked={layer.defaultChecked}
            />
            <span className="flex items-center gap-1.5">
              {layer.color && (
                <span className={`h-2 w-2 rounded-sm ${layer.color}`} />
              )}
              {layer.label}
            </span>
          </label>
        ))}
      </div>

      {/* risk legend */}
      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Risk Legend
        </h3>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-gray-700">Safe</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="text-gray-700">Moderate Risk</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-gray-700">High Risk</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-600" />
            <span className="text-gray-700">Active Fire</span>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default MapLayersPanel;
