const Sidebar = () => {
  return (
    <aside className="bg-white border-r border-border p-4">
      <h2 className="text-lg font-semibold mb-6">Settings & User Management</h2>

      <nav className="space-y-4 text-sm">
        <div>
          <p className="text-gray-400 mb-2">User Management</p>
          <ul className="space-y-2">
            <li className="font-medium text-blue-600">Users</li>
            <li className="text-gray-600">Roles & Permissions</li>
          </ul>
        </div>

        <div>
          <p className="text-gray-400 mb-2">System Configuration</p>
          <ul className="space-y-2 text-gray-600">
            <li>General Settings</li>
            <li>Alert Thresholds</li>
          </ul>
        </div>

        <div>
          <p className="text-gray-400 mb-2">Alert Preferences</p>
          <ul className="space-y-2 text-gray-600">
            <li>Notification Settings</li>
            <li>Sound Settings</li>
          </ul>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
