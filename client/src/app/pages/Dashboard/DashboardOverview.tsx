import { useDashboard } from "../../../hooks/useDashboard";
import LiveSensorDataSection from "../../../components/dashboard/home/LiveSensorDataSection";
import RecentAlerts from "../../../components/dashboard/home/RecentAlerts";
import RiskDistributionSection from "../../../components/dashboard/home/RiskDistributionSection";
import StatCard from "../../../components/dashboard/home/StatCard";

const DashboardOverview = () => {
  const {
    stats,
    liveSensorData,
    recentAlerts,
    riskDistribution,
    loading,
    error,
    refreshData
  } = useDashboard();

  if (loading && !stats) {
    return (
      <section className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && !stats) {
    return (
      <section className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const getStatusType = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'elevated';
    return 'normal';
  };

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          title="Active Sectors"
          value={stats?.active_sectors || 0}
          statusLabel={stats?.system_status || 'Loading...'}
          statusType={getStatusType(stats?.active_sectors || 0, { warning: 10, critical: 20 })}
        />

        <StatCard
          title="Total Alerts"
          value={stats?.total_alerts || 0}
          statusLabel={`${stats?.alert_breakdown?.active || 0} Active, ${stats?.alert_breakdown?.critical || 0} Critical`}
          statusType={getStatusType(stats?.alert_breakdown?.critical || 0, { warning: 1, critical: 3 })}
        />

        <StatCard
          title="Fire Risk Index"
          value={stats?.fire_risk_index || 0}
          statusLabel={`${stats?.sector_breakdown?.fire || 0} Fire, ${stats?.sector_breakdown?.warning || 0} Warning`}
          statusType={getStatusType(stats?.fire_risk_index || 0, { warning: 4, critical: 7 })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveSensorDataSection sensorData={liveSensorData} loading={loading} />

        <RiskDistributionSection riskData={riskDistribution} loading={loading} />
      </div>

      <div className="">
        <RecentAlerts alertData={recentAlerts} loading={loading} />
      </div>
    </section>
  );
};

export default DashboardOverview;
