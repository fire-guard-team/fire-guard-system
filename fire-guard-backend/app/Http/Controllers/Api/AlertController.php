<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AlertController extends Controller
{
    /**
     * 📌 GET /alerts
     * قائمة التنبيهات + فلاتر
     */
    public function index(Request $request): JsonResponse
    {
        $query = Alert::with(['sector', 'sensor', 'event'])
            ->orderByDesc('created_at');

        // 🔍 فلترة حسب الحالة
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->whereNull('acknowledged_at');
            }

            if ($request->status === 'acknowledged') {
                $query->whereNotNull('acknowledged_at');
            }
        }

        // 🔍 فلترة حسب المستوى
        if ($request->filled('level')) {
            $query->where('alert_level', $request->level);
        }

        return response()->json(
            $query->paginate(15)
        );
    }

    /**
     * 📌 GET /alerts/{alert}
     * تفاصيل تنبيه واحد
     */
    public function show(Alert $alert): JsonResponse
    {
        $alert->load(['sector', 'sensor', 'event']);

        return response()->json($alert);
    }

    /**
     * 📌 POST /alerts/{alert}/ack
     * تأكيد قراءة التنبيه
     */
    public function ack(Alert $alert): JsonResponse
    {
        if ($alert->acknowledged_at) {
            return response()->json([
                'message' => 'Alert already acknowledged'
            ], 409);
        }

        $alert->update([
            'acknowledged_at' => now(),
        ]);

        return response()->json([
            'message' => 'Alert acknowledged successfully',
            'alert' => $alert,
        ]);
    }

    /**
     * 📌 GET /alerts/stats/summary
     * إحصائيات للـ Dashboard
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => Alert::count(),
            'active' => Alert::whereNull('acknowledged_at')->count(),
            'acknowledged' => Alert::whereNotNull('acknowledged_at')->count(),

            'by_level' => [
                'High' => Alert::where('alert_level', 'High')->count(),
                'Medium' => Alert::where('alert_level', 'Medium')->count(),
                'Low' => Alert::where('alert_level', 'Low')->count(),
            ],
        ]);
    }
}
