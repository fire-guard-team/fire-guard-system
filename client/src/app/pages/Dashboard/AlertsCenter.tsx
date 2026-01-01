import AlertsDeatils from "../../../components/dashboard/AlertsCenter/AlertsDeatils";
import FilterAlerts from "../../../components/dashboard/AlertsCenter/FilterAlerts";
import RecentAlerts from "../../../components/dashboard/AlertsCenter/RecentAlerts";
import TriggerConditions from "../../../components/dashboard/AlertsCenter/TriggerConditions";

const AlertsCenter = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] gap-6">
      
      <div className="flex flex-col gap-6">
        <FilterAlerts />
        <RecentAlerts />
      </div>

      <div className="flex flex-col gap-6">
        <AlertsDeatils />
        <TriggerConditions />
      </div>  

    </div>
  );
};

export default AlertsCenter;
