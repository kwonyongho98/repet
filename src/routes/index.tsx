import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProviderLayout from "../components/layout/ProviderLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import SplashScreen from "../pages/SplashScreen";
import LoginPage from "../pages/LoginPage";
import AuthCallbackPage from "../pages/AuthCallbackPage";
import OnboardingPage from "../pages/OnboardingPage";
import HomePage from "../pages/HomePage";
import PetListPage from "../pages/PetListPage";
import CalendarPage from "../pages/CalendarPage";
import FamilyPage from "../pages/FamilyPage";
import ServicePage from "../pages/ServicePage";
import ProfilePage from "../pages/ProfilePage";
import SavedPlacesPage from "../pages/SavedPlacesPage";
import AlbumPage from "../pages/AlbumPage";
import CommunicationPage from "../pages/communication/CommunicationPage";
import CareNoteDetailPage from "../pages/communication/CareNoteDetailPage";
import CareRequestPage from "../pages/family/CareRequestPage";
import AnnouncementListPage from "../pages/family/AnnouncementListPage";
import ProviderDashboard from "../pages/provider/ProviderDashboard";
import ProviderRegisterPage from "../pages/provider/ProviderRegisterPage";
import ProviderNotesPage from "../pages/provider/ProviderNotesPage";
import ProviderSchedulePage from "../pages/provider/ProviderSchedulePage";
import ProviderSettingsPage from "../pages/provider/ProviderSettingsPage";
import PartnerJoinPage from "../pages/partner/PartnerJoinPage";
import ProviderAnnouncementPage from "../pages/provider/ProviderAnnouncementPage";
import ProviderConnectPage from "../pages/family/ProviderConnectPage";
import FamilyBoardPage from "../pages/family/FamilyBoardPage";
import { MyBookingsPage, CreateBookingPage } from "../pages/booking";
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
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  // Onboarding page (새로운 유저)
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute allowedRoles={["family"]}>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  // Provider Registration
  {
    path: "/provider/register",
    element: (
      <ProtectedRoute allowedRoles={["family", "provider"]}>
        <ProviderRegisterPage />
      </ProtectedRoute>
    ),
  },
  // Partner join page (Provider만 접근)
  {
    path: "/partner/join",
    element: (
      <ProtectedRoute allowedRoles={["provider"]}>
        <PartnerJoinPage />
      </ProtectedRoute>
    ),
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
        path: "family-board",
        element: <FamilyBoardPage />,
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
      {
        path: "provider-connect",
        element: <ProviderConnectPage />,
      },
      {
        path: "album",
        element: <AlbumPage />,
      },
      {
        path: "communication",
        element: <CommunicationPage />,
      },
      {
        path: "communication/care-note/:noteId",
        element: <CareNoteDetailPage />,
      },
      {
        path: "care-request",
        element: <CareRequestPage />,
      },
      {
        path: "announcements",
        element: <AnnouncementListPage />,
      },
      // Booking Routes
      {
        path: "bookings",
        element: <MyBookingsPage />,
      },
      {
        path: "bookings/new/:providerId",
        element: <CreateBookingPage />,
      },
    ],
  },
  {
    path: "/provider",
    element: (
      <ProtectedRoute allowedRoles={["family", "provider"]}>
        <ProviderLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <ProviderDashboard />,
      },
      {
        path: "schedule",
        element: <ProviderSchedulePage />,
      },
      {
        path: "notes",
        element: <ProviderNotesPage />,
      },
      {
        path: "settings",
        element: <ProviderSettingsPage />,
      },
      {
        path: "announcements",
        element: <ProviderAnnouncementPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
