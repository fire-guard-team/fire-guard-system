<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\MockDataGenerator;
use Illuminate\Support\Facades\DB;

// التحقق من المتطلبات
echo "=== Fire Guard System Simulation ===\n\n";

// فحص الـ gateways
$gateways = DB::table('gateways')->count();
if ($gateways === 0) {
    echo "❌ No gateways found. Run: php artisan migrate\n";
    exit(1);
}
echo "✅ Found {$gateways} gateways\n";

// فحص الـ sensors
$sensors = DB::table('sensors')->whereNotNull('sector_id')->count();
if ($sensors === 0) {
    echo "❌ No sensors with sectors found.\n";
    exit(1);
}
echo "✅ Found {$sensors} sensors with sectors\n\n";

$generator = new MockDataGenerator();

// تشغيل محاكاة واحدة
echo "Generating and sending telemetry...\n";

try {
    $telemetry = $generator->generateMockTelemetry(1);
    echo "Generated telemetry for " . count($telemetry['sensors']) . " sensors\n";

    // طباعة عينة
    if (count($telemetry['sensors']) > 0) {
        $sample = $telemetry['sensors'][0];
        echo "Sample: Temp {$sample['environment']['temperature']}°C, Humidity {$sample['environment']['humidity']}%, Smoke {$sample['environment']['smoke']}\n";
    }

    // إرسال البيانات
    $result = $generator->sendToApi($telemetry);

    if ($result['success']) {
        echo "✅ SUCCESS: " . ($result['response']['message'] ?? 'Data processed') . "\n";
        echo "Processed " . ($result['response']['processed_sensors'] ?? 0) . " sensors\n";

        // فحص البيانات المحفوظة
        $latestData = DB::table('environmental_data')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        echo "\nLatest environmental data:\n";
        foreach ($latestData as $data) {
            echo "- Sensor {$data->sensor_id}: {$data->temperature}°C, {$data->humidity}%, smoke: {$data->smoke_level}\n";
        }

        // فحص التحليلات
        $latestAnalysis = DB::table('ai_analysis_logs')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        echo "\nLatest AI analysis:\n";
        foreach ($latestAnalysis as $analysis) {
            echo "- Sensor {$analysis->sensor_id}: Risk {$analysis->risk_score}, Decision: {$analysis->decision}\n";
        }

        // فحص التنبيهات
        $latestAlerts = DB::table('alerts')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        echo "\nLatest alerts:\n";
        foreach ($latestAlerts as $alert) {
            echo "- Alert: {$alert->alert_type} (Level: {$alert->alert_level})\n";
        }

    } else {
        echo "❌ FAILED: HTTP {$result['status']}\n";
        echo "Error: " . ($result['error'] ?? 'Unknown error') . "\n";
    }

} catch (\Exception $e) {
    echo "💥 ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== Simulation Complete ===\n";
echo "Now check your frontend - sensors should show live data!\n";