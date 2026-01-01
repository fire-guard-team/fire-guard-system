const TriggerConditions = () => {
  return (
    <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Trigger Conditions</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-3">
          <p>
            <span className="text-gray-500">Temperature:</span>{" "}
            <span className="font-medium">
              98.5°C (Threshold: 90°C)
            </span>
          </p>

          <p>
            <span className="text-gray-500">Smoke Index:</span>{" "}
            <span className="font-medium">
              7.2 (Threshold: 5.0)
            </span>
          </p>

          <p>
            <span className="text-gray-500">Triggered At:</span>{" "}
            <span className="font-medium">
              2024-07-26 14:30:15
            </span>
          </p>
        </div>

        <div className="space-y-3">
          <p>
            <span className="text-gray-500">Humidity:</span>{" "}
            <span className="font-medium">
              15% (Threshold: 20%)
            </span>
          </p>

          <p>
            <span className="text-gray-500">Wind Speed:</span>{" "}
            <span className="font-medium">
              25 km/h (Threshold: 20 km/h)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TriggerConditions;
