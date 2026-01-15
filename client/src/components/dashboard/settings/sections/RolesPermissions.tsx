"use client";
import { useEffect, useMemo, useState } from "react";
import { apiService } from "../../../../utils/api";

type Role = {
  id: number;
  role: string;
  name: string;
};

type RoleForm = {
  role: string;
  name: string;
};

const RolesPermissions = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleForm>({ role: "", name: "" });

  const title = useMemo(() => "Roles & Permissions", []);

  const loadRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiService.getRoles();
      setRoles(data || []);
    } catch (e) {
      console.error("Error loading roles:", e);
      setRoles([]);
      setError(e instanceof Error ? e.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const openCreate = () => {
    setEditingRole(null);
    setForm({ role: "", name: "" });
    setOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setForm({ role: role.role, name: role.name });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditingRole(null);
    setForm({ role: "", name: "" });
    setError("");
  };

  const submit = async () => {
    setError("");
    if (!form.role.trim() || !form.name.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editingRole) {
        await apiService.updateRole(editingRole.id, {
          role: form.role.trim(),
          name: form.name.trim(),
        });
      } else {
        await apiService.createRole({
          role: form.role.trim(),
          name: form.name.trim(),
        });
      }
      await loadRoles();
      close();
    } catch (e) {
      console.error("Error saving role:", e);
      setError(e instanceof Error ? e.message : "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (role: Role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiService.deleteRole(role.id);
      await loadRoles();
    } catch (e) {
      console.error("Error deleting role:", e);
      setError(e instanceof Error ? e.message : "Failed to delete role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <button
          type="button"
          onClick={openCreate}
          className="bg-green-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-green-600 transition-colors"
        >
          + Add Role
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-border">
        <div className="p-4 border-b border-border">
          {loading ? (
            <div className="text-gray-500 text-sm">Loading roles...</div>
          ) : (
            <div className="text-gray-600 text-sm">
              Manage available roles. (Permissions can be added later if needed.)
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Role Key</th>
                <th>Name</th>
                <th className="w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{r.role}</td>
                  <td>{r.name}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                        disabled={saving}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r)}
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && roles.length === 0 && (
                <tr className="border-t border-border">
                  <td className="p-3 text-gray-500" colSpan={3}>
                    No roles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingRole ? "Edit Role" : "Add New Role"}
              </h2>
              <button
                type="button"
                onClick={close}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Role Key <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  placeholder="e.g. admin"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Administrator"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-green-500 text-white font-semibold disabled:opacity-50"
              >
                {saving ? "Saving..." : editingRole ? "Update Role" : "Add Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RolesPermissions;

