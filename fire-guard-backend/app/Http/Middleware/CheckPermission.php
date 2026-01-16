<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!$user->status === 'active') {
            return response()->json(['message' => 'Your account is inactive. Please contact administrator.'], 403);
        }

        if (!$user->hasPermission($permission)) {
            return response()->json(['message' => 'Access denied. Insufficient permissions.'], 403);
        }

        return $next($request);
    }
}
