<?php

namespace App\Http\Controllers;

use App\Models\Sensor;
use Illuminate\Http\Request;
use App\Http\Requests\StoreSensorRequest;
use App\Http\Requests\UpdateSensorRequest;
use Illuminate\Support\Facades\DB;

class SensorController extends Controller
{
    public function index()
    {
        return Sensor::with(['type','sector'])->get();
    }

    public function store(StoreSensorRequest $request)
    {
        $sensor = Sensor::create($request->validated());

        if ($sensor->latitude && $sensor->longitude) {
            DB::statement("UPDATE sensors SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE sensor_id = ?", [
                $sensor->longitude,
                $sensor->latitude,
                $sensor->sensor_id
            ]);
        }

        return response()->json([
            'message' => 'Sensor created successfully',
            'data' => $sensor
        ], 201);
    }

    public function show($id)
    {
        $sensor = Sensor::with(['type','sector'])->findOrFail($id);
        return $sensor;
    }

    public function update(UpdateSensorRequest $request, $id)
    {
        $sensor = Sensor::findOrFail($id);

        $sensor->update($request->validated());

        if ($sensor->latitude && $sensor->longitude) {
            DB::statement("UPDATE sensors SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE sensor_id = ?", [
                $sensor->longitude,
                $sensor->latitude,
                $sensor->sensor_id
            ]);
        }

        return response()->json([
            'message' => 'Sensor updated successfully',
            'data' => $sensor
        ]);
    }

    public function destroy($id)
    {
        $sensor = Sensor::findOrFail($id);
        $sensor->delete();

        return response()->json(['message' => 'Sensor deleted successfully']);
    }
}
