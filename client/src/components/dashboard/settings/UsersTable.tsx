import { useEffect, useState } from "react";
import { apiService } from "../../../utils/api";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface User {
  id: number;
  name: string;
  email: string;
  role_id?: number | null;
  role?: {
    id: number;
    role: string;
    name: string;
  } | null;
  avatar?: string;
  status?: string;
}

interface UsersTableProps {
  searchQuery: string;
  onUserEdit: (user: User) => void;
  onUserDelete: (userId: number) => void;
  refreshKey: number;
}

const UsersTable: React.FC<UsersTableProps> = ({
  searchQuery,
  onUserEdit,
  onUserDelete,
  refreshKey,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useSampleData, setUseSampleData] = useState(false);

  const sampleUsers: User[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role_id: 1,
      role: { id: 1, role: "admin", name: "Administrator" },
      avatar: "/assets/images/default-avatar.svg",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role_id: 2,
      role: { id: 2, role: "user", name: "User" },
      avatar: "/assets/images/default-avatar.svg",
      status: "active",
    },
  ];

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      if (useSampleData) {
        setUsers(sampleUsers);
        return;
      }

      const params: any = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await apiService.getUsers(params);

      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && response.data.data) {
        setUsers(response.data.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error loading users:", err);
      setUsers(sampleUsers);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [refreshKey, searchQuery]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <button
          onClick={loadUsers}
          className="px-4 py-2 mt-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto  rounded-lg p-2">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                {searchQuery
                  ? "No users found matching your search."
                  : "No users found. Click 'Add User' to create your first user."}
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => {
              return (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                        src={ "/assets/images/default-avatar.svg"}
                        alt={user.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role?.name || "No Role"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {user.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onUserEdit(user)}
                        className="text-blue-600 hover:text-blue-900 p-2 border border-blue-200 rounded"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${user.name}?`
                            )
                          ) {
                            onUserDelete(user.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 p-2 border border-red-200 rounded"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
