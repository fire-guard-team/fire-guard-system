import { MdOutlineNotificationsActive } from "react-icons/md";

const AlertsDeatils = () => {
  return (
    <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
      <h3 className="flex items-center gap-2 font-semibold text-lg mb-4">
        <MdOutlineNotificationsActive className="text-xl" />
        Alert Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-3">
          <div>
            <p className="text-gray-500">Alert ID:</p>
            <p className="font-medium">AW-001-20240726-001</p>
          </div>

          <div>
            <p className="text-gray-500">Status:</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
              Active
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-gray-500">Alert Type:</p>
            <p className="font-medium">High Temperature</p>
          </div>

          <div>
            <p className="text-gray-500">Severity:</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              Critical
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsDeatils;
