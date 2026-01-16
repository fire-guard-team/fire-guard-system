<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /**
     * 📌 GET /roles
     * قائمة الأدوار
     */
    public function index(): JsonResponse
    {
        $roles = Role::orderBy('name')->get(['id', 'role', 'name']);

        return response()->json($roles);
    }

    /**
     * 📌 POST /roles
     * إنشاء دور جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'max:50', 'unique:roles,role'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        $role = Role::create($validated);

        return response()->json($role, 201);
    }

    /**
     * 📌 PUT /roles/{role}
     * تحديث دور
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['sometimes', 'required', 'string', 'max:50', 'unique:roles,role,' . $role->id],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
        ]);

        $role->update($validated);

        return response()->json($role);
    }

    /**
     * 📌 DELETE /roles/{role}
     * حذف دور
     */
    public function destroy(Role $role): JsonResponse
    {
        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully'
        ]);
    }
}
