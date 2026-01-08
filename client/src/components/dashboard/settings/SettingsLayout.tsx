import Sidebar from "./Sidebar"
import Header from "./Header"
import UsersTable from "./UsersTable"

const SettingsLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6">
        <Header />
        <UsersTable />
      </main>
    </div>
  )
}

export default SettingsLayout
