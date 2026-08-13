import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import UserManagement from "./components/Users/UserManagement";
import Login from "./pages/Login";
import Register from "./components/Users/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Intro from "./pages/Intro";
import StudentProfile from "./pages/StudentProfile";
import Dashboard from "./components/Users/Dashboard";
import "./styles/responsive.css";
import AdminDashboard from "./Admin/AdminDashboard";
import PesoLanding from "./pesolanding/peso";
import EmployerJobsPage from "./components/Jobs/EmployerJobsPage";
import JobApplicantsPage from "./components/Jobs/JobApplicantsPage";
import ApplicantJobsPage from "./components/Jobs/ApplicantJobsPage";
import MyApplicationsPage from "./components/Jobs/MyApplicationsPage";
import ContactPage from "./pages/ContactPage";
import VerifyEmail from "./pages/verifyemail";
import Jobs from "./pesolanding/Jobs";
import CdspSchedulePage from "./pages/CdspSchedulePage";
import pesoLogo from "/assets/peso-logo.png";
import SraSchedules from "./pages/SraSchedules";
import LraSchedules from "./pages/LraSchedules";
import SpesPage from "./pages/SpesPage";
import JobFairSchedules from "./pages/Jobfairschedules";
import GipPage from "./pages/gip";

// ---------------------------
// PESO LOGO LOADING SCREEN
// ---------------------------
const Loading: React.FC<{ visible: boolean }> = ({ visible }) => (
  <>
    <style>{`
      @keyframes peso-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes peso-spin-reverse {
        from { transform: rotate(0deg); }
        to   { transform: rotate(-360deg); }
      }
      .peso-loader-wrap {
        position: fixed;
        inset: 0;
        background: rgba(26, 26, 26, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        gap: 20px;
        opacity: ${visible ? 1 : 0};
        transition: opacity 0.35s ease;
        pointer-events: ${visible ? "auto" : "none"};
      }
      .peso-spinner {
        position: relative;
        width: 110px;
        height: 110px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .peso-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 3px solid transparent;
      }
      .peso-ring-outer {
        border-top-color: #c0151a;
        border-right-color: #c0151a;
        animation: peso-spin 1.1s linear infinite;
      }
      .peso-ring-middle {
        inset: 10px;
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: #1a1d5e;
        border-left-color: #1a1d5e;
        animation: peso-spin-reverse 0.85s linear infinite;
      }
      .peso-ring-inner {
        inset: 20px;
        border-top-color: #f5c842;
        border-right-color: transparent;
        border-bottom-color: transparent;
        border-left-color: transparent;
        animation: peso-spin 0.65s linear infinite;
      }
      .peso-logo-img {
        width: 52px;
        height: 52px;
        object-fit: contain;
        position: relative;
        z-index: 1;
      }
      .peso-loader-text {
        font-family: 'Source Sans 3', 'Segoe UI', sans-serif;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.6);
      }
    `}</style>
    <div className="peso-loader-wrap">
      <div className="peso-spinner">
        <div className="peso-ring peso-ring-outer" />
        <div className="peso-ring peso-ring-middle" />
        <div className="peso-ring peso-ring-inner" />
        <img src={pesoLogo} alt="PESO" className="peso-logo-img" />
      </div>
      <span className="peso-loader-text">P.E.S.O. Capiz</span>
    </div>
  </>
);

// ---------------------------
// ROUTE LOADER WRAPPER
// Fires the apiLoading event on every route mount to cover
// the white flash that appears before a page's content renders.
// ---------------------------
const RouteLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("apiLoading", { detail: { isLoading: true } }));
    // Dismiss after a short tick — the MIN_LOADER_MS in App will keep it visible long enough
    const t = setTimeout(() =>
      window.dispatchEvent(new CustomEvent("apiLoading", { detail: { isLoading: false } }))
      , 50);
    return () => clearTimeout(t);
  }, []);
  return <>{children}</>;
};

// ---------------------------
// ROUTER
// ---------------------------
const router = createBrowserRouter([
  { path: "/contact", element: <RouteLoader><ContactPage /></RouteLoader> },
  { path: "/login", element: <RouteLoader><Login /></RouteLoader> },
  { path: "/register", element: <RouteLoader><Register /></RouteLoader> },

  // ── Email Verification ──────────────────────────────────────────────────
  { path: "/verify-email/success", element: <RouteLoader><VerifyEmail /></RouteLoader> },
  { path: "/verify-email/error", element: <RouteLoader><VerifyEmail /></RouteLoader> },
  { path: "/verify-email/already-verified", element: <RouteLoader><VerifyEmail /></RouteLoader> },

  { path: "/schedule", element: <RouteLoader><CdspSchedulePage /></RouteLoader> },
  { path: "/jobvacancies", element: <RouteLoader><Jobs /></RouteLoader> },
  { path: "/Jobfairschedules", element: <RouteLoader><JobFairSchedules /></RouteLoader> },
  { path: "/lraschedules", element: <RouteLoader><LraSchedules /></RouteLoader> },
  { path: "/sraschedules", element: <RouteLoader><SraSchedules /></RouteLoader> },
  { path: "/spespage", element: <RouteLoader><SpesPage /></RouteLoader> },
  { path: "/gip", element: <RouteLoader><GipPage /></RouteLoader> },

  {
    path: "/users",
    element: (
      <ProtectedRoute allowedRoles={["employer", "admin"]}>
        <RouteLoader>
          <>
            <Navbar />
            <UserManagement />
          </>
        </RouteLoader>
      </ProtectedRoute>
    ),
  },
  {
    path: "/employer/jobs",
    element: (
      <ProtectedRoute allowedRoles={["employer", "admin"]}>
        <RouteLoader><EmployerJobsPage /></RouteLoader>
      </ProtectedRoute>
    ),
  },
  {
    path: "/employer/jobs/:jobId/applicants",
    element: (
      <ProtectedRoute allowedRoles={["employer", "admin"]}>
        <RouteLoader><JobApplicantsPage /></RouteLoader>
      </ProtectedRoute>
    ),
  },
  {
    path: "/jobs",
    element: (
      <ProtectedRoute allowedRoles={["applicant"]}>
        <RouteLoader><ApplicantJobsPage /></RouteLoader>
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-applications",
    element: (
      <ProtectedRoute allowedRoles={["applicant"]}>
        <RouteLoader><MyApplicationsPage /></RouteLoader>
      </ProtectedRoute>
    ),
  },
  {
    path: "/landing",
    element: (
      <ProtectedRoute allowedRoles={["applicant", "employer", "admin"]}>
        <RouteLoader>
          <>
            <LandingPage />
          </>
        </RouteLoader>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute allowedRoles={["applicant", "employer", "admin"]}>
        <RouteLoader><StudentProfile /></RouteLoader>
      </ProtectedRoute>
    ),
  },
  { path: "/intro", element: <RouteLoader><Intro /></RouteLoader> },
  { path: "/", element: <RouteLoader><PesoLanding /></RouteLoader> },
  { path: "*", element: <RouteLoader><NotFound /></RouteLoader> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["applicant", "employer", "admin"]}>
        <RouteLoader>
          <>
            <Navbar />
            <Dashboard />
          </>
        </RouteLoader>
      </ProtectedRoute>
    ),
  },
  {
    path: "/Admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <RouteLoader>
          <>
            <AdminDashboard />
          </>
        </RouteLoader>
      </ProtectedRoute>
    ),
  },
]);

// ---------------------------
// APP COMPONENT
// ---------------------------
const FADE_DURATION = 350;  // ms — must match the CSS transition duration
const MIN_LOADER_MS = 600;  // loader always visible for at least this long

const App: React.FC = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  // visible = opacity 1/0, mounted = actually in DOM (stays true during fade-out)
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderMounted, setLoaderMounted] = useState(true);

  const showLoader = () => {
    setLoaderMounted(true);
    // Small rAF so the element is in the DOM before we set opacity to 1
    requestAnimationFrame(() => setLoaderVisible(true));
  };

  const hideLoader = () => {
    setLoaderVisible(false); // triggers CSS fade-out
    setTimeout(() => setLoaderMounted(false), FADE_DURATION);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
      hideLoader();
    }, 800);

    let loaderShownAt: number | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const handleApiLoading = (e: Event) => {
      const customEvent = e as CustomEvent<{ isLoading: boolean }>;
      const isLoading = customEvent.detail.isLoading;

      if (isLoading) {
        if (hideTimer) clearTimeout(hideTimer);
        loaderShownAt = Date.now();
        showLoader();
      } else {
        const elapsed = loaderShownAt ? Date.now() - loaderShownAt : MIN_LOADER_MS;
        const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
        hideTimer = setTimeout(() => hideLoader(), remaining);
      }
    };

    window.addEventListener("apiLoading", handleApiLoading);

    return () => {
      clearTimeout(timer);
      if (hideTimer) clearTimeout(hideTimer);
      window.removeEventListener("apiLoading", handleApiLoading);
    };
  }, []);

  return (
    <>
      {loaderMounted && <Loading visible={loaderVisible} />}
      {!initialLoading && <RouterProvider router={router} />}
    </>
  );
};

export default App;