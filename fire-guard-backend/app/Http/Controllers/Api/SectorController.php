<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use App\Models\ProjectArea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SectorController extends Controller
{
    /**
     * 📌 GET /sectors
     * قائمة القطاعات
     */
    public function index(): JsonResponse
    {
        $activeArea = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();

        $query = Sector::query()->orderBy('name');

        // Only sectors inside active project area should be selectable/visible.
        if ($activeArea) {
            $query->whereNotNull('boundary')
                ->whereRaw(
                    "ST_Within(boundary, (SELECT boundary FROM project_areas WHERE id = ?))",
                    [$activeArea->id]
                );
        }

        $sectors = $query->get(['sector_id', 'name']);

        return response()->json($sectors);
    }

    /**
     * 📌 GET /sectors/geo
     * Polygons for map rendering (GeoJSON)
     */
    public function geo(): JsonResponse
    {
        $activeArea = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();

        $query = Sector::query()
            ->whereNotNull('boundary')
            ->orderBy('name');

        if ($activeArea) {
            $query->whereRaw(
                "ST_Within(boundary, (SELECT boundary FROM project_areas WHERE id = ?))",
                [$activeArea->id]
            );
        }

        $rows = $query
            ->select(['sector_id', 'project_area_id', 'name', 'status'])
            ->selectRaw("ST_AsGeoJSON(boundary)::json as boundary")
            ->get();

        return response()->json($rows);
    }

    /**
     * 📌 POST /sectors
     * إضافة قطاع جديد
     */
    public function store(Request $request): JsonResponse
    {
        // الحصول على منطقة المشروع النشطة
        $activeArea = ProjectArea::query()->where('is_active', true)->orderBy('id')->first();

        if (!$activeArea) {
            return response()->json([
                'message' => 'لا توجد منطقة مشروع نشطة'
            ], 400);
        }

        // التحقق من صحة البيانات
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('sectors')->where(function ($query) use ($activeArea) {
                    return $query->where('project_area_id', $activeArea->id);
                })
            ],
            'boundary' => 'required|array',
            'status' => 'sometimes|in:Safe,Warning,Fire'
        ], [
            'name.required' => 'اسم القطاع مطلوب',
            'name.unique' => 'اسم القطاع موجود مسبقاً في هذه المنطقة',
            'boundary.required' => 'حدود القطاع مطلوبة',
            'boundary.array' => 'حدود القطاع يجب أن تكون مصفوفة GeoJSON',
            'status.in' => 'الحالة يجب أن تكون إحدى: Safe, Warning, Fire'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // تحويل البيانات إلى WKT للتحقق والحفظ
            $boundaryGeoJson = json_encode($request->boundary);
            $boundaryWkt = DB::selectOne("SELECT ST_AsText(ST_GeomFromGeoJSON(?)) as wkt", [$boundaryGeoJson])->wkt;

            if (!$boundaryWkt) {
                return response()->json([
                    'message' => 'حدود القطاع غير صحيحة'
                ], 422);
            }

            // التحقق من أن القطاع داخل منطقة المشروع النشطة
            $isWithin = DB::selectOne("
                SELECT ST_Within(
                    ST_GeomFromText(?, 4326),
                    (SELECT boundary FROM project_areas WHERE id = ?)
                ) as is_within
            ", [$boundaryWkt, $activeArea->id])->is_within;

            if (!$isWithin) {
                return response()->json([
                    'message' => 'القطاع يجب أن يكون داخل منطقة المشروع النشطة'
                ], 422);
            }

            // التحقق من عدم تداخل القطاع مع قطاعات أخرى موجودة
            $overlaps = DB::selectOne("
                SELECT COUNT(*) as count FROM sectors
                WHERE project_area_id = ?
                AND ST_Overlaps(boundary, ST_GeomFromText(?, 4326))
            ", [$activeArea->id, $boundaryWkt])->count;

            if ($overlaps > 0) {
                return response()->json([
                    'message' => 'القطاع يتداخل مع قطاع آخر موجود'
                ], 422);
            }

            // إنشاء القطاع الجديد
            $sector = Sector::create([
                'project_area_id' => $activeArea->id,
                'name' => $request->name,
                'status' => $request->status ?? 'Safe',
                'boundary' => DB::raw("ST_GeomFromText('{$boundaryWkt}', 4326)"),
            ]);

            // إرجاع البيانات مع GeoJSON
            $sectorData = DB::selectOne("
                SELECT
                    sector_id,
                    project_area_id,
                    name,
                    status,
                    ST_AsGeoJSON(boundary)::json as boundary
                FROM sectors
                WHERE sector_id = ?
            ", [$sector->sector_id]);

            return response()->json([
                'message' => 'تم إضافة القطاع بنجاح',
                'sector' => $sectorData
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'حدث خطأ أثناء إضافة القطاع',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
