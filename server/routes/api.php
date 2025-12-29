<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SensorController;
use App\Http\Controllers\GatewayController;
use App\Http\Controllers\SectorController;
use App\Http\Controllers\TelemetryController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/profile', function (Request $request) {
        return $request->user();
    });

    Route::post('/telemetry/ingest', [TelemetryController::class, 'ingest']);


    /* Route::post('/sensors', SensorController::class); */
    Route::apiResource('/sensors', SensorController::class);
    /*    Route::apiResource('sensors', SensorController::class);

    // Gateways CRUD
    Route::apiResource('gateways', GatewayController::class);

    // Sectors CRUD + Special endpoints
    Route::get('/sectors/map', [SectorController::class, 'map']);
    Route::apiResource('sectors', SectorController::class);

    // Telemetry ingestion endpoint
    Route::post('/telemetry/ingest', [TelemetryController::class, 'ingest']); */
});
