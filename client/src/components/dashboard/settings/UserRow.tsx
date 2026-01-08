type User = {
  name: string
  email: string
  role: string
  status: string
}

const statusStyles: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  "Invitation pending": "bg-red-100 text-red-600",
}

const UserRow = ({ user }: { user: User }) => {
  return (
    <tr className="border-t border-border">
      <td className="p-3 font-medium">{user.name}</td>
      <td>{user.email}</td>
      <td>
        <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
          {user.role}
        </span>
      </td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            statusStyles[user.status]
          }`}
        >
          {user.status}
        </span>
      </td>
    </tr>
  )
}

export default UserRow
