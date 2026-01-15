import { useState, useEffect } from "react";
import type { FC } from "react";
import { FaTimes } from "react-icons/fa";
import { apiService } from "../../../utils/api";

interface Role {
  id: number;
  role: string;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  avatar_url?: string | null;
  role_id?: number | null;
  role?: {
    id: number;
    role: string;
    name: string;
  } | null;
}

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserAdded?: () => void;
  user?: User | null;
}

const AddUserModal: FC<AddUserModalProps> = ({ open, onClose, onUserAdded, user }) => {
  const isEditMode = !!user;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (open) {
      loadRoles();
      if (isEditMode && user) {
        // Fill form with current user data
        setName(user.name || "");
        setEmail(user.email || "");
        setRoleId(user.role_id || user.role?.id || null);
        setPassword("");
        setPasswordConfirmation("");
        setAvatarFile(null);
        setAvatarPreviewUrl(user.avatar_url || user.avatar || "");
        setError("");
      } else {
        // Reset form when modal opens for adding new user
        setName("");
        setEmail("");
        setPassword("");
        setPasswordConfirmation("");
        setAvatarFile(null);
        setAvatarPreviewUrl("");
        setRoleId(null);
        setError("");
      }
    }
  }, [open, isEditMode, user]);

  useEffect(() => {
    if (!open) return;
    if (!avatarFile) return;

    const url = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [open, avatarFile]);

  const loadRoles = async () => {
    try {
      const response = await apiService.getRoles();
      setRoles(response || []);
    } catch (error) {
      console.error("Error loading roles:", error);
      setRoles([]);
    }
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (!isEditMode && !password.trim()) {
      setError("Password is required for new users");
      return;
    }

    if (password && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password && password !== passwordConfirmation) {
      setError("Password confirmation does not match");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      if (roleId) formData.append("role_id", String(roleId));

      if (password) {
        formData.append("password", password);
        formData.append("password_confirmation", passwordConfirmation);
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (isEditMode && user) {
        await apiService.updateUser(user.id, formData);
      } else {
        await apiService.createUser(formData);
      }
      
      onUserAdded?.();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (isEditMode ? "Failed to update user" : "Failed to add user");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{isEditMode ? "Edit User" : "Add New User"}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Avatar (Optional)</label>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                {avatarPreviewUrl ? (
                  <img
                    src={avatarPreviewUrl}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm font-semibold">
                    {name?.trim()?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setAvatarFile(file);
                }}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="e.g. john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Password {!isEditMode && <span className="text-red-500">*</span>}
              {isEditMode && <span className="text-gray-500 text-xs">(Leave empty to keep current password)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
              minLength={isEditMode ? undefined : 8}
              required={!isEditMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Password Confirmation {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              placeholder={isEditMode ? "Confirm new password (optional)" : "Confirm password"}
              required={!isEditMode}
              disabled={isEditMode && !password}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role (Optional)</label>
            <select
              value={roleId || ""}
              onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-green-500 text-white font-semibold disabled:opacity-50"
          >
            {loading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update User" : "Add User")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
