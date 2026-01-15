import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Auth from "./app/pages/Auth/Auth.tsx";
import LogIn from "./app/pages/Auth/LogIn.tsx";
import Dashboard from "./app/pages/Dashboard/Dashboard.tsx";
import ForgetPassword from "./components/Auth/ForgetPassword/ForgetPassword.tsx";
import InteractiveMap from "./app/pages/Dashboard/InteractiveMap.tsx";
import AlertsCenter from "./app/pages/Dashboard/AlertsCenter.tsx";
import SensorManagement from "./app/pages/Dashboard/SensorManagement.tsx";
import ForestSectors from "./app/pages/Dashboard/ForestSectors.tsx";
import Reports from "./app/pages/Dashboard/Reports.tsx";
import Settings from "./app/pages/Dashboard/Settings.tsx";
import DashboardOverview from "./app/pages/Dashboard/DashboardOverview.tsx";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Auth />,
    children: [
      {
        path: "",
        element: <LogIn />,
      },
      {
        path: "forget-password",
        element: <ForgetPassword />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    children:[
      {
        path:"",
        element : <DashboardOverview />
      },
      {
        path:"map",
        element : <InteractiveMap />
      },
      {
        path:"alerts",
        element : <AlertsCenter />
      },
      {
        path:"sensors",
        element : <SensorManagement />
      },
      {
        path:"forest-sectors",
        element : <ForestSectors />
      },
      {
        path:"reports",
        element : <Reports />
      },
      {
        path:"settings",
        element : <Settings />
      },
    ]
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={routes} />
  </StrictMode>
);
