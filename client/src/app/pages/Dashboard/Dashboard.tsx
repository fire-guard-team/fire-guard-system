import { createContext, useState } from "react";
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

export const SearchContext = createContext<string>("");

const Dashboard = () => {
  const [search, setSearch] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bgMain flex">
      <SearchContext.Provider value={search}>
        {/* Sidebar */}
        <SideBar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          items={[
            {
              content: "Dashboard",
              link: "/dashboard",
              icon: <MdOutlineDashboard />,
            },
            {
              content: "Interactive Map",
              link: "/dashboard/map",
              icon: <MdOutlineMap />,
            },
            {
              content: "Alerts Center",
              link: "/dashboard/alerts",
              icon: <MdOutlineNotificationsActive />,
            },
            {
              content: "Sensor Management",
              link: "/dashboard/sensors",
              icon: <MdSensors />,
            },
            {
              content: "Forest & Sector Management",
              link: "/dashboard/forest-sectors",
              icon: <GiPineTree />,
            },
            {
              content: "Reports & Analytics",
              link: "/dashboard/reports",
              icon: <MdOutlineInsights />,
            },
            {
              content: "Settings & Users",
              link: "/dashboard/settings",
              icon: <MdOutlineSettings />,
            },
          ]}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <NavBar setSearch={setSearch} setIsOpen={setIsOpen} isOpen={isOpen} />
{/* px-4 py-6 lg:px-8 lg:py-8 */}
          <main className="flex-1">
            <div className="h-full w-full">
              <div className="h-full w-full py-4 lg:py-4 px-6">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </SearchContext.Provider>
    </div>
  );
};

export default Dashboard;
