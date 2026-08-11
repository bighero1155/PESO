import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

interface User {
  role: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

const LandingPage: React.FC = () => {
  useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedUser: string | null = localStorage.getItem("user");
    if (!storedUser) { navigate("/"); return; }
    try {
      const parsedUser: User = JSON.parse(storedUser);
      setRole(parsedUser.role || null);
      setUserName(parsedUser.first_name || parsedUser.username || "");
    } catch {
      navigate("/");
    }
  }, [navigate]);

  const C = {
    navy: "#1a1d5e", red: "#c0151a", gold: "#e8a800",
    goldLight: "#f5c842", lightBg: "#f4f4f6", cream: "#fdf8f0",
    muted: "#5a5a7a", border: "rgba(26,29,94,0.12)",
  };

  const QUICK_LINKS = [
    { icon: "💼", label: "Browse Jobs",        path: "/jobs",             roles: ["applicant"] },
    { icon: "📋", label: "My Applications",    path: "/my-applications",  roles: ["applicant"] },
    { icon: "🏢", label: "My Job Postings",    path: "/employer/jobs",    roles: ["employer"]  },
    { icon: "👤", label: "My Profile",         path: "/profile",          roles: ["applicant", "employer"] },
  ];

  const SERVICES = [
    { icon: "💼", title: "Job Placement",       desc: "Matching qualified applicants with local and national employers through our extensive job referral network." },
    { icon: "✈️", title: "Overseas Employment", desc: "Facilitation and pre-departure orientation for Filipinos seeking opportunities abroad through legal channels." },
    { icon: "📋", title: "Job Fairs",           desc: "Regular job fair events bringing together hundreds of employers and thousands of job seekers in one venue." },
    { icon: "🎓", title: "Skills Training",     desc: "Coordination with TESDA and other agencies to provide vocational and technical training for improved employability." },
    { icon: "🤝", title: "Career Counseling",   desc: "One-on-one guidance for job seekers on career choices, resume writing, and interview preparation." },
    { icon: "📊", title: "Labor Market Info",   desc: "Providing up-to-date labor market information to help job seekers make informed career decisions." },
  ];

  const PROGRAMS = [
    { num: "01", title: "TUPAD", full: "Tulong Panghanapbuhay sa Ating Disadvantaged/Displaced Workers", desc: "Community-based assistance for informal economy workers, displaced or underemployed individuals." },
    { num: "02", title: "SPES",  full: "Special Program for Employment of Students",                     desc: "Helping poor but deserving students with temporary employment during summer or Christmas break." },
    { num: "03", title: "GIP",   full: "Government Internship Program",                                  desc: "Providing college students with government internship experience and exposure to public service." },
    { num: "04", title: "LSEA",  full: "Livelihood and Self-Employment Assistance",                      desc: "Supporting displaced workers and underprivileged community members with livelihood kits and financial assistance." },
  ];

  const visibleLinks = QUICK_LINKS.filter(l => !role || l.roles.includes(role));

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />

      <div style={{ display: "flex", minHeight: "100vh", background: C.cream, fontFamily: "'Source Sans 3', sans-serif" }}>
        <Sidebar />

        {/* Main content — offset for sidebar */}
        <div style={{ marginLeft: 260, flex: 1, display: "flex", flexDirection: "column" }}>

          {/* ── Hero Banner ─────────────────────────────────────────── */}
          <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #0f1240 100%)`, padding: "48px 40px 40px", position: "relative", overflow: "hidden", borderBottom: `4px solid ${C.gold}` }}>
            {/* Dot grid background */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />

            {/* Floating emojis */}
            {["💼","📋","🏢","✈️","🤝","🎓"].map((e, i) => (
              <div key={i} style={{ position: "absolute", fontSize: "2rem", opacity: 0.06, top: `${10 + i * 14}%`, right: `${4 + i * 6}%`, transform: `rotate(${i * 15}deg)`, pointerEvents: "none", userSelect: "none" }}>{e}</div>
            ))}

            <div style={{ position: "relative", zIndex: 1 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.gold, display: "block", marginBottom: 10 }}>
                Public Employment Service Office
              </span>
              <h1 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "0 0 10px", lineHeight: 1.1 }}>
                Welcome back, {userName || "there"} 👋
              </h1>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem", margin: "0 0 32px", maxWidth: 520, lineHeight: 1.65, fontWeight: 300 }}>
                {role === "employer"
                  ? "Manage your job postings, review applicants, and find the right talent for your company."
                  : "Browse open positions, track your applications, and take the next step in your career — free of charge."}
              </p>

              {/* Quick action buttons */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {visibleLinks.map(link => (
                  <button key={link.path} onClick={() => navigate(link.path)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 10, border: `1.5px solid rgba(232,168,0,0.4)`, background: "rgba(232,168,0,0.1)", color: C.goldLight, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(232,168,0,0.1)"; e.currentTarget.style.color = C.goldLight; e.currentTarget.style.borderColor = "rgba(232,168,0,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    {link.icon} {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Gold marquee bar ─────────────────────────────────────── */}
          <div style={{ background: C.gold, padding: "10px 0", overflow: "hidden", whiteSpace: "nowrap", flexShrink: 0 }}>
            <div style={{ display: "inline-block", animation: "peso-marquee 30s linear infinite" }}>
              {[...Array(2)].flatMap(() =>
                ["Job Placement Assistance","Livelihood Programs","Overseas Employment","Skills Training","Job Fairs","Makakahanap Ng Trabaho","Special Hiring","Career Counseling"]
                  .map((item, i) => (
                    <span key={i} style={{ fontSize: "0.78rem", fontWeight: 600, color: C.navy, letterSpacing: 1, textTransform: "uppercase", padding: "0 28px" }}>
                      ★&nbsp;&nbsp;{item}
                    </span>
                  ))
              )}
            </div>
          </div>

          {/* ── Page content ──────────────────────────────────────────── */}
          <div style={{ padding: "40px 40px 64px", flex: 1 }}>

            {/* About PESO */}
            <div style={{ background: "white", borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "32px 36px", marginBottom: 36, display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap", boxShadow: "0 2px 12px rgba(26,29,94,0.06)" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.red, display: "block", marginBottom: 8 }}>About PESO</span>
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: C.navy, fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", margin: "0 0 14px", lineHeight: 1.2 }}>
                  Public Employment Service Office
                </h2>
                <p style={{ color: C.muted, fontSize: "0.93rem", lineHeight: 1.8, margin: "0 0 14px", fontWeight: 300 }}>
                  The PESO is a non-fee charging multi-employment service facility established under <strong style={{ color: C.navy, fontWeight: 600 }}>Republic Act No. 8759</strong>, also known as the PESO Act of 1999. It serves as your government's partner in connecting job seekers with quality employment opportunities — completely free of charge.
                </p>
                <p style={{ color: C.muted, fontSize: "0.93rem", lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
                  Located in Roxas City, Capiz, our office provides a wide range of employment facilitation services to help every Filipino find decent and productive work.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
                {[
                  { icon: "📍", label: "Location",  val: "Roxas City, Capiz" },
                  { icon: "📞", label: "Contact",   val: "(036) 621-0000"     },
                  { icon: "✉️", label: "Email",     val: "peso@roxascity.gov.ph" },
                  { icon: "🕐", label: "Hours",     val: "Mon–Fri, 8AM – 5PM" },
                ].map(({ icon, label, val }) => (
                  <div key={label} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: C.lightBg, border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 }}>{icon}</div>
                    <div>
                      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, margin: 0 }}>{label}</p>
                      <p style={{ fontSize: "0.86rem", color: C.navy, margin: 0, fontWeight: 500 }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Our Services */}
            <div style={{ marginBottom: 40 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.red, display: "block", marginBottom: 6 }}>What We Offer</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: C.navy, fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", margin: "0 0 24px" }}>Our Core Services</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {SERVICES.map(s => (
                  <ServiceCard key={s.title} {...s} />
                ))}
              </div>
            </div>

            {/* DOLE Programs */}
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.red, display: "block", marginBottom: 6 }}>Government Programs</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: C.navy, fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", margin: "0 0 24px" }}>DOLE Implemented Programs</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {PROGRAMS.map(p => (
                  <ProgramCard key={p.num} {...p} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes peso-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (max-width: 768px) {
          /* sidebar on mobile pushes marginLeft to 0 since it overlays */
        }
      `}</style>
    </>
  );
};

// ── Service Card ──────────────────────────────────────────────────────────────
function ServiceCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  const C = { navy: "#1a1d5e", red: "#c0151a", gold: "#e8a800", lightBg: "#f4f4f6", border: "rgba(26,29,94,0.12)", muted: "#5a5a7a" };
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "26px 22px", position: "relative", overflow: "hidden", transform: hovered ? "translateY(-4px)" : "translateY(0)", boxShadow: hovered ? "0 12px 32px rgba(26,29,94,0.10)" : "0 2px 8px rgba(26,29,94,0.05)", transition: "all 0.25s" }}
    >
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.red}, ${C.gold})`, transform: hovered ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 0.25s ease" }} />
      <span style={{ fontSize: "2rem", marginBottom: 14, display: "block" }}>{icon}</span>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", color: C.navy, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: C.muted, fontSize: "0.86rem", lineHeight: 1.65, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ── Program Card ──────────────────────────────────────────────────────────────
function ProgramCard({ num, title, full, desc }: { num: string; title: string; full: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  const C = { navy: "#1a1d5e", red: "#c0151a", lightBg: "#f4f4f6", border: "rgba(26,29,94,0.12)", muted: "#5a5a7a" };
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "white", borderRadius: 12, padding: "20px 22px", borderLeft: `4px solid ${C.red}`, border: `1.5px solid ${C.border}`, borderLeftWidth: 4, borderLeftColor: C.red, boxShadow: hovered ? "0 8px 24px rgba(26,29,94,0.09)" : "0 2px 6px rgba(26,29,94,0.04)", transition: "box-shadow 0.22s" }}
    >
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 900, color: "rgba(192,21,26,0.15)", lineHeight: 1, minWidth: 36, flexShrink: 0 }}>{num}</span>
      <div>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 3px" }}>{title}</p>
        <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: C.navy, margin: "0 0 6px", lineHeight: 1.35 }}>{full}</h4>
        <p style={{ fontSize: "0.83rem", color: C.muted, lineHeight: 1.6, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}

export default LandingPage;