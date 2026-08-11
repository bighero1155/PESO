import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  Home,
  Briefcase,
  User,
  CalendarDays,
} from "lucide-react";
import TeacherProfile from "./Users/TeacherProfile";
import TeacherProfileViewModal from "./Users/TeacherProfileViewModal";
import NavbarCSS from "../styles/NavbarCSS";

const SIDEBAR_WIDTH = 280;
const TOPBAR_HEIGHT = 70;
const MOBILE_BREAKPOINT = 768;

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showTeacherProfile, setShowTeacherProfile] = useState(false);
  const [activeLink, setActiveLink] = useState("/dashboard");
  const navigate = useNavigate();

  const isTeacher = user?.role === "employer";
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const applyLayoutOffset = () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        document.body.style.paddingLeft = `${SIDEBAR_WIDTH}px`;
        document.body.style.paddingTop = "";
      } else {
        document.body.style.paddingLeft = "";
        document.body.style.paddingTop = `${TOPBAR_HEIGHT}px`;
      }
    };

    applyLayoutOffset();
    window.addEventListener("resize", applyLayoutOffset);

    return () => {
      window.removeEventListener("resize", applyLayoutOffset);
      document.body.style.paddingLeft = "";
      document.body.style.paddingTop = "";
    };
  }, []);

  useEffect(() => {
    setActiveLink(window.location.pathname);
  }, []);

  return (
    <>
      <NavbarCSS />

      <nav className="nav-sidebar" role="navigation">

        {/* HEADER — PESO Branding */}
        <div className="nav-header">
          <Link className="nav-brand" to="/dashboard">
            <img
              src="/assets/peso-logo.png"
              alt="PESO Logo"
              className="nav-logo"
            />
            <div>
              <div className="nav-brand-text">P.E.S.O.</div>
              <div className="nav-brand-sub">Roxas City</div>
            </div>
          </Link>
        </div>

        {/* EMPLOYER PROFILE — desktop only */}
        {isTeacher && (
          <div className="nav-profile-section">
            <TeacherProfile />
          </div>
        )}

        {/* SECTION LABEL */}
        <div className="nav-section-label">MENU</div>

        {/* MENU */}
        <ul className="nav-menu">
          {(isAdmin || isTeacher) && (
            <>
              <li className="nav-item">
                <Link
                  className={`nav-link ${activeLink === "/dashboard" ? "active" : ""}`}
                  to="/dashboard"
                  onClick={() => setActiveLink("/dashboard")}
                >
                  <Home size={18} className="nav-link-icon" />
                  <span className="nav-link-text">DASHBOARD</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${activeLink === "/employer/jobs" ? "active" : ""}`}
                  to="/employer/jobs"
                  onClick={() => setActiveLink("/employer/jobs")}
                >
                  <Briefcase size={18} className="nav-link-icon" />
                  <span className="nav-link-text">JOB POSTINGS</span>
                </Link>
              </li>

              {/* CDSP Schedule — admin only */}
              {isAdmin && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${activeLink === "/admin/cdsp-schedule" ? "active" : ""}`}
                    to="/admin/cdsp-schedule"
                    onClick={() => setActiveLink("/admin/cdsp-schedule")}
                  >
                    <CalendarDays size={18} className="nav-link-icon" />
                    <span className="nav-link-text">CDSP SCHEDULE</span>
                  </Link>
                </li>
              )}
            </>
          )}

          {/* MOBILE PROFILE BUTTON */}
          {isTeacher && (
            <li className="nav-item nav-teacher-mobile">
              <button
                className="nav-link"
                onClick={() => setShowTeacherProfile(true)}
                aria-label="Profile"
              >
                <User size={18} className="nav-link-icon" />
                <span className="nav-link-text">PROFILE</span>
              </button>
            </li>
          )}
        </ul>

        {/* LOGOUT */}
        <div className="nav-logout">
          <button className="nav-link" onClick={handleLogout}>
            <LogOut size={18} className="nav-link-icon" />
            <span className="nav-link-text">LOGOUT</span>
          </button>
        </div>
      </nav>

      {/* MODALS */}
      <TeacherProfileViewModal
        show={showTeacherProfile}
        onClose={() => setShowTeacherProfile(false)}
      />
    </>
  );
};

export default Navbar;