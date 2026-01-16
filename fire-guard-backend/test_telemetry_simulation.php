<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\MockDataGenerator;

echo "=== Fire Guard System Telemetry Simulation ===\n\n";

// التحقق من وجود gateways
$gateways = \Illuminate\Support\Facades\DB::table('gateways')->count();
if ($gateways === 0) {
    echo "❌ No gateways found. Please run migrations first.\n";
    exit(1);
}

echo "✅ Found {$gateways} gateways\n";

// التحقق من وجود sensors
$sensors = \Illuminate\Support\Facades\DB::table('sensors')->count();
if ($sensors === 0) {
    echo "❌ No sensors found. Please run sensor seeding migrations.\n";
    exit(1);
}

echo "✅ Found {$sensors} sensors\n\n";

$generator = new MockDataGenerator();

echo "Testing single telemetry batch...\n";

// توليد وإرسال batch واحد
try {
    $telemetry = $generator->generateMockTelemetry(1);
    echo "Generated telemetry for " . count($telemetry['sensors']) . " sensors\n";

    // طباعة عينة من البيانات
    if (count($telemetry['sensors']) > 0) {
        $sampleSensor = $telemetry['sensors'][0];
        echo "Sample sensor data:\n";
        echo "- ID: {$sampleSensor['sensor_id']}\n";
        echo "- Temperature: {$sampleSensor['environment']['temperature']}°C\n";
        echo "- Humidity: {$sampleSensor['environment']['humidity']}%\n";
        echo "- Smoke: {$sampleSensor['environment']['smoke']}\n";
        echo "- Battery: {$sampleSensor['battery_level']}%\n";
    }

    echo "\nSending to API...\n";
    $result = $generator->sendToApi($telemetry);

    if ($result['success']) {
        echo "✅ SUCCESS: Telemetry processed successfully!\n";
        echo "Response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n";

        // التحقق من حفظ البيانات
        $latestData = \Illuminate\Support\Facades\DB::table('environmental_data')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        echo "\nLatest environmental data entries:\n";
        foreach ($latestData as $data) {
            echo "- Sensor {$data->sensor_id}: {$data->temperature}°C, {$data->humidity}%, smoke: {$data->smoke_level}\n";
        }

    } else {
        echo "❌ FAILED: API returned error\n";
        echo "Status: {$result['status']}\n";
        echo "Error: " . ($result['error'] ?? 'Unknown error') . "\n";
    }

} catch (\Exception $e) {
    echo "💥 ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== Simulation Test Complete ===\n";
echo "To run continuous simulation, use:\n";
echo "php artisan telemetry:simulate 1 --interval=30\n";
echo "(This will send telemetry every 30 seconds)\n";