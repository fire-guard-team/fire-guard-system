const Header = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-semibold">Manage Users</h1>

      <button className="bg-green-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer">
        + Invite New
      </button>
    </div>
  )
}

export default Header
