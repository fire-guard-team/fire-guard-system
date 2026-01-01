import type { FC } from "react";
import { FaTimes } from "react-icons/fa";

interface AddSensorModalProps {
  open: boolean;
  onClose: () => void;
}

const AddSensorModal: FC<AddSensorModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-6 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add New Sensor</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sensor Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="e.g. Sector Alpha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none">
              <option>Temperature</option>
              <option>Humidity</option>
              <option>Smoke</option>
              <option>Multi-sensor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="e.g. Northern Ridge Trail"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button className="px-4 py-2 text-sm rounded-lg bg-btn text-[#015109] font-semibold">
            Add Sensor
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSensorModal;
