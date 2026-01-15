<?php

use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GatewayTelemetryController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\SectorController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TelemetryController;


Route::post('/auth/login', [AuthController::class, 'login']);

Route::prefix('v1')->group(function () {
    Route::post('/telemetry', [TelemetryController::class, 'store']);
    Route::post('/gateway/telemetry', [GatewayTelemetryController::class, 'store']);
});

Route::middleware('auth:sanctum')->prefix('v1/alerts')->group(function () {

    Route::get('/', [AlertController::class, 'index']);          // قائمة + فلاتر
    Route::get('/{alert}', [AlertController::class, 'show']);    // تفاصيل
    Route::post('/{alert}/ack', [AlertController::class, 'ack']); // Acknowledge
    Route::get('/stats/summary', [AlertController::class, 'stats']); // Dashboard
});

Route::middleware('auth:sanctum')->prefix('v1/sectors')->group(function () {
    Route::get('/', [SectorController::class, 'index']); // قائمة القطاعات
});

Route::middleware('auth:sanctum')->prefix('v1/sensors')->group(function () {
    Route::get('/', [SensorController::class, 'index']);          // قائمة + فلاتر
    Route::post('/', [SensorController::class, 'store']);         // إضافة جديد
    Route::get('/stats/summary', [SensorController::class, 'stats']); // إحصائيات
    Route::get('/{sensor}', [SensorController::class, 'show']);   // تفاصيل
    Route::get('/{sensor}/telemetry', [SensorController::class, 'telemetry']); // البيانات التاريخية
    Route::put('/{sensor}', [SensorController::class, 'update']); // تحديث
    Route::delete('/{sensor}', [SensorController::class, 'destroy']); // حذف
});

Route::middleware('auth:sanctum')->prefix('v1/reports')->group(function () {
    Route::get('/analytics', [ReportController::class, 'analytics']); // التقارير والتحليلات
    Route::get('/export/{format}', [ReportController::class, 'export']); // تصدير البيانات (csv, pdf, excel)
});

Route::middleware('auth:sanctum')->prefix('v1/roles')->group(function () {
    Route::get('/', [RoleController::class, 'index']); // قائمة الأدوار
    Route::post('/', [RoleController::class, 'store']); // إضافة دور
    Route::put('/{role}', [RoleController::class, 'update']); // تحديث دور
    Route::delete('/{role}', [RoleController::class, 'destroy']); // حذف دور
});

Route::middleware('auth:sanctum')->prefix('v1/users')->group(function () {
    Route::get('/', [UserController::class, 'index']);          // قائمة + فلاتر
    Route::post('/', [UserController::class, 'store']);         // إضافة جديد
    Route::get('/{user}', [UserController::class, 'show']);   // تفاصيل
    Route::put('/{user}', [UserController::class, 'update']); // تحديث
    Route::delete('/{user}', [UserController::class, 'destroy']); // حذف
});

Route::middleware('auth:sanctum')->prefix('v1/settings')->group(function () {
    Route::get('/', [SettingsController::class, 'index']); // get settings
    Route::put('/', [SettingsController::class, 'update']); // update settings
});

