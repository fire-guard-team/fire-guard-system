<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Fire Guard System Monitor ===\n\n";

echo "=== Recent AI Analysis (Last 10) ===\n";
$analyses = DB::table('ai_analysis_logs')->orderBy('created_at', 'desc')->take(10)->get();
foreach($analyses as $analysis) {
    echo "Sensor " . $analysis->sensor_id . ": Risk " . $analysis->risk_score . ", Decision: " . $analysis->decision . " (" . $analysis->created_at . ")\n";
}

echo "\n=== Recent Alerts (Last 5) ===\n";
$alerts = DB::table('alerts')->orderBy('created_at', 'desc')->take(5)->get();
foreach($alerts as $alert) {
    echo $alert->alert_type . " (Level: " . $alert->alert_level . ") - Sensor " . $alert->sensor_id . " (" . $alert->created_at . ")\n";
}

echo "\n=== Sector Status ===\n";
$sectors = DB::table('sectors')->orderBy('sector_id')->get();
foreach($sectors as $sector) {
    echo "Sector " . $sector->sector_id . " (" . $sector->name . "): " . $sector->status . "\n";
}

echo "\n=== Environmental Data (Last 10) ===\n";
$envData = DB::table('environmental_data')
    ->join('sensors', 'environmental_data.sensor_id', '=', 'sensors.sensor_id')
    ->orderBy('environmental_data.recorded_at', 'desc')
    ->take(10)
    ->select('environmental_data.*', 'sensors.name as sensor_name')
    ->get();

foreach($envData as $data) {
    echo $data->sensor_name . ": " . $data->temperature . "°C, " . $data->humidity . "%, smoke: " . $data->smoke_level . " (" . $data->recorded_at . ")\n";
}

echo "\n=== System Statistics ===\n";
$stats = [
    'sensors' => DB::table('sensors')->count(),
    'sectors' => DB::table('sectors')->count(),
    'gateways' => DB::table('gateways')->count(),
    'alerts' => DB::table('alerts')->count(),
    'analyses' => DB::table('ai_analysis_logs')->count(),
    'env_data' => DB::table('environmental_data')->count(),
    'fires' => DB::table('wildfire_events')->count()
];

foreach($stats as $key => $value) {
    echo ucfirst($key) . ": " . $value . "\n";
}

echo "\n=== Monitor Complete ===\n";