"use client";
import { useEffect, useState } from "react";
import { apiService } from "../../../../utils/api";

type SettingsMap = Record<string, any>;

const SoundSettings = () => {
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
        sound_enabled: Boolean(settings.sound_enabled ?? true),
        sound_volume: Number(settings.sound_volume ?? 70),
      });
      await load();
    } catch (e) {
      console.error("Error saving settings:", e);
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const enabled = Boolean(settings.sound_enabled ?? true);
  const volume = Number(settings.sound_volume ?? 70);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sound Settings</h1>
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
          <div className="text-gray-500 text-sm">Loading sound settings...</div>
        ) : (
          <>
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm">Enable alert sounds</span>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, sound_enabled: e.target.checked }))
                }
              />
            </label>

            <div className={enabled ? "" : "opacity-50"}>
              <label className="block text-sm font-medium mb-2">
                Volume: {volume}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                disabled={!enabled}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    sound_volume: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SoundSettings;

