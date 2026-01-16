// src/app/dashboard/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ReportsCharts, ReportsFilters, ReportsHeader } from "../../../components/dashboard/reports";
import { apiService } from "../../../utils/api";

type TimeRange = "7d" | "30d" | "90d" | "1y";
type ReportType = "daily" | "weekly" | "monthly";

const Reports = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [reportType, setReportType] = useState<ReportType>("monthly");
  const [environmentalData, setEnvironmentalData] = useState<any[]>([]);
  const [fireIncidents, setFireIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getReportsAnalytics({
        time_range: timeRange,
        report_type: reportType,
      });

      setEnvironmentalData(response.environmental_data || []);
      setFireIncidents(response.fire_incidents || []);
    } catch (error) {
      console.error("Error loading reports data:", error);
      setEnvironmentalData([]);
      setFireIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, [timeRange, reportType]);

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      await apiService.downloadReport(format, {
        time_range: timeRange,
        report_type: reportType,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  return (
    <section className="space-y-6" dir="ltr">
      <ReportsHeader />
      <ReportsFilters
        timeRange={timeRange}
        reportType={reportType}
        onTimeRangeChange={setTimeRange}
        onReportTypeChange={setReportType}
        onExport={handleExport}
      />
      <ReportsCharts
        environmentalData={environmentalData}
        fireIncidents={fireIncidents}
        loading={loading}
        reportType={reportType}
      />
    </section>
  );
};

export default Reports;
