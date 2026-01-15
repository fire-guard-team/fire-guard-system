interface HeaderProps {
  onAddClick?: () => void;
}

const Header = ({ onAddClick }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-semibold">Manage Users</h1>

      <button
        onClick={onAddClick}
        className="bg-green-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-green-600 transition-colors"
      >
        + Add User
      </button>
    </div>
  )
}

export default Header
