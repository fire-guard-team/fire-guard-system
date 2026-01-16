<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * 📌 GET /settings
     * Get all settings as key/value map
     */
    public function index(): JsonResponse
    {
        $map = Setting::query()
            ->get(['key', 'value'])
            ->mapWithKeys(fn ($row) => [$row->key => $row->value])
            ->toArray();

        return response()->json([
            'settings' => $map,
        ]);
    }

    /**
     * 📌 PUT /settings
     * Update settings (bulk)
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
        ]);

        $settings = $validated['settings'];
        $userId = $request->user()?->id;

        foreach ($settings as $key => $value) {
            // only allow string keys
            if (! is_string($key) || $key === '') {
                continue;
            }

            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'updated_by' => $userId,
                ]
            );
        }

        return $this->index();
    }
}

