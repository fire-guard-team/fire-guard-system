import UserRow from "./UserRow"

const users = [
  {
    name: "Mohammed Ismail",
    email: "mohammed.z.ismaeel@gmail.com",
    role: "Administrator",
    status: "Active",
  },
  {
    name: "Ayman El-lahham",
    email: "Aymanelahhm@gmail.com",
    role: "Control Room Operator",
    status: "Active",
  },
  {
    name: "Charlie Brown",
    email: "charlie.b@wildfirewatch.ai",
    role: "Environmental Analyst",
    status: "Invitation pending",
  },
]

const UsersTable = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-border">
        <input
          type="text"
          placeholder="Search users by name or email..."
          className="w-full border border-border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user, index) => (
            <UserRow key={index} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsersTable
