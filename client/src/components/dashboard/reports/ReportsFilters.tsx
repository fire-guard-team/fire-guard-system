// src/components/dashboard/reports/ReportsFilters.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "../../ui/Button";
import { MdFileDownload } from "react-icons/md";

type TimeRange = "7d" | "30d" | "90d" | "1y";
type ReportType = "daily" | "weekly" | "monthly";

const ReportsFilters = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [reportType, setReportType] = useState<ReportType>("monthly");

  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 90 Days";
      case "1y":
        return "Last Year";
      default:
        return "Last 30 Days";
    }
  }, [timeRange]);

  return (
    <div className="border border-border rounded-xl bg-surface-dark/90 p-4 shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="rounded-lg border border-border bg-background-dark px-3 py-2 text-xs text-text-light outline-none focus:border-accent focus:ring-1 focus:ring-accent/70"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>

<div className="flex items-center gap-2">
  <span className="text-xs text-muted">Report Type:</span>

  <div className="flex rounded-lg bg-background-dark p-1 border border-border">
    {(["daily", "weekly", "monthly"] as const).map((type) => {
      const isActive = reportType === type;

      return (
        <button
          key={type}
          type="button"
          onClick={() => setReportType(type)}
          className={[
            "px-4 py-1.5 text-xs rounded-md transition-all cursor-pointer",
            isActive
              ? "bg-[#F55624] text-white shadow-sm"
              : "text-muted hover:text-text-light",
          ].join(" ")}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      );
    })}
  </div>
</div>

          <span className="text-[11px] text-muted">
            Selected: <span className="text-text-light">{timeRangeLabel}</span> •{" "}
            <span className="text-text-light">{reportType}</span>
          </span>
        </div>

        {/* Right: export buttons */}
        <div className="flex flex-wrap items-center gap-5">
          <button className="flex items-center gap-2 border border-btn rounded-xl text-sm py-2 px-4 cursor-pointer">
            <MdFileDownload />
            PDF
          </button>
          <button className="flex items-center gap-2 border border-btn rounded-xl text-sm py-2 px-4 cursor-pointer">
            <MdFileDownload />
            Excel
          </button>
          <button className="flex items-center gap-2 border border-btn rounded-xl text-sm py-2 px-4 cursor-pointer">
            <MdFileDownload />
            CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilters;
