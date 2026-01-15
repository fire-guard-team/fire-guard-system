<?php

namespace App\Services;

use App\Models\Sector;
use Illuminate\Support\Facades\DB;

class SectorResolverService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function resolveByPoint(float $lat, float $lng): ?int
    {
        return Sector::whereRaw(
            "ST_Contains(boundary, ST_SetSRID(ST_Point(?, ?), 4326))",
            [$lng, $lat]
        )->value('sector_id');
    }
}
