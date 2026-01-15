type SettingsSection =
  | "users"
  | "roles"
  | "general"
  | "thresholds"
  | "notifications"
  | "sound";

interface SidebarProps {
  activeSection: SettingsSection;
  onSelect: (section: SettingsSection) => void;
}

const Sidebar = ({ activeSection, onSelect }: SidebarProps) => {
  return (
    <aside className="bg-white border-r border-border p-4">
      <h2 className="text-lg font-semibold mb-6">Settings & User Management</h2>

      <nav className="space-y-4 text-sm">
        <div>
          <p className="text-gray-400 mb-2">User Management</p>
          <ul className="space-y-2">
            <li>
              <button
                type="button"
                onClick={() => onSelect("users")}
                className={[
                  "w-full text-left",
                  activeSection === "users"
                    ? "font-medium text-blue-600"
                    : "text-gray-600 hover:text-gray-900",
                ].join(" ")}
              >
                Users
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelect("roles")}
                className={[
                  "w-full text-left",
                  activeSection === "roles"
                    ? "font-medium text-blue-600"
                    : "text-gray-600 hover:text-gray-900",
                ].join(" ")}
              >
                Roles & Permissions
              </button>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-gray-400 mb-2">System Configuration</p>
          <ul className="space-y-2 text-gray-600">
            <li>
              <button
                type="button"
                onClick={() => onSelect("general")}
                className={[
                  "w-full text-left",
                  activeSection === "general"
                    ? "font-medium text-blue-600"
                    : "text-gray-600 hover:text-gray-900",
                ].join(" ")}
              >
                General Settings
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelect("thresholds")}
                className={[
                  "w-full text-left",
                  activeSection === "thresholds"
                    ? "font-medium text-blue-600"
                    : "text-gray-600 hover:text-gray-900",
                ].join(" ")}
              >
                Alert Thresholds
              </button>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-gray-400 mb-2">Alert Preferences</p>
          <ul className="space-y-2 text-gray-600">
            <li>
              <button
                type="button"
                onClick={() => onSelect("notifications")}
                className={[
                  "w-full text-left",
                  activeSection === "notifications"
                    ? "font-medium text-blue-600"
                    : "text-gray-600 hover:text-gray-900",
                ].join(" ")}
              >
                Notification Settings
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelect("sound")}
                className={[
                  "w-full text-left",
                  activeSection === "sound"
                    ? "font-medium text-blue-600"
                    : "text-gray-600 hover:text-gray-900",
                ].join(" ")}
              >
                Sound Settings
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
