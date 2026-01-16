<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\MockDataGenerator;
use Illuminate\Support\Facades\DB;

// توليد بيانات حريق للاختبار
echo "=== Generating Fire Test Data ===\n\n";

$generator = new MockDataGenerator();

// الحصول على sensor عشوائي
$sensor = DB::table('sensors')
    ->whereNotNull('sector_id')
    ->inRandomOrder()
    ->first();

if (!$sensor) {
    echo "❌ No sensors found with sectors\n";
    exit(1);
}

echo "Selected sensor: {$sensor->name} (ID: {$sensor->sensor_id}) in sector {$sensor->sector_id}\n";

// توليد بيانات حريق
$fireTelemetry = [
    'gateway_id' => 1,
    'network_quality' => 'good',
    'sensors' => [
        [
            'sensor_id' => $sensor->sensor_id,
            'timestamp' => now()->toISOString(),
            'environment' => [
                'temperature' => 85 + rand(0, 20), // 85-105°C
                'humidity' => rand(5, 15), // 5-15%
                'smoke' => 3.0 + (rand(0, 20) / 10), // 3.0-5.0
            ],
            'battery_level' => rand(60, 90),
            'signal_strength' => rand(-75, -45)
        ]
    ]
];

echo "Generated fire data:\n";
echo "- Temperature: {$fireTelemetry['sensors'][0]['environment']['temperature']}°C\n";
echo "- Humidity: {$fireTelemetry['sensors'][0]['environment']['humidity']}%\n";
echo "- Smoke: {$fireTelemetry['sensors'][0]['environment']['smoke']}\n\n";

// إرسال البيانات
$result = $generator->sendToApi($fireTelemetry);

if ($result['success']) {
    echo "✅ Fire data sent successfully!\n";

    // فحص النتائج
    $analysis = DB::table('ai_analysis_logs')
        ->where('sensor_id', $sensor->sensor_id)
        ->orderBy('created_at', 'desc')
        ->first();

    if ($analysis) {
        echo "AI Analysis: Risk {$analysis->risk_score}, Decision: {$analysis->decision}\n";
    }

    $alert = DB::table('alerts')
        ->where('sensor_id', $sensor->sensor_id)
        ->orderBy('created_at', 'desc')
        ->first();

    if ($alert) {
        echo "Alert Created: {$alert->alert_type} (Level: {$alert->alert_level})\n";
    }

    $fire = DB::table('wildfire_events')
        ->where('sensor_id', $sensor->sensor_id)
        ->orderBy('created_at', 'desc')
        ->first();

    if ($fire) {
        echo "Fire Event Created: Status {$fire->status}\n";
    }

    // فحص حالة القطاع
    $sector = DB::table('sectors')
        ->where('sector_id', $sensor->sector_id)
        ->first();

    if ($sector) {
        echo "Sector Status: {$sector->status}\n";
    }

} else {
    echo "❌ Failed to send fire data: HTTP {$result['status']}\n";
    echo "Error: " . ($result['error'] ?? 'Unknown') . "\n";
}

echo "\n=== Fire Test Complete ===\n";
echo "Check your frontend for fire alerts and sector status updates!\n";