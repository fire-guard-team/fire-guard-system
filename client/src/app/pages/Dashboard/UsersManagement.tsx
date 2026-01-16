import { useState } from "react";
import UsersTable from "../../../components/dashboard/settings/UsersTable";
import AddUserModal from "../../../components/dashboard/settings/AddUserModal";
import { apiService } from "../../../utils/api";

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
}

const UsersManagement = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClick = () => {
    console.log("Add user button clicked");
    setSelectedUser(null);
    setOpenModal(true);
  };

  const handleUserEdit = (user: User) => {
    console.log("Edit user clicked:", user);
    setSelectedUser(user);
    setOpenModal(true);
  };

  const handleUserDelete = async (userId: number) => {
    console.log("Delete user clicked, ID:", userId);
    try {
      await apiService.deleteUser(userId);
      setRefreshKey((prev) => prev + 1);
      alert("User deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete user. Please try again.";
      alert(errorMessage);
    }
  };

  const handleUserAdded = () => {
    setRefreshKey((prev) => prev + 1);
    setOpenModal(false);
    setSelectedUser(null);
    alert("User saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        <button
          onClick={() => {
            console.log("Add User button clicked in header");
            handleAddClick();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 border-2 border-blue-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              console.log("Manual refresh clicked");
              setRefreshKey((prev) => prev + 1);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Refresh data"
          >
            Refresh
          </button>
        </div>

        {/* Users Table */}
        <UsersTable
          searchQuery={searchQuery}
          onUserEdit={handleUserEdit}
          onUserDelete={handleUserDelete}
          refreshKey={refreshKey}
        />
      </div>

      {/* Add/Edit User Modal */}
      {openModal && (
        <div className="border-4 border-red-500 p-2">
          <div className="text-red-600 font-bold text-sm mb-2">🔍 DEBUG: Modal should be visible below</div>
          <AddUserModal
            open={openModal}
            onClose={() => {
              console.log("Modal onClose called");
              setOpenModal(false);
              setSelectedUser(null);
            }}
            onUserAdded={handleUserAdded}
            user={selectedUser}
          />
        </div>
      )}
    </div>
  );
};

export default UsersManagement;