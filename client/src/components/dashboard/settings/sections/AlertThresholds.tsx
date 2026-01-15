"use client";
import { useEffect, useState } from "react";
import { apiService } from "../../../../utils/api";

type SettingsMap = Record<string, any>;

const AlertThresholds = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [settings, setSettings] = useState<SettingsMap>({});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.getSettings();
      setSettings(res?.settings ?? res ?? {});
    } catch (e) {
      console.error("Error loading settings:", e);
      setError(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await apiService.updateSettings({
        threshold_temp_warning: Number(settings.threshold_temp_warning ?? 45),
        threshold_temp_critical: Number(settings.threshold_temp_critical ?? 60),
        threshold_smoke_warning: Number(settings.threshold_smoke_warning ?? 120),
        threshold_smoke_critical: Number(settings.threshold_smoke_critical ?? 200),
        threshold_humidity_low: Number(settings.threshold_humidity_low ?? 20),
      });
      await load();
    } catch (e) {
      console.error("Error saving settings:", e);
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Alert Thresholds</h1>
        <button
          type="button"
          onClick={save}
          disabled={saving || loading}
          className="bg-green-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-border p-6 space-y-6">
        {loading ? (
          <div className="text-gray-500 text-sm">Loading thresholds...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Temperature Warning (°C)
                </label>
                <input
                  type="number"
                  value={settings.threshold_temp_warning ?? 45}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      threshold_temp_warning: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Temperature Critical (°C)
                </label>
                <input
                  type="number"
                  value={settings.threshold_temp_critical ?? 60}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      threshold_temp_critical: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Smoke Warning (PPM)
                </label>
                <input
                  type="number"
                  value={settings.threshold_smoke_warning ?? 120}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      threshold_smoke_warning: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Smoke Critical (PPM)
                </label>
                <input
                  type="number"
                  value={settings.threshold_smoke_critical ?? 200}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      threshold_smoke_critical: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Low Humidity Threshold (%)
              </label>
              <input
                type="number"
                value={settings.threshold_humidity_low ?? 20}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    threshold_humidity_low: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AlertThresholds;

