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
            'excel' => $this->exportExcel($mergedData, $timeRange, $reportType),
            'pdf' => $this->exportPdf($mergedData, $timeRange, $reportType),
            default => response()->json(['error' => 'Invalid format'], 400),
        };
    }

    /**
     * Export data as CSV
     */
    private function exportCsv(array $data, string $timeRange, string $reportType): StreamedResponse
    {
        $filename = "reports_export_{$timeRange}_{$reportType}_" . Carbon::now()->format('Y-m-d') . ".csv";

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
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Export data as Excel (CSV with Excel formatting)
     */
    private function exportExcel(array $data, string $timeRange, string $reportType): StreamedResponse
    {
        $filename = "reports_export_{$timeRange}_{$reportType}_" . Carbon::now()->format('Y-m-d') . ".xlsx";

        return response()->streamDownload(function () use ($data) {
            $file = fopen('php://output', 'w');

            // Add Excel BOM for UTF-8
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Add headers with semicolon separator (Excel format)
            if (!empty($data)) {
                fputcsv($file, array_keys($data[0]), ';');
            }

            // Add data rows with semicolon separator
            foreach ($data as $row) {
                fputcsv($file, $row, ';');
            }

            fclose($file);
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Export data as PDF (simplified CSV for now - can be enhanced with proper PDF library)
     */
    private function exportPdf(array $data, string $timeRange, string $reportType): StreamedResponse
    {
        $filename = "reports_export_{$timeRange}_{$reportType}_" . Carbon::now()->format('Y-m-d') . ".pdf";

        return response()->streamDownload(function () use ($data, $timeRange, $reportType) {
            // Create a simple text-based PDF-like format
            $content = $this->generateSimplePdf($data, $timeRange, $reportType);
            echo $content;
        }, $filename, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Generate simple PDF-like content
     */
    private function generateSimplePdf(array $data, string $timeRange, string $reportType): string
    {
        $content = "%PDF-1.4\n";
        $content .= "1 0 obj\n";
        $content .= "<<\n";
        $content .= "/Type /Catalog\n";
        $content .= "/Pages 2 0 R\n";
        $content .= ">>\n";
        $content .= "endobj\n";

        $content .= "2 0 obj\n";
        $content .= "<<\n";
        $content .= "/Type /Pages\n";
        $content .= "/Kids [3 0 R]\n";
        $content .= "/Count 1\n";
        $content .= ">>\n";
        $content .= "endobj\n";

        $content .= "3 0 obj\n";
        $content .= "<<\n";
        $content .= "/Type /Page\n";
        $content .= "/Parent 2 0 R\n";
        $content .= "/MediaBox [0 0 612 792]\n";
        $content .= "/Contents 4 0 R\n";
        $content .= "/Resources <<\n";
        $content .= "/Font <<\n";
        $content .= "/F1 <<\n";
        $content .= "/Type /Font\n";
        $content .= "/Subtype /Type1\n";
        $content .= "/BaseFont /Helvetica\n";
        $content .= ">>\n";
        $content .= ">>\n";
        $content .= ">>\n";
        $content .= ">>\n";
        $content .= "endobj\n";

        $content .= "4 0 obj\n";
        $content .= "<<\n";
        $content .= "/Length " . strlen($this->generatePdfContent($data, $timeRange, $reportType)) . "\n";
        $content .= ">>\n";
        $content .= "stream\n";
        $content .= $this->generatePdfContent($data, $timeRange, $reportType);
        $content .= "\nendstream\n";
        $content .= "endobj\n";

        $content .= "xref\n";
        $content .= "0 5\n";
        $content .= "0000000000 65535 f \n";
        $content .= "0000000009 00000 n \n";
        $content .= "0000000058 00000 n \n";
        $content .= "0000000115 00000 n \n";
        $content .= "0000000274 00000 n \n";
        $content .= "trailer\n";
        $content .= "<<\n";
        $content .= "/Size 5\n";
        $content .= "/Root 1 0 R\n";
        $content .= ">>\n";
        $content .= "startxref\n";
        $content .= "0\n";
        $content .= "%%EOF\n";

        return $content;
    }

    /**
     * Generate PDF content stream
     */
    private function generatePdfContent(array $data, string $timeRange, string $reportType): string
    {
        $content = "BT\n";
        $content .= "/F1 12 Tf\n";
        $content .= "50 750 Td\n";
        $content .= "(Forest Fire Monitoring Report) Tj\n";
        $content .= "0 -20 Td\n";
        $content .= "(Time Range: {$timeRange}, Report Type: {$reportType}) Tj\n";
        $content .= "0 -30 Td\n";
        $content .= "(Generated: " . Carbon::now()->format('Y-m-d H:i:s') . ") Tj\n";
        $content .= "0 -40 Td\n";

        if (!empty($data)) {
            // Headers
            $headers = array_keys($data[0]);
            foreach ($headers as $i => $header) {
                $content .= "0 -20 Td\n";
                $content .= "(" . $header . ") Tj\n";
            }

            // Data
            $content .= "0 -20 Td\n";
            foreach ($data as $row) {
                foreach ($row as $value) {
                    $content .= "(" . $value . ") Tj\n";
                    $content .= "100 0 Td\n";
                }
                $content .= "0 -15 Td\n";
                $content .= "-" . (count($row) * 100) . " 0 Td\n";
            }
        }

        $content .= "ET\n";
        return $content;
    }

}
