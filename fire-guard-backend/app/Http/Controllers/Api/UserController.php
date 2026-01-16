<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    private function appendAvatarUrl(User $user): User
    {
        $avatar = $user->avatar;

        if (! $avatar) {
            $user->avatar_url = null;
            return $user;
        }

        if (str_starts_with($avatar, 'http://') || str_starts_with($avatar, 'https://')) {
            $user->avatar_url = $avatar;
            return $user;
        }

        $host = request()->getSchemeAndHttpHost();

        if (str_starts_with($avatar, 'storage/app/public/')) {
            $normalized = substr($normalized, strlen('storage/app/public/'));
        }

        if (str_starts_with($avatar, 'public/')) {
            $normalized = substr($normalized, strlen('public/'));
        }

        if (str_starts_with($avatar, 'storage/')) {
            $user->avatar_url = $host . '/' . $normalized;
        }

        if (str_starts_with($avatar, '/storage/')) {
        $normalized = ltrim($avatar, '/');

        if (str_starts_with($normalized, 'storage/app/public/')) {
            $normalized = substr($normalized, strlen('storage/app/public/')); // -> avatars/xxx.png
        }

        if (str_starts_with($normalized, 'public/')) {
            $normalized = substr($normalized, strlen('public/')); // -> avatars/xxx.png
        }

        if (str_starts_with($normalized, 'storage/')) {
            $user->avatar_url = $host . '/' . $normalized; // -> http://host/storage/avatars/xxx.png
            return $user;
        }

        if (str_starts_with($avatar, '/storage/')) {
            $user->avatar_url = $host . $avatar;
            return $user;
        }

        $publicPath = Storage::disk('public')->url($normalized); // usually /storage/avatars/...
        $user->avatar_url = str_starts_with($publicPath, 'http')
            ? $publicPath
            : $host . $publicPath;

        return $user;
    }

    /**
     * 📌 GET /users
     * قائمة المستخدمين + فلاتر
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('role')
            ->orderByDesc('created_at');

        // 🔍 فلترة حسب البحث (اسم أو إيميل)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereRaw('LOWER(email) LIKE ?', ['%' . strtolower($search) . '%']);
            });
        }

        // 🔍 فلترة حسب الدور
        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $users = $query->paginate(15);
        $users->getCollection()->transform(function ($user) {
            return $this->appendAvatarUrl($user);
        });

        return response()->json($users);
    }

    /**
     * 📌 GET /users/{user}
     * تفاصيل مستخدم واحد
     */
    public function show(User $user): JsonResponse
    {
        $user->load('role');

        return response()->json($this->appendAvatarUrl($user));
    }

    /**
     * 📌 POST /users
     * إضافة مستخدم جديد
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role_id' => ['nullable', 'exists:roles,id'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'] ?? null,
            'avatar' => $avatarPath,
            'status' => $validated['status'],
            // Admin creates users directly (no invitation flow)
            'email_verified_at' => now(),
        ]);

        $user->load('role');

        return response()->json($this->appendAvatarUrl($user), 201);
    }

    /**
     * 📌 PUT /users/{user}
     * تحديث مستخدم
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'unique:users,email,' . $user->id],
            'password' => ['sometimes', 'string', 'min:8', 'confirmed'],
            'role_id' => ['nullable', 'exists:roles,id'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'status' => ['sometimes', 'required', 'in:active,inactive'],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($validated);
        $user->load('role');

        return response()->json($this->appendAvatarUrl($user));
    }

    /**
     * 📌 DELETE /users/{user}
     * حذف مستخدم
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
