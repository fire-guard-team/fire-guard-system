"use client";
import { useState, useEffect } from "react";
import UserRow from "./UserRow";
import { apiService } from "../../../utils/api";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  avatar_url?: string | null;
  role?: {
    id: number;
    role: string;
    name: string;
  } | null;
}

interface UsersTableProps {
  searchQuery?: string;
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (userId: number) => void;
  refreshKey?: number;
}

const UsersTable = ({ searchQuery = "", onUserSelect, onUserEdit, onUserDelete, refreshKey }: UsersTableProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage };
      if (searchQuery) params.search = searchQuery;
      
      const response = await apiService.getUsers(params);
      setUsers(response.data || []);
      setTotalPages(response.last_page || 1);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchQuery, refreshKey]);

  const getRoleName = (user: User): string => {
    return user.role?.name || "No Role";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-border">
        {loading && (
          <div className="text-center py-4 text-gray-500">Loading users...</div>
        )}
      </div>

      {!loading && users.length === 0 && (
        <div className="text-center py-8 text-gray-500">No users found</div>
      )}

      {!loading && users.length > 0 && (
        <>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th>Email</th>
                <th>Role</th>
                {onUserEdit || onUserDelete ? <th>Actions</th> : null}
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  status="Active"
                  roleName={getRoleName(user)}
                  onSelect={onUserSelect ? () => onUserSelect(user) : undefined}
                  onEdit={onUserEdit ? () => onUserEdit(user) : undefined}
                  onDelete={onUserDelete ? () => onUserDelete(user.id) : undefined}
                />
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 p-4 border-t border-border">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsersTable;
