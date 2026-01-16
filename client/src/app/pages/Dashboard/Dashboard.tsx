import { useState } from "react";
import SideBar from "../../../components/dashboard/layout/SideBar";
import NavBar from "../../../components/dashboard/layout/NavBar";
import { Outlet } from "react-router-dom";

import {
  MdOutlineDashboard,
  MdOutlineMap,
  MdOutlineNotificationsActive,
  MdSensors,
  MdOutlineInsights,
  MdOutlineSettings,
} from "react-icons/md";
import { GiPineTree } from "react-icons/gi";

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bgMain flex">
        {/* Sidebar */}
        <SideBar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          items={[
            {
              content: "Dashboard",
              link: "/dashboard",
              icon: <MdOutlineDashboard />,
              permission: "view_dashboard",
            },
            {
              content: "Interactive Map",
              link: "/dashboard/map",
              icon: <MdOutlineMap />,
              permission: "view_interactive_map",
            },
            {
              content: "Alerts Center",
              link: "/dashboard/alerts",
              icon: <MdOutlineNotificationsActive />,
              permission: "view_alerts_center",
            },
            {
              content: "Sensor Management",
              link: "/dashboard/sensors",
              icon: <MdSensors />,
              permission: "view_sensor_management",
            },
            {
              content: "Forest & Sector Management",
              link: "/dashboard/forest-sectors",
              icon: <GiPineTree />,
              permission: "view_forest_sectors",
            },
            {
              content: "Reports & Analytics",
              link: "/dashboard/reports",
              icon: <MdOutlineInsights />,
              permission: "view_reports_analytics",
            },
            {
              content: "Manage Users",
              link: "/dashboard/users",
              icon: <MdOutlineSettings />,
              permission: "manage_users",
            },
          ]}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <NavBar setIsOpen={setIsOpen} isOpen={isOpen} />
{/* px-4 py-6 lg:px-8 lg:py-8 */}
          <main className="flex-1">
            <div className="h-full w-full">
              <div className="h-full w-full py-4 lg:py-4 px-6">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
    </div>
  );
};

export default Dashboard;
