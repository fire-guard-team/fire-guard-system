import LiveSensorDataSection from "../../../components/dashboard/home/LiveSensorDataSection";
import RiskDistributionSection from "../../../components/dashboard/home/RiskDistributionSection";
import StatCard from "../../../components/dashboard/home/StatCard";

const DashboardOverview = () => {
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          title="Active Sectors"
          value={42}
          statusLabel="Normal Operations"
          statusType="normal"
        />

        <StatCard
          title="Total Alerts"
          value={7}
          statusLabel="Critical Detected"
          statusType="critical"
        />

        <StatCard
          title="Fire Risk Index"
          value={6.8}
          statusLabel="Elevated Risk"
          statusType="elevated"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveSensorDataSection />

        <RiskDistributionSection />
      </div>
    </section>
  );
};

export default DashboardOverview;
