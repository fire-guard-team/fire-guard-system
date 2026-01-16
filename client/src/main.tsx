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
import UsersManagement from "./app/pages/Dashboard/UsersManagement.tsx";
import DashboardOverview from "./app/pages/Dashboard/DashboardOverview.tsx";
import AuthGuard from "./components/Auth/AuthGuard.tsx";
import RouteGuard from "./components/Auth/RouteGuard.tsx";

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
        path: "login",
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
    element: (
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    ),
    children:[
      {
        path:"",
        element : <RouteGuard permission="view_dashboard"><DashboardOverview /></RouteGuard>
      },
      {
        path:"map",
        element : <RouteGuard permission="view_interactive_map"><InteractiveMap /></RouteGuard>
      },
      {
        path:"alerts",
        element : <RouteGuard permission="view_alerts_center"><AlertsCenter /></RouteGuard>
      },
      {
        path:"sensors",
        element : <RouteGuard permission="view_sensor_management"><SensorManagement /></RouteGuard>
      },
      {
        path:"forest-sectors",
        element : <RouteGuard permission="view_forest_sectors"><ForestSectors /></RouteGuard>
      },
      {
        path:"reports",
        element : <RouteGuard permission="view_reports_analytics"><Reports /></RouteGuard>
      },
      {
        path:"users",
        element : <RouteGuard permission="manage_users"><UsersManagement /></RouteGuard>
      },
    ]
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={routes} />
  </StrictMode>
);
