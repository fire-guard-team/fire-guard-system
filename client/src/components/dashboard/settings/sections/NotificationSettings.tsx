"use client";
import { useEffect, useState } from "react";
import { apiService } from "../../../../utils/api";

type SettingsMap = Record<string, any>;

const Toggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => {
  return (
    <label className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          "w-12 h-6 rounded-full transition-colors relative",
          checked ? "bg-green-500" : "bg-gray-300",
        ].join(" ")}
        aria-pressed={checked}
      >
        <span
          className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </label>
  );
};

const NotificationSettings = () => {
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
        notify_email_enabled: Boolean(settings.notify_email_enabled ?? true),
        notify_sms_enabled: Boolean(settings.notify_sms_enabled ?? false),
        notify_push_enabled: Boolean(settings.notify_push_enabled ?? true),
        notify_recipients: String(settings.notify_recipients ?? ""),
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
        <h1 className="text-xl font-semibold">Notification Settings</h1>
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
          <div className="text-gray-500 text-sm">Loading notification settings...</div>
        ) : (
          <>
            <Toggle
              label="Email notifications"
              checked={Boolean(settings.notify_email_enabled ?? true)}
              onChange={(v) =>
                setSettings((p) => ({ ...p, notify_email_enabled: v }))
              }
            />
            <Toggle
              label="Push notifications"
              checked={Boolean(settings.notify_push_enabled ?? true)}
              onChange={(v) =>
                setSettings((p) => ({ ...p, notify_push_enabled: v }))
              }
            />
            <Toggle
              label="SMS notifications"
              checked={Boolean(settings.notify_sms_enabled ?? false)}
              onChange={(v) => setSettings((p) => ({ ...p, notify_sms_enabled: v }))}
            />

            <div className="pt-2">
              <label className="block text-sm font-medium mb-1">
                Notification recipients (comma-separated emails)
              </label>
              <input
                type="text"
                value={settings.notify_recipients ?? ""}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, notify_recipients: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                placeholder="admin@fireguard.local, operator@fireguard.local"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NotificationSettings;

