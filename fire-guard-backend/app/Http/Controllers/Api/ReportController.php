<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EnvironmentalData;
use App\Models\WildfireEvent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * 📌 GET /reports/analytics
     * إحصائيات وتحليلات التقارير
     */
    public function analytics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'time_range' => ['nullable', 'string', 'in:7d,30d,90d,1y'],
            'report_type' => ['nullable', 'string', 'in:daily,weekly,monthly'],
        ]);

        $timeRange = $validated['time_range'] ?? '30d';
        $reportType = $validated['report_type'] ?? 'monthly';

        // Calculate start date based on time range
        $startDate = match ($timeRange) {
            '7d' => Carbon::now()->subDays(7),
            '30d' => Carbon::now()->subDays(30),
            '90d' => Carbon::now()->subDays(90),
            '1y' => Carbon::now()->subYear(),
            default => Carbon::now()->subDays(30),
        };

        // Get aggregated environmental data
        $environmentalData = $this->getAggregatedEnvironmentalData($startDate, $reportType);
        
        // Get fire incidents data
        $fireIncidents = $this->getFireIncidentsData($startDate, $reportType);

        return response()->json([
            'time_range' => $timeRange,
            'report_type' => $reportType,
            'environmental_data' => $environmentalData,
            'fire_incidents' => $fireIncidents,
        ]);
    }

    /**
     * Get aggregated environmental data (temperature, humidity, smoke)
     */
    private function getAggregatedEnvironmentalData(Carbon $startDate, string $reportType): array
    {
        $query = EnvironmentalData::where('recorded_at', '>=', $startDate);

        // PostgreSQL date formatting
        $dateFormat = match ($reportType) {
            'daily' => "TO_CHAR(recorded_at, 'YYYY-MM-DD')",
            'weekly' => "TO_CHAR(recorded_at, 'IYYY-IW')", // ISO Year-Week
            'monthly' => "TO_CHAR(recorded_at, 'YYYY-MM')",
            default => "TO_CHAR(recorded_at, 'YYYY-MM')",
        };

        $data = $query
            ->select(
                DB::raw("{$dateFormat} as period"),
                DB::raw('AVG(temperature) as avg_temperature'),
                DB::raw('AVG(humidity) as avg_humidity'),
                DB::raw('AVG(smoke_level) as avg_smoke'),
                DB::raw('MAX(temperature) as max_temperature'),
                DB::raw('MIN(temperature) as min_temperature')
            )
            ->groupBy(DB::raw($dateFormat))
            ->orderBy('period', 'asc')
            ->get();

        // Format data for charts
        return $data->map(function ($item) use ($reportType) {
            $periodLabel = $this->formatPeriodLabel($item->period, $reportType);
            
            return [
                'period' => $item->period,
                'label' => $periodLabel,
                'temperature' => round((float)$item->avg_temperature, 2),
                'humidity' => round((float)$item->avg_humidity, 2),
                'smoke' => round((float)$item->avg_smoke, 2),
                'max_temperature' => $item->max_temperature ? round((float)$item->max_temperature, 2) : null,
                'min_temperature' => $item->min_temperature ? round((float)$item->min_temperature, 2) : null,
            ];
        })->values()->toArray();
    }

    /**
     * Get fire incidents data
     */
    private function getFireIncidentsData(Carbon $startDate, string $reportType): array
    {
        $dateFormat = match ($reportType) {
            'daily' => "TO_CHAR(detected_at, 'YYYY-MM-DD')",
            'weekly' => "TO_CHAR(detected_at, 'IYYY-IW')",
            'monthly' => "TO_CHAR(detected_at, 'YYYY-MM')",
            default => "TO_CHAR(detected_at, 'YYYY-MM')",
        };

        $data = WildfireEvent::where('detected_at', '>=', $startDate)
            ->select(
                DB::raw("{$dateFormat} as period"),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy(DB::raw($dateFormat))
            ->orderBy('period', 'asc')
            ->get();

        return $data->map(function ($item) use ($reportType) {
            $periodLabel = $this->formatPeriodLabel($item->period, $reportType);
            
            return [
                'period' => $item->period,
                'label' => $periodLabel,
                'fires' => (int)$item->count,
            ];
        })->values()->toArray();
    }

    /**
     * Format period label for display
     */
    private function formatPeriodLabel(string $period, string $reportType): string
    {
        try {
            return match ($reportType) {
                'daily' => Carbon::createFromFormat('Y-m-d', $period)->format('M d'),
                'weekly' => 'Week ' . substr($period, 5), // Extract week number
                'monthly' => Carbon::createFromFormat('Y-m', $period)->format('M'),
                default => $period,
            };
        } catch (\Exception $e) {
            return $period;
        }
    }

    /**
     * 📌 GET /reports/export/{format}
     * تصدير البيانات بصيغة محددة (csv, pdf, excel)
     */
    public function export(Request $request, string $format): StreamedResponse|Response
    {
        $validated = $request->validate([
            'time_range' => ['nullable', 'string', 'in:7d,30d,90d,1y'],
            'report_type' => ['nullable', 'string', 'in:daily,weekly,monthly'],
        ]);

        $timeRange = $validated['time_range'] ?? '30d';
        $reportType = $validated['report_type'] ?? 'monthly';

        // Calculate start date based on time range
        $startDate = match ($timeRange) {
            '7d' => Carbon::now()->subDays(7),
            '30d' => Carbon::now()->subDays(30),
            '90d' => Carbon::now()->subDays(90),
            '1y' => Carbon::now()->subYear(),
            default => Carbon::now()->subDays(30),
        };

        // Get aggregated data
        $environmentalData = $this->getAggregatedEnvironmentalData($startDate, $reportType);
        $fireIncidents = $this->getFireIncidentsData($startDate, $reportType);

        // Merge data
        $mergedData = [];
        foreach ($environmentalData as $envItem) {
            $fireItem = collect($fireIncidents)->firstWhere('period', $envItem['period']);
            $mergedData[] = [
                'Period' => $envItem['label'],
                'Temperature (°C)' => $envItem['temperature'],
                'Humidity (%)' => $envItem['humidity'],
                'Smoke (PPM)' => $envItem['smoke'],
                'Fire Incidents' => $fireItem['fires'] ?? 0,
            ];
        }

        return match (strtolower($format)) {
            'csv' => $this->exportCsv($mergedData, $timeRange, $reportType),
            'excel' => $this->exportCsv($mergedData, $timeRange, $reportType, 'xlsx'), // Excel can open CSV
            'pdf' => $this->exportCsv($mergedData, $timeRange, $reportType, 'pdf'), // For now, return CSV
            default => response()->json(['error' => 'Invalid format'], 400),
        };
    }

    /**
     * Export data as CSV
     */
    private function exportCsv(array $data, string $timeRange, string $reportType, string $extension = 'csv'): StreamedResponse
    {
        $filename = "reports_export_{$timeRange}_{$reportType}_" . Carbon::now()->format('Y-m-d') . ".{$extension}";

        return response()->streamDownload(function () use ($data) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for UTF-8 (helps Excel open UTF-8 CSV correctly)
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Add headers
            if (!empty($data)) {
                fputcsv($file, array_keys($data[0]));
            }

            // Add data rows
            foreach ($data as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        }, $filename, [
            'Content-Type' => $extension === 'pdf' ? 'application/pdf' : 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

}
