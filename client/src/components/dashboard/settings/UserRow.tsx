type User = {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  avatar?: string | null;
}

interface UserRowProps {
  user: User;
  // kept optional to avoid any stale type requirements; not displayed in UI
  status?: string;
  roleName: string;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const UserRow = ({ user, roleName, onSelect, onEdit, onDelete }: UserRowProps) => {
  const avatarSrc = user.avatar_url || user.avatar || "";

  return (
    <tr className="border-t border-border hover:bg-gray-50">
      <td className="p-3 font-medium cursor-pointer" onClick={onSelect}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-gray-600 text-xs font-semibold">
                {user.name?.trim()?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <span>{user.name}</span>
        </div>
      </td>
      <td className="cursor-pointer" onClick={onSelect}>{user.email}</td>
      <td>
        <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
          {roleName}
        </span>
      </td>
      {(onEdit || onDelete) && (
        <td>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                    onDelete();
                  }
                }}
                className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  )
}

export default UserRow
