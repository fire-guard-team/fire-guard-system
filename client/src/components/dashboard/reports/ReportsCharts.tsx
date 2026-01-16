// src/components/dashboard/reports/ReportsCharts.tsx
"use client";

import ReportsCard from "./ReportsCard";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type ReportType = "daily" | "weekly" | "monthly";

interface ReportsChartsProps {
  environmentalData: Array<{
    period: string;
    label: string;
    temperature: number;
    humidity: number;
    smoke: number;
  }>;
  fireIncidents: Array<{
    period: string;
    label: string;
    fires: number;
  }>;
  loading: boolean;
  reportType: ReportType;
}

const AxisTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <text x={x} y={y + 10} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
      {payload.value}
    </text>
  );
};

const ReportsCharts = ({
  environmentalData,
  fireIncidents,
  loading,
  reportType,
}: ReportsChartsProps) => {
  // Merge environmental data and fire incidents for charts
  const chartData = environmentalData.map((envItem) => {
    const fireItem = fireIncidents.find((f) => f.period === envItem.period);
    return {
      ...envItem,
      month: envItem.label,
      fires: fireItem?.fires || 0,
    };
  });

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <ReportsCard
            key={i}
            title="Loading..."
            subtitle="Loading chart data..."
          >
            <div className="h-[260px] flex items-center justify-center text-muted">
              Loading...
            </div>
          </ReportsCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ReportsCard
        title="Temperature Trends"
        subtitle={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} average temperature levels.`}
      >
        <div className="h-[260px] text-muted">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" tick={<AxisTick />} />
                <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.7 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(17,24,39,0.95)",
                    border: "1px solid rgba(55,65,81,0.8)",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="temperature" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </ReportsCard>

      <ReportsCard
        title="Humidity Trends"
        subtitle={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} average humidity levels.`}
      >
        <div className="h-[260px] text-muted">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" tick={<AxisTick />} />
                <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.7 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(17,24,39,0.95)",
                    border: "1px solid rgba(55,65,81,0.8)",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="humidity" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </ReportsCard>

      <ReportsCard
        title="Smoke Index Trends"
        subtitle={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} average smoke particulate index.`}
      >
        <div className="h-[260px] text-muted">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" tick={<AxisTick />} />
                <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.7 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(17,24,39,0.95)",
                    border: "1px solid rgba(55,65,81,0.8)",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="smoke" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </ReportsCard>

      <ReportsCard
        title="Historical Fire Incidents"
        subtitle={`Number of reported fire incidents by ${reportType}.`}
      >
        <div className="h-[260px] text-muted">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" tick={<AxisTick />} />
                <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.7 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(17,24,39,0.95)",
                    border: "1px solid rgba(55,65,81,0.8)",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="fires" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ReportsCard>
    </div>
  );
};

export default ReportsCharts;
