<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use Illuminate\Http\JsonResponse;

class SectorController extends Controller
{
    /**
     * 📌 GET /sectors
     * قائمة القطاعات
     */
    public function index(): JsonResponse
    {
        $sectors = Sector::orderBy('name')->get(['sector_id', 'name']);

        return response()->json($sectors);
    }
}
