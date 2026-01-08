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

const monthlyData = [
  { month: "Jan", temperature: 18, humidity: 55, smoke: 10, fires: 2 },
  { month: "Feb", temperature: 20, humidity: 60, smoke: 14, fires: 3 },
  { month: "Mar", temperature: 23, humidity: 58, smoke: 18, fires: 4 },
  { month: "Apr", temperature: 26, humidity: 52, smoke: 22, fires: 5 },
  { month: "May", temperature: 29, humidity: 48, smoke: 28, fires: 7 },
  { month: "Jun", temperature: 33, humidity: 45, smoke: 33, fires: 9 },
  { month: "Jul", temperature: 36, humidity: 47, smoke: 36, fires: 12 },
  { month: "Aug", temperature: 34, humidity: 50, smoke: 30, fires: 10 },
  { month: "Sep", temperature: 30, humidity: 54, smoke: 24, fires: 8 },
  { month: "Oct", temperature: 26, humidity: 58, smoke: 18, fires: 6 },
  { month: "Nov", temperature: 22, humidity: 62, smoke: 14, fires: 4 },
  { month: "Dec", temperature: 19, humidity: 65, smoke: 11, fires: 3 },
];

const AxisTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <text x={x} y={y + 10} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
      {payload.value}
    </text>
  );
};

const ReportsCharts = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ReportsCard
        title="Temperature Trends"
        subtitle="Monthly average temperature levels over the past year."
      >
        <div className="h-[260px] text-muted">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" tick={<AxisTick />} />
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
        </div>
      </ReportsCard>

      <ReportsCard
        title="Humidity Trends"
        subtitle="Monthly average humidity levels over the past year."
      >
        <div className="h-[260px] text-muted">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" tick={<AxisTick />} />
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
        </div>
      </ReportsCard>

      <ReportsCard
        title="Smoke Index Trends"
        subtitle="Monthly average smoke particulate index over the past year."
      >
        <div className="h-[260px] text-muted">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" tick={<AxisTick />} />
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
        </div>
      </ReportsCard>

      <ReportsCard
        title="Historical Fire Incidents"
        subtitle="Number of reported fire incidents each month."
      >
        <div className="h-[260px] text-muted">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" tick={<AxisTick />} />
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
        </div>
      </ReportsCard>
    </div>
  );
};

export default ReportsCharts;
