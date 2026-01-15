"use client";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "./Sidebar"
import Header from "./Header"
import UsersTable from "./UsersTable"
import AddUserModal from "./AddUserModal"
import { apiService } from "../../../utils/api";
import RolesPermissions from "./sections/RolesPermissions";
import GeneralSettings from "./sections/GeneralSettings";
import AlertThresholds from "./sections/AlertThresholds";
import NotificationSettings from "./sections/NotificationSettings";
import SoundSettings from "./sections/SoundSettings";

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

const SettingsLayout = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = (searchParams.get("section") || "users") as any;
  const activeSection =
    (["users", "roles", "general", "thresholds", "notifications", "sound"].includes(sectionParam)
      ? sectionParam
      : "users") as
      | "users"
      | "roles"
      | "general"
      | "thresholds"
      | "notifications"
      | "sound";

  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClick = () => {
    setSelectedUser(null);
    setOpenModal(true);
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  const handleUserDelete = async (userId: number) => {
    try {
      await apiService.deleteUser(userId);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleUserAdded = () => {
    setRefreshKey((prev) => prev + 1);
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleSelectSection = (
    section:
      | "users"
      | "roles"
      | "general"
      | "thresholds"
      | "notifications"
      | "sound"
  ) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("section", section);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSelect={handleSelectSection} />

      <main className="flex-1 p-6">
        {activeSection === "users" && (
          <>
            <Header onAddClick={handleAddClick} />
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <UsersTable
              searchQuery={searchQuery}
              onUserEdit={handleUserEdit}
              onUserDelete={handleUserDelete}
              refreshKey={refreshKey}
            />
            <AddUserModal
              open={openModal}
              onClose={() => {
                setOpenModal(false);
                setSelectedUser(null);
              }}
              onUserAdded={handleUserAdded}
              user={selectedUser}
            />
          </>
        )}

        {activeSection === "roles" && <RolesPermissions />}
        {activeSection === "general" && <GeneralSettings />}
        {activeSection === "thresholds" && <AlertThresholds />}
        {activeSection === "notifications" && <NotificationSettings />}
        {activeSection === "sound" && <SoundSettings />}
      </main>
    </div>
  )
}

export default SettingsLayout
