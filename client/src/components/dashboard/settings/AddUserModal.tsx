import { useEffect, useState } from "react";
import { apiService } from "../../../utils/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

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

interface Role {
  id: number;
  role: string;
  name: string;
}

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: () => void;
  user?: User | null;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  open,
  onClose,
  onUserAdded,
  user = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role_id: "",
    avatar: null as File | null,
    status: "active"
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const isEditing = !!user;

  useEffect(() => {
    if (open) {
      loadRoles();
      resetForm();
      setErrors({});
    }
  }, [open, user]);

  const resetForm = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
        role_id: user.role_id?.toString() || "",
        avatar: null,
        status: "active"
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role_id: "",
        avatar: null,
        status: "active",
      });
    }
  };

  const loadRoles = async () => {
    try {
      const response = await apiService.getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error("Error loading roles:", error);
      setRoles([
        { id: 1, role: 'admin', name: 'Administrator' },
        { id: 2, role: 'user', name: 'User' }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const newErrors: Record<string, string[]> = {};

    if (!formData.name.trim()) {
      newErrors.name = ["Name is required"];
    }

    if (!formData.email.trim()) {
      newErrors.email = ["Email is required"];
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = ["Please enter a valid email address"];
    }

    if (!formData.role_id) {
      newErrors.role_id = ["Role is required"];
    }

    if (!formData.status) {
      newErrors.status = ["Status is required"];
    }

    if (!isEditing && !formData.avatar) {
      newErrors.avatar = ["Profile picture is required"];
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = ["Password is required"];
      } else if (formData.password.length < 8) {
        newErrors.password = ["Password must be at least 8 characters"];
      }

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = ["Passwords do not match"];
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      if (isEditing && user) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          role_id: formData.role_id ? parseInt(formData.role_id) : undefined,
          status: formData.status,
        };
        await apiService.updateUser(user.id, updateData);
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password_confirmation', formData.password_confirmation);
        formDataToSend.append('role_id', formData.role_id);
        formDataToSend.append('status', formData.status);
        if (formData.avatar) {
          formDataToSend.append('avatar', formData.avatar);
        }

        await apiService.createUser(formDataToSend);
      }

      onUserAdded();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error saving user:", error);
        const errorMessage = error.response?.data?.message ||
          (isEditing ? "Failed to update user. Please try again." : "Failed to create user. Please try again.");
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: [] }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
          onClick={onClose}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        ></div>

        <div
          className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl border-2 border-blue-500 rounded-2xl"
          style={{ position: 'relative', zIndex: 10000 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {isEditing ? "Edit User" : "Add New User"}
            </h3>
            <div className="mt-2 text-sm text-green-600 font-bold">
              ✅ Modal is visible - Debug mode active
            </div>
            <button
              onClick={() => {
                console.log("Close button clicked in modal");
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors border border-gray-300 rounded p-1"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              console.log("Form submitted");
              handleSubmit(e);
            }}
            className="space-y-4 border border-yellow-300 p-2 rounded"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
              )}
            </div>

            {!isEditing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!isEditing}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!isEditing}
                  />
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation[0]}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role_id}
                onChange={(e) => handleInputChange("role_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <p className="mt-1 text-sm text-red-600">{errors.role_id[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="active">Active - Can Login</option>
                <option value="inactive">Inactive - Cannot Login</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status[0]}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Active users can login to the system, inactive users cannot.
              </p>
            </div>

            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData(prev => ({ ...prev, avatar: file }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!isEditing}
                />
                {errors.avatar && (
                  <p className="mt-1 text-sm text-red-600">{errors.avatar[0]}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Upload a profile picture for the user (JPG, PNG, GIF).
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  console.log("Cancel button clicked");
                  onClose();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-400"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={() => console.log("Submit button clicked")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400"
                disabled={loading}
              >
                {loading ? "Saving..." : (isEditing ? "Update User" : "Create User")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;