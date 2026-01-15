"use client";
import { useEffect, useState } from "react";
import { apiService } from "../../../../utils/api";

type SettingsMap = Record<string, any>;

const GeneralSettings = () => {
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
        system_name: settings.system_name ?? "",
        timezone: settings.timezone ?? "UTC",
        language: settings.language ?? "en",
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
        <h1 className="text-xl font-semibold">General Settings</h1>
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

      <div className="bg-white rounded-lg shadow-sm border border-border p-6 space-y-4">
        {loading ? (
          <div className="text-gray-500 text-sm">Loading settings...</div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">System Name</label>
              <input
                type="text"
                value={settings.system_name ?? ""}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, system_name: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                placeholder="Fire Guard"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select
                  value={settings.timezone ?? "UTC"}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, timezone: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                >
                  <option value="UTC">UTC</option>
                  <option value="Asia/Damascus">Asia/Damascus</option>
                  <option value="Asia/Riyadh">Asia/Riyadh</option>
                  <option value="Europe/Istanbul">Europe/Istanbul</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  value={settings.language ?? "en"}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, language: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default GeneralSettings;

