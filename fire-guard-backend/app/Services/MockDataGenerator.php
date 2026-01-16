<?php

namespace App\Services;

use App\Models\Sensor;
use App\Models\Gateway;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class MockDataGenerator
{
    /**
     * توليد بيانات وهمية للاختبار
     */
    public function generateMockTelemetry(int $gatewayId = 1): array
    {
        $gateway = Gateway::find($gatewayId);
        if (!$gateway) {
            throw new \Exception("Gateway not found");
        }

        // الحصول على جميع sensors التابعة للقطاعات النشطة
        $sensors = Sensor::whereNotNull('sector_id')
            ->whereNotNull('lat')
            ->whereNotNull('lng')
            ->with('sector')
            ->get();

        $telemetryData = [
            'gateway_id' => $gatewayId,
            'network_quality' => $this->getRandomNetworkQuality(),
            'sensors' => []
        ];

        foreach ($sensors as $sensor) {
            $telemetryData['sensors'][] = $this->generateSensorData($sensor);
        }

        return $telemetryData;
    }

    /**
     * توليد بيانات sensor واحدة
     */
    private function generateSensorData(Sensor $sensor): array
    {
        // أساسيات البيانات البيئية
        $baseTemp = $this->getBaseTemperature();
        $baseHumidity = $this->getBaseHumidity();
        $baseSmoke = $this->getBaseSmokeLevel();

        // إضافة تغييرات عشوائية واقعية
        $temperature = $baseTemp + mt_rand(-20, 20) / 10; // ±2 درجة
        $humidity = max(0, min(100, $baseHumidity + mt_rand(-50, 50) / 10)); // ±5%
        $smokeLevel = max(0, $baseSmoke + mt_rand(-5, 5) / 10); // ±0.5

        // إذا كان هناك حريق، زد من القيم
        $fireChance = mt_rand(1, 100);
        if ($fireChance <= 2) { // 2% فرصة حريق
            $temperature += mt_rand(30, 60);
            $humidity -= mt_rand(20, 40);
            $smokeLevel += mt_rand(30, 70);
        }

        return [
            'sensor_id' => $sensor->sensor_id,
            'timestamp' => Carbon::now()->toISOString(),
            'environment' => [
                'temperature' => round($temperature, 1),
                'humidity' => round($humidity, 1),
                'smoke' => round($smokeLevel, 2)
            ],
            'battery_level' => mt_rand(70, 100),
            'signal_strength' => mt_rand(-85, -45)
        ];
    }

    /**
     * الحصول على درجة الحرارة الأساسية حسب الموسم والوقت
     */
    private function getBaseTemperature(): float
    {
        $hour = (int) Carbon::now()->format('H');

        // درجات حرارة أساسية لسوريا الساحلية
        $baseTemp = 25; // متوسط

        // تغييرات يومية
        if ($hour >= 6 && $hour <= 12) {
            $baseTemp += 5; // صباح
        } elseif ($hour >= 13 && $hour <= 17) {
            $baseTemp += 10; // ظهر
        } elseif ($hour >= 18 && $hour <= 21) {
            $baseTemp += 2; // مساء
        } elseif ($hour >= 22 || $hour <= 5) {
            $baseTemp -= 5; // ليل
        }

        // تغييرات شهرية (مثال ليناير)
        $month = (int) Carbon::now()->format('m');
        if ($month >= 12 || $month <= 2) {
            $baseTemp -= 8; // شتاء
        } elseif ($month >= 6 && $month <= 8) {
            $baseTemp += 8; // صيف
        }

        return $baseTemp;
    }

    /**
     * الحصول على الرطوبة الأساسية
     */
    private function getBaseHumidity(): float
    {
        // منطقة ساحلية - رطوبة عالية
        $baseHumidity = 65;

        $hour = (int) Carbon::now()->format('H');
        if ($hour >= 6 && $hour <= 12) {
            $baseHumidity -= 10; // تنخفض صباحاً
        }

        return $baseHumidity;
    }

    /**
     * الحصول على مستوى الدخان الأساسي
     */
    private function getBaseSmokeLevel(): float
    {
        // غابة - مستويات طبيعية منخفضة
        return mt_rand(5, 15) / 10; // 0.5 - 1.5
    }

    /**
     * جودة الشبكة العشوائية
     */
    private function getRandomNetworkQuality(): string
    {
        $qualities = ['excellent', 'good', 'fair', 'poor'];
        $weights = [20, 50, 20, 10]; // نسب مئوية

        $rand = mt_rand(1, 100);
        $cumulative = 0;

        foreach ($qualities as $index => $quality) {
            $cumulative += $weights[$index];
            if ($rand <= $cumulative) {
                return $quality;
            }
        }

        return 'good';
    }

    /**
     * إرسال البيانات للـ API
     */
    public function sendToApi(array $telemetryData, string $apiUrl = null, string $token = null): array
    {
        // استخدم endpoint بسيط للاختبار
        $apiUrl = $apiUrl ?: 'http://localhost:8000/api/test/telemetry';
        $token = $token ?: 'test-token'; // يجب استبداله بـ token حقيقي

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ])->post($apiUrl, $telemetryData);

        return [
            'success' => $response->successful(),
            'status' => $response->status(),
            'response' => $response->json(),
            'error' => $response->successful() ? null : $response->body()
        ];
    }

    /**
     * تشغيل محاكاة مستمرة
     */
    public function startContinuousSimulation(int $gatewayId = 1, int $intervalSeconds = 60): void
    {
        echo "Starting continuous telemetry simulation...\n";
        echo "Gateway ID: {$gatewayId}\n";
        echo "Interval: {$intervalSeconds} seconds\n";
        echo "Press Ctrl+C to stop\n\n";

        while (true) {
            try {
                $telemetry = $this->generateMockTelemetry($gatewayId);
                $result = $this->sendToApi($telemetry);

                $timestamp = Carbon::now()->format('H:i:s');
                if ($result['success']) {
                    echo "[{$timestamp}] ✅ Sent telemetry for " . count($telemetry['sensors']) . " sensors\n";
                } else {
                    echo "[{$timestamp}] ❌ Failed to send telemetry: " . ($result['error'] ?? 'Unknown error') . "\n";
                }

                sleep($intervalSeconds);
            } catch (\Exception $e) {
                echo "[{$timestamp}] 💥 Error: " . $e->getMessage() . "\n";
                sleep(5); // انتظار أقل عند الخطأ
            }
        }
    }
}