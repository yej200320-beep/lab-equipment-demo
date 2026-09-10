import { Navigate, createHashRouter } from "react-router-dom";
import AppShell from "../layouts/AppShell";
import AdminPage from "../pages/AdminPage";
import AlertsPage from "../pages/AlertsPage";
import DashboardPage from "../pages/DashboardPage";
import DeviceDetailPage from "../pages/DeviceDetailPage";
import DevicesPage from "../pages/DevicesPage";
import EpaperPage from "../pages/EpaperPage";
import HardwarePage from "../pages/HardwarePage";
import LocationsPage from "../pages/LocationsPage";
import LoginPage from "../pages/LoginPage";
import { useDemo } from "../store/DemoContext";

function Protected() {
  const { currentUser } = useDemo();
  return currentUser ? <AppShell /> : <Navigate to="/login" replace />;
}
export const router = createHashRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <Protected />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "devices", element: <DevicesPage /> },
      { path: "devices/:id", element: <DeviceDetailPage /> },
      { path: "epaper", element: <EpaperPage /> },
      { path: "hardware", element: <HardwarePage /> },
      { path: "locations", element: <LocationsPage /> },
      { path: "finder", element: <LocationsPage /> },
      { path: "movement", element: <LocationsPage /> },
      { path: "alerts", element: <AlertsPage /> },
      { path: "notifications", element: <AlertsPage /> },
      { path: "admin/users", element: <AdminPage /> },
      { path: "admin/departments", element: <AdminPage /> },
      {
        path: "admin/gateways",
        element: <Navigate to="/hardware" replace />,
      },
      { path: "admin/maximo", element: <AdminPage /> },
      { path: "admin/settings", element: <AdminPage /> },
      { path: "admin/logs", element: <AdminPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
