interface Alert {
  alert_id: number;
  meta: {
    temperature?: number;
    humidity?: number;
    smoke?: number;
    thresholds?: {
      temperature?: number;
      humidity?: number;
      smoke?: number;
    };
  } | null;
  created_at: string;
}

interface TriggerConditionsProps {
  alert: Alert | null;
}

const TriggerConditions = ({ alert }: TriggerConditionsProps) => {
  if (!alert || !alert.meta) {
    return (
      <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Trigger Conditions</h3>
        <div className="text-center py-8 text-gray-500">
          Select an alert to view trigger conditions
        </div>
      </div>
    );
  }

  const { meta } = alert;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Trigger Conditions</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-3">
          {meta.temperature !== undefined && (
            <p>
              <span className="text-gray-500">Temperature:</span>{" "}
              <span className="font-medium">
                {meta.temperature}°C
                {meta.thresholds?.temperature
                  ? ` (Threshold: ${meta.thresholds.temperature}°C)`
                  : ""}
              </span>
            </p>
          )}

          {meta.smoke !== undefined && (
            <p>
              <span className="text-gray-500">Smoke Level:</span>{" "}
              <span className="font-medium">
                {meta.smoke}
                {meta.thresholds?.smoke ? ` (Threshold: ${meta.thresholds.smoke})` : ""}
              </span>
            </p>
          )}

          <p>
            <span className="text-gray-500">Triggered At:</span>{" "}
            <span className="font-medium">{formatDate(alert.created_at)}</span>
          </p>
        </div>

        <div className="space-y-3">
          {meta.humidity !== undefined && (
            <p>
              <span className="text-gray-500">Humidity:</span>{" "}
              <span className="font-medium">
                {meta.humidity}%
                {meta.thresholds?.humidity
                  ? ` (Threshold: ${meta.thresholds.humidity}%)`
                  : ""}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TriggerConditions;
