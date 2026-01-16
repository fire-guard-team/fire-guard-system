<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Checking Fire Test Results ===\n\n";

// فحص آخر تحليل للحساس 20
$analysis = DB::table('ai_analysis_logs')
    ->where('sensor_id', 20)
    ->orderBy('created_at', 'desc')
    ->first();

if ($analysis) {
    echo "Latest analysis for sensor 20:\n";
    echo "- Risk Score: {$analysis->risk_score}\n";
    echo "- Decision: {$analysis->decision}\n";
    echo "- Created: {$analysis->created_at}\n\n";
} else {
    echo "No analysis found for sensor 20\n\n";
}

// فحص التنبيهات للحساس 20
$alerts = DB::table('alerts')
    ->where('sensor_id', 20)
    ->orderBy('created_at', 'desc')
    ->get();

echo "Alerts for sensor 20: " . $alerts->count() . "\n";
foreach($alerts as $alert) {
    echo "- {$alert->alert_type} (Level: {$alert->alert_level})\n";
    echo "  Created: {$alert->created_at}\n";
}
echo "\n";

// فحص أحداث الحريق
$fires = DB::table('wildfire_events')
    ->orderBy('created_at', 'desc')
    ->get();

echo "Wildfire events: " . $fires->count() . "\n";
foreach($fires as $fire) {
    echo "- Event {$fire->event_id}: Status {$fire->status}, Sector {$fire->sector_id}, Sensor " . ($fire->sensor_id ?? 'N/A') . "\n";
}
echo "\n";

// فحص حالة القطاع 24
$sector = DB::table('sectors')->where('sector_id', 24)->first();
if ($sector) {
    echo "Sector 24 status: {$sector->status}\n";
}

// فحص آخر بيانات بيئية
$envData = DB::table('environmental_data')
    ->where('sensor_id', 20)
    ->orderBy('recorded_at', 'desc')
    ->first();

if ($envData) {
    echo "\nLatest environmental data for sensor 20:\n";
    echo "- Temperature: {$envData->temperature}°C\n";
    echo "- Humidity: {$envData->humidity}%\n";
    echo "- Smoke: {$envData->smoke_level}\n";
    echo "- Recorded: {$envData->recorded_at}\n";
}

echo "\n=== Check Complete ===\n";