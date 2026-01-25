import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import SplashScreen from "../pages/SplashScreen";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import PetListPage from "../pages/PetListPage";
import CalendarPage from "../pages/CalendarPage";
import FamilyPage from "../pages/FamilyPage";
import ServicePage from "../pages/ServicePage";
import ProfilePage from "../pages/ProfilePage";
import SavedPlacesPage from "../pages/SavedPlacesPage";
import ProviderDashboard from "../pages/provider/ProviderDashboard";
import TestPage from "../pages/TestPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SplashScreen />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  // 여기 spread 연산자 ... 추가! 👇
  ...(import.meta.env.DEV
    ? [
        {
          path: "/test",
          element: <TestPage />,
        },
      ]
    : []),
  {
    path: "/home",
    element: (
      <ProtectedRoute allowedRoles={["family"]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "pets",
        element: <PetListPage />,
      },
      {
        path: "calendar",
        element: <CalendarPage />,
      },
      {
        path: "family",
        element: <FamilyPage />,
      },
      {
        path: "service",
        element: <ServicePage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "profile/saved-places",
        element: <SavedPlacesPage />,
      },
    ],
  },
  {
    path: "/provider",
    element: (
      <ProtectedRoute allowedRoles={["provider"]}>
        <div className="min-h-screen bg-gray-50">
          <Outlet />
        </div>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <ProviderDashboard />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
