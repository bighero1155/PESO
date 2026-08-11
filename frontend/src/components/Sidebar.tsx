import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Briefcase, LogOut, Home, User, Menu, X, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Match current path — also handles nested routes like /employer/jobs/123/applicants
  const isActive = (path: string) => {
    if (path === "/landing") return location.pathname === "/landing";
    return location.pathname.startsWith(path);
  };

  const NAV_ITEMS = user?.role === "employer"
    ? [
        { icon: <Home size={18} />,     label: "Home",          path: "/landing"       },
        { icon: <User size={18} />,     label: "My Profile",    path: "/profile"       },
        { icon: <Briefcase size={18} />,label: "Job Postings",  path: "/employer/jobs" },
      ]
    : [
        { icon: <Home size={18} />,     label: "Home",           path: "/landing"          },
        { icon: <User size={18} />,     label: "My Profile",     path: "/profile"          },
        { icon: <Briefcase size={18} />,label: "Available Jobs",  path: "/jobs"             },
        { icon: <FileText size={18} />, label: "My Applications", path: "/my-applications"  },
      ];

  return (
    <>
      {/* MOBILE TOPBAR */}
      <div className="peso-mobile-topbar">
        <button className="peso-menu-btn" onClick={() => setMobileOpen(p => !p)}>
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
        <span className="peso-topbar-brand">P.E.S.O.</span>
        <div style={{ width: 26 }} />
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 994 }}
        />
      )}

      {/* SIDEBAR */}
      <div className={`peso-sidebar ${mobileOpen ? "open" : ""}`}>

        {/* Brand */}
        <div className="peso-sidebar-brand">
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 900, color: "white", lineHeight: 1 }}>
            P.E.S.O.
          </div>
          <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", letterSpacing: 2, textTransform: "uppercase", marginTop: 3 }}>
            Roxas City
          </div>
        </div>

        {/* User info */}
        {user && (
          <div className="peso-user-info">
            <div className="peso-user-avatar">
              {user.first_name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="peso-user-name">{user.first_name} {user.last_name}</p>
              <p className="peso-user-role">{user.role}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`peso-nav-btn ${isActive(item.path) ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive(item.path) && <div className="peso-active-bar" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button className="peso-logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap');

        .peso-sidebar {
          width: 260px;
          height: 100vh;
          background: linear-gradient(160deg, #1a1d5e 0%, #0f1240 100%);
          position: fixed;
          left: 0; top: 0;
          padding: 28px 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 995;
          border-right: 3px solid #e8a800;
          transition: transform 0.3s ease;
          font-family: 'Source Sans 3', sans-serif;
        }

        .peso-sidebar-brand {
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(232,168,0,0.25);
        }

        .peso-user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 12px;
          margin-bottom: 20px;
        }

        .peso-user-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: #e8a800;
          color: #1a1d5e;
          font-weight: 900;
          font-size: 0.95rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-family: 'Playfair Display', serif;
        }

        .peso-user-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
          margin: 0 0 2px;
          line-height: 1.2;
        }

        .peso-user-role {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.45);
          margin: 0;
          text-transform: capitalize;
          letter-spacing: 0.5px;
        }

        .peso-nav-btn {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 14px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          width: 100%;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .peso-nav-btn:hover {
          background: rgba(255,255,255,0.08);
          color: white;
        }

        .peso-nav-btn.active {
          background: rgba(232,168,0,0.15);
          color: #f5c842;
          border: 1px solid rgba(232,168,0,0.25);
          font-weight: 700;
        }

        .peso-active-bar {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #e8a800;
          border-radius: 0 3px 3px 0;
        }

        .peso-logout-btn {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(192,21,26,0.3);
          background: rgba(192,21,26,0.08);
          color: rgba(255,120,120,0.85);
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          width: 100%;
          margin-top: 8px;
        }

        .peso-logout-btn:hover {
          background: rgba(192,21,26,0.22);
          color: #ff8080;
          border-color: rgba(192,21,26,0.5);
        }

        /* Mobile topbar */
        .peso-mobile-topbar {
          display: none;
        }

        @media (max-width: 768px) {
          .peso-mobile-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #c0151a;
            padding: 12px 18px;
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 998;
            height: 56px;
          }

          .peso-menu-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
          }

          .peso-topbar-brand {
            font-family: 'Playfair Display', serif;
            font-size: 1.1rem;
            font-weight: 900;
            color: white;
          }

          .peso-sidebar {
            transform: translateX(-100%);
            top: 56px;
            height: calc(100vh - 56px);
            z-index: 995;
          }

          .peso-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;