import { useState, useEffect, useRef } from "react";
import pesoLogo from "/assets/peso-logo.png";

// ── Data ─────────────────────────────────────────────────────────────────────

const DOLE_PROGRAMS_MENU = [
  {
    label: "Job Fair",
    href: null,
    children: [
      { label: "Job Fair Schedules", href: "/Jobfairschedules" },
    ],
  },
  {
    label: "Local Recruitment Activity (LRA)",
    href: null,
    children: [
      { label: "LRA Schedules", href: "/lraschedules" },
    ],
  },
  {
    label: "Special Recruitment Activity (SRA)",
    href: null,
    children: [
      { label: "SRA Schedules", href: "/sraschedules" },
    ],
  },
  {
    label: "SPES",
    href: "/spespage",
    children: [],
  },
  {
    label: "GIP",
    href: "/gip",
    children: [],
  },
  {
    label: "JobStart",
    href: "#jobstart",
    children: [],
  },
];

// Core Services — flat accordion list matching the sidebar/dropdown in the image.
// Items with `children` show an expand arrow; items without are direct links.
const CORE_SERVICES_MENU = [
  {
    label: "Referral and Placement",
    href: null,
    children: [
      { label: "Job Matching and Referral", href: "/jobvacancies" },
    ],
  },
  {
    label: "Labor Market Information",
    href: null,
    children: [
      { label: "Quarterly Report", href: "#quarterly-report" },
    ],
  },
  {
    label: "Career Development Support",
    href: "/schedule",
    children: [],
  },
];

const OTHER_PROGRAMS_MENU = [
  {
    label: "Migrants Helpdesk",
    href: "#migrants-helpdesk",
    children: [],
  },
  {
    label: "Employability Enhancement Seminar",
    href: "#employability-enhancement-seminar",
    children: [],
  },
  {
    label: "On-the-Job Training/Immersion Apprenticeship Program",
    href: "#ojt-immersion-apprenticeship",
    children: [],
  },
];

// ── Mobile Drawer ─────────────────────────────────────────────────────────────

function MobileDrawer({
  open, onClose,
}: {
  open: boolean; onClose: () => void; onLoginClick: () => void; onRegisterClick: () => void;
}) {
  const [coreOpen, setCoreOpen] = useState(false);
  const [doleOpen, setDoleOpen] = useState(false);
  const [coreSubOpen, setCoreSubOpen] = useState<number | null>(null);
  const [doleSubOpen, setDoleSubOpen] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const toggleCoreSub = (i: number) =>
    setCoreSubOpen(prev => (prev === i ? null : i));

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 199,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 200,
          width: "min(300px, 85vw)", background: "#1a1d5e",
          boxShadow: "-6px 0 40px rgba(0,0,0,0.45)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", flexDirection: "column", overflowY: "auto",
        }}
      >
        {/* Drawer header */}
        <div style={{ background: "#c0151a", padding: "0 16px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={pesoLogo} alt="PESO" style={{ width: 34, height: 34, objectFit: "contain" }} />
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: "0.9rem", letterSpacing: 1 }}>P.E.S.O.</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.52rem", letterSpacing: 0.8, textTransform: "uppercase" }}>Capiz</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close menu" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: "1rem" }}>✕</button>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {/* HOME */}
          <a href="#" onClick={onClose} style={{ display: "flex", alignItems: "center", padding: "15px 24px", color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "0.95rem", fontWeight: 400, borderLeft: "3px solid transparent", borderBottom: "1px solid rgba(255,255,255,0.05)", letterSpacing: 0.2, transition: "all 0.15s" }}>HOME</a>

          {/* CORE SERVICES */}
          <div>
            <button
              onClick={() => { setCoreOpen(p => !p); if (coreOpen) { setCoreSubOpen(null); } }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "15px 24px", color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", fontWeight: 400, background: "transparent", borderBottom: "1px solid rgba(255,255,255,0.05)", letterSpacing: 0.2, border: "none", cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <span>Core Services</span>
              <span style={{ fontSize: "0.7rem", transition: "transform 0.2s", transform: coreOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▼</span>
            </button>
            {coreOpen && (
              <div style={{ background: "rgba(0,0,0,0.15)" }}>
                {CORE_SERVICES_MENU.map((section, i) => (
                  <div key={section.label}>
                    {section.children.length > 0 ? (
                      <button
                        onClick={() => toggleCoreSub(i)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 24px 12px 36px", color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", fontWeight: 500, background: "transparent", borderBottom: "1px solid rgba(255,255,255,0.04)", border: "none", cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        <span>{section.label}</span>
                        <span style={{ fontSize: "0.65rem", transition: "transform 0.2s", transform: coreSubOpen === i ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▼</span>
                      </button>
                    ) : (
                      <a
                        href={section.href ?? "#"}
                        onClick={onClose}
                        style={{ display: "flex", alignItems: "center", padding: "12px 24px 12px 36px", color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        {section.label}
                      </a>
                    )}
                    {section.children.length > 0 && coreSubOpen === i && (
                      <div style={{ background: "rgba(0,0,0,0.15)" }}>
                        {section.children.map(child => (
                          <a
                            key={child.label}
                            href={child.href}
                            onClick={onClose}
                            style={{ display: "flex", alignItems: "center", padding: "11px 24px 11px 52px", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.85rem", borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "color 0.15s" }}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => { setDoleOpen(p => !p); if (doleOpen) { setDoleSubOpen(null); } }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "15px 24px", color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", fontWeight: 400, background: "transparent", borderBottom: "1px solid rgba(255,255,255,0.05)", letterSpacing: 0.2, border: "none", cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <span>DOLE Programs Implemented</span>
              <span style={{ fontSize: "0.7rem", transition: "transform 0.2s", transform: doleOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▼</span>
            </button>
            {doleOpen && (
              <div style={{ background: "rgba(0,0,0,0.15)" }}>
                {DOLE_PROGRAMS_MENU.map((section, i) => (
                  <div key={section.label}>
                    {section.children.length > 0 ? (
                      <button
                        onClick={() => setDoleSubOpen(prev => (prev === i ? null : i))}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 24px 12px 36px", color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", fontWeight: 500, background: "transparent", borderBottom: "1px solid rgba(255,255,255,0.04)", border: "none", cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        <span>{section.label}</span>
                        <span style={{ fontSize: "0.65rem", transition: "transform 0.2s", transform: doleSubOpen === i ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▼</span>
                      </button>
                    ) : (
                      <a
                        href={section.href ?? "#"}
                        onClick={onClose}
                        style={{ display: "flex", alignItems: "center", padding: "12px 24px 12px 36px", color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        {section.label}
                      </a>
                    )}
                    {section.children.length > 0 && doleSubOpen === i && (
                      <div style={{ background: "rgba(0,0,0,0.15)" }}>
                        {section.children.map(child => (
                          <a
                            key={child.label}
                            href={child.href}
                            onClick={onClose}
                            style={{ display: "flex", alignItems: "center", padding: "11px 24px 11px 52px", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.85rem", borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "color 0.15s" }}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CONTACT US */}
          <a href="/contact" onClick={onClose} style={{ display: "flex", alignItems: "center", padding: "15px 24px", color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "0.95rem", fontWeight: 400, borderLeft: "3px solid transparent", borderBottom: "1px solid rgba(255,255,255,0.05)", letterSpacing: 0.2, transition: "all 0.15s" }}>Contact Us</a>
        </nav>

        {/*
          Log In / Register buttons — hidden for now, not wired up to real
          pages yet. onLoginClick / onRegisterClick are still threaded through
          as props from PesoLanding, so uncomment this block whenever the
          login/register flow is ready to go live.

          <div style={{ padding: "20px 20px 36px", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.12)", flexShrink: 0 }}>
            <button onClick={() => { onClose(); onLoginClick(); }} style={{ width: "100%", padding: "13px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.35)", background: "transparent", color: "white", fontSize: "0.92rem", fontWeight: 600, cursor: "pointer", letterSpacing: 0.3, fontFamily: "'Source Sans 3', sans-serif" }}>Log In</button>
            <button onClick={() => { onClose(); onRegisterClick(); }} style={{ width: "100%", padding: "13px", borderRadius: 8, border: "none", background: "#f5c842", color: "#1a1d5e", fontSize: "0.92rem", fontWeight: 800, cursor: "pointer", letterSpacing: 0.3, boxShadow: "0 2px 12px rgba(245,200,66,0.4)", fontFamily: "'Source Sans 3', sans-serif" }}>Register</button>
          </div>
        */}
      </div>
    </>
  );
}

// ── Core Services Flat Accordion Dropdown (Desktop) ───────────────────────────
// Matches the image: a single white panel, each section is a row.
// Sections with children show a ► arrow and expand inline.
// Sections without children are plain links.

function CoreServicesDropdown({ active, onActivate }: { active: boolean; onActivate: () => void }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLLIElement>(null);

  const calcCoords = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + 4, left: r.left });
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setExpandedSection(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const update = () => calcCoords();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const toggleSection = (i: number) =>
    setExpandedSection(prev => (prev === i ? null : i));

  return (
    <li ref={ref} style={{ display: "flex", alignItems: "stretch", position: "relative" }}>
      <button
        ref={btnRef}
        onClick={() => { calcCoords(); setOpen(p => !p); if (open) setExpandedSection(null); onActivate(); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "0 13px",
          color: hovered || open ? "white" : "rgba(255,255,255,0.88)",
          background: hovered || open ? "rgba(255,255,255,0.12)" : "transparent",
          border: "none", cursor: "pointer",
          fontSize: "0.8rem", fontWeight: active ? 700 : 500,
          whiteSpace: "nowrap", position: "relative",
          transition: "all 0.2s", letterSpacing: 0.2,
          fontFamily: "'Source Sans 3', sans-serif", height: "100%",
        }}
      >
        Core Services
        <span style={{ fontSize: "0.55rem", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", marginTop: open ? -1 : 1 }}>▼</span>
        {active && <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#f5c842", borderRadius: "2px 2px 0 0" }} />}
      </button>

      {/* Flat dropdown panel */}
      <div
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          width: 280,
          background: "white",
          borderRadius: 10,
          boxShadow: "0 8px 32px rgba(26,29,94,0.18), 0 2px 8px rgba(0,0,0,0.10)",
          overflow: "hidden",
          zIndex: 9999,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-6px)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        } as React.CSSProperties}
      >
        {CORE_SERVICES_MENU.map((section, i) => {
          const hasChildren = section.children.length > 0;
          const isExpanded = expandedSection === i;

          return (
            <div key={section.label}>
              {/* Section row */}
              {hasChildren ? (
                <button
                  onClick={() => toggleSection(i)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "13px 18px",
                    background: isExpanded ? "#fef4f4" : "white",
                    border: "none",
                    borderBottom: isExpanded ? "none" : "1px solid rgba(26,29,94,0.07)",
                    cursor: "pointer",
                    fontFamily: "'Source Sans 3', sans-serif",
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Expand icon matching the image's square arrow */}
                    <span style={{
                      width: 20, height: 20, borderRadius: 4,
                      background: isExpanded ? "#c0151a" : "rgba(192,21,26,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.55rem", color: isExpanded ? "white" : "#c0151a",
                      flexShrink: 0, transition: "all 0.15s",
                    }}>
                      {isExpanded ? "▼" : "▶"}
                    </span>
                    <span style={{ color: "#1a1d5e", fontSize: "0.87rem", fontWeight: 600, textAlign: "left" }}>{section.label}</span>
                  </span>
                </button>
              ) : (
                <a
                  href={section.href ?? "#"}
                  onClick={() => { setOpen(false); setExpandedSection(null); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "13px 18px",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(26,29,94,0.07)",
                    background: "white",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fef4f4")}
                  onMouseLeave={e => (e.currentTarget.style.background = "white")}
                >
                  {/* Spacer to align with bulleted rows */}
                  <span style={{ width: 20, height: 20, flexShrink: 0 }} />
                  <span style={{ color: "#1a1d5e", fontSize: "0.87rem", fontWeight: 600 }}>{section.label}</span>
                </a>
              )}

              {/* Expanded children */}
              {hasChildren && isExpanded && (
                <div style={{ background: "#fef4f4", borderBottom: "1px solid rgba(26,29,94,0.07)" }}>
                  {section.children.map((child, ci) => (
                    <a
                      key={child.label}
                      href={child.href}
                      onClick={() => { setOpen(false); setExpandedSection(null); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "11px 18px 11px 48px",
                        textDecoration: "none",
                        borderBottom: ci < section.children.length - 1 ? "1px solid rgba(192,21,26,0.08)" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(192,21,26,0.06)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c0151a", flexShrink: 0 }} />
                      <span style={{ color: "#5a5a7a", fontSize: "0.84rem", fontWeight: 500 }}>{child.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </li>
  );
}

// ── Nav sub-components ────────────────────────────────────────────────────────

function NavItem({ href, label, active, onClick }: { href: string; label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <li style={{ display: "flex", alignItems: "stretch" }}>
      <a href={href} onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ display: "flex", alignItems: "center", padding: "0 13px", color: hovered ? "white" : "rgba(255,255,255,0.88)", textDecoration: "none", fontSize: "0.8rem", fontWeight: active ? 700 : 500, whiteSpace: "nowrap", position: "relative", background: hovered ? "rgba(255,255,255,0.12)" : "transparent", transition: "all 0.2s", letterSpacing: 0.2 }}>
        {label}
        {active && (<span style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#f5c842", borderRadius: "2px 2px 0 0" }} />)}
      </a>
    </li>
  );
}

// ── DOLE Programs Flat Accordion Dropdown (Desktop) ───────────────────────────
// Same pattern as CoreServicesDropdown — single column, expandable rows.

function DoleDropdown({ active, onActivate }: { active: boolean; onActivate: () => void }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLLIElement>(null);

  const calcCoords = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + 4, left: r.left });
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setExpandedSection(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const update = () => calcCoords();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const toggleSection = (i: number) =>
    setExpandedSection(prev => (prev === i ? null : i));

  return (
    <li ref={ref} style={{ display: "flex", alignItems: "stretch", position: "relative" }}>
      <button
        ref={btnRef}
        onClick={() => { calcCoords(); setOpen(p => !p); if (open) setExpandedSection(null); onActivate(); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "0 13px",
          color: hovered || open ? "white" : "rgba(255,255,255,0.88)",
          background: hovered || open ? "rgba(255,255,255,0.12)" : "transparent",
          border: "none", cursor: "pointer",
          fontSize: "0.8rem", fontWeight: active ? 700 : 500,
          whiteSpace: "nowrap", position: "relative",
          transition: "all 0.2s", letterSpacing: 0.2,
          fontFamily: "'Source Sans 3', sans-serif", height: "100%",
        }}
      >
        DOLE Programs Implemented
        <span style={{ fontSize: "0.55rem", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", marginTop: open ? -1 : 1 }}>▼</span>
        {active && <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#f5c842", borderRadius: "2px 2px 0 0" }} />}
      </button>

      {/* Flat accordion panel */}
      <div
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          width: 300,
          background: "white",
          borderRadius: 10,
          boxShadow: "0 8px 32px rgba(26,29,94,0.18), 0 2px 8px rgba(0,0,0,0.10)",
          overflow: "hidden",
          zIndex: 9999,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-6px)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        } as React.CSSProperties}
      >
        {DOLE_PROGRAMS_MENU.map((section, i) => {
          const hasChildren = section.children.length > 0;
          const isExpanded = expandedSection === i;

          return (
            <div key={section.label}>
              {/* Section row */}
              {hasChildren ? (
                <button
                  onClick={() => toggleSection(i)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "13px 18px",
                    background: isExpanded ? "#fef4f4" : "white",
                    border: "none",
                    borderBottom: isExpanded ? "none" : "1px solid rgba(26,29,94,0.07)",
                    cursor: "pointer",
                    fontFamily: "'Source Sans 3', sans-serif",
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: 4,
                      background: isExpanded ? "#c0151a" : "rgba(192,21,26,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.55rem", color: isExpanded ? "white" : "#c0151a",
                      flexShrink: 0, transition: "all 0.15s",
                    }}>
                      {isExpanded ? "▼" : "▶"}
                    </span>
                    <span style={{ color: "#1a1d5e", fontSize: "0.87rem", fontWeight: 600, textAlign: "left" }}>{section.label}</span>
                  </span>
                </button>
              ) : (
                <a
                  href={section.href ?? "#"}
                  onClick={() => { setOpen(false); setExpandedSection(null); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "13px 18px",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(26,29,94,0.07)",
                    background: "white",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fef4f4")}
                  onMouseLeave={e => (e.currentTarget.style.background = "white")}
                >
                  <span style={{ width: 20, height: 20, flexShrink: 0 }} />
                  <span style={{ color: "#1a1d5e", fontSize: "0.87rem", fontWeight: 600 }}>{section.label}</span>
                </a>
              )}

              {/* Expanded children */}
              {hasChildren && isExpanded && (
                <div style={{ background: "#fef4f4", borderBottom: "1px solid rgba(26,29,94,0.07)" }}>
                  {section.children.map((child, ci) => (
                    <a
                      key={child.label}
                      href={child.href}
                      onClick={() => { setOpen(false); setExpandedSection(null); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "11px 18px 11px 48px",
                        textDecoration: "none",
                        borderBottom: ci < section.children.length - 1 ? "1px solid rgba(192,21,26,0.08)" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(192,21,26,0.06)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c0151a", flexShrink: 0 }} />
                      <span style={{ color: "#5a5a7a", fontSize: "0.84rem", fontWeight: 500 }}>{child.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </li>
  );
}

function OtherProgramsDropdown({
  active,
  onActivate,
}: {
  active: boolean;
  onActivate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const btnRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLLIElement>(null);

  const calcCoords = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({
        top: r.bottom + 4,
        left: r.left,
      });
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  return (
    <li
      ref={ref}
      style={{
        display: "flex",
        alignItems: "stretch",
        position: "relative",
      }}
    >
      <button
        ref={btnRef}
        onClick={() => {
          calcCoords();
          setOpen((p) => !p);
          onActivate();
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "0 13px",
          color:
            hovered || open
              ? "white"
              : "rgba(255,255,255,0.88)",
          background:
            hovered || open
              ? "rgba(255,255,255,0.12)"
              : "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontWeight: active ? 700 : 500,
          whiteSpace: "nowrap",
          position: "relative",
          transition: "all 0.2s",
          fontFamily: "'Source Sans 3', sans-serif",
        }}
      >
        Other Programs

        <span
          style={{
            fontSize: "0.55rem",
            transform: open
              ? "rotate(180deg)"
              : "rotate(0deg)",
            transition: "0.2s",
          }}
        >
          ▼
        </span>

        {active && (
          <span
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "#f5c842",
            }}
          />
        )}
      </button>

      <div
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          width: 300,
          background: "white",
          borderRadius: 10,
          boxShadow:
            "0 8px 32px rgba(26,29,94,0.18)",
          overflow: "hidden",
          zIndex: 9999,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transform: open
            ? "translateY(0)"
            : "translateY(-6px)",
          transition:
            "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
        {OTHER_PROGRAMS_MENU.map((section) => (
          <a
            key={section.label}
            href={section.href ?? "#"}
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 18px",
              textDecoration: "none",
              borderBottom: "1px solid rgba(26,29,94,0.07)",
              background: "white",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#fef4f4")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "white")
            }
          >
            <span
            >
            </span>

            <span
              style={{
                color: "#1a1d5e",
                fontSize: "0.87rem",
                fontWeight: 600,
              }}
            >
              {section.label}
            </span>
          </a>
        ))}
      </div>
    </li>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

export default function PesoNavbar({ onLoginClick, onRegisterClick }: { onLoginClick: () => void; onRegisterClick: () => void }) {
  const [activeLink, setActiveLink] = useState("HOME");
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, fontFamily: "'Source Sans 3', sans-serif", transition: "all 0.3s ease" }}>
        <div style={{ background: scrolled ? "rgba(192,21,26,0.97)" : "#c0151a", backdropFilter: scrolled ? "blur(10px)" : "none", boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.2)", transition: "all 0.3s ease" }}>
          <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", alignItems: "stretch", height: 58, padding: "0 16px", gap: 8 }}>
            {/* Logo */}
            <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", padding: isMobile ? "0 12px 0 4px" : "0 20px 0 4px", borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
              <img src={pesoLogo} alt="PESO" style={{ width: 40, height: 40, objectFit: "contain", display: "block", filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.35))" }} />
              <div>
                <div style={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: 1, lineHeight: 1.1 }}>P.E.S.O.</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.56rem", letterSpacing: 0.8, textTransform: "uppercase", lineHeight: 1, textAlign: "center" }}>Capiz</div>
              </div>
            </a>

            {/* Desktop nav */}
            {!isMobile && (
              <ul style={{ display: "flex", alignItems: "stretch", listStyle: "none", margin: 0, padding: 0, flex: 1, overflowX: "auto" }}>
                <NavItem href="#" label="HOME" active={activeLink === "HOME"} onClick={() => setActiveLink("HOME")} />

                {/* CORE SERVICES — flat accordion dropdown */}
                <CoreServicesDropdown active={activeLink === "Core Services"} onActivate={() => setActiveLink("Core Services")} />

                <DoleDropdown active={activeLink === "DOLE Programs Implemented"} onActivate={() => setActiveLink("DOLE Implemented Programs")} />

                <OtherProgramsDropdown
                  active={activeLink === "Other Programs"}
                  onActivate={() =>
                    setActiveLink("Other Programs")
                  }
                />

                <NavItem href="/contact" label="Contact Us" active={activeLink === "Contact Us"} onClick={() => setActiveLink("Contact Us")} />
              </ul>
            )}

            {isMobile && <div style={{ flex: 1 }} />}

            {/*
              Desktop Log In / Register buttons — hidden for now, not wired up
              to real pages yet. onLoginClick / onRegisterClick are still
              threaded through as props from PesoLanding, so uncomment this
              block whenever the login/register flow is ready to go live.

              {!isMobile && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 0 0 12px", borderLeft: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
                  <button onClick={onLoginClick} style={{ display: "flex", alignItems: "center", gap: 6, color: "white", background: "transparent", fontSize: "0.8rem", fontWeight: 600, padding: "6px 14px", borderRadius: 6, border: "1.5px solid rgba(255,255,255,0.45)", letterSpacing: 0.3, transition: "all 0.2s", whiteSpace: "nowrap", cursor: "pointer" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; }}>Log In</button>
                  <button onClick={onRegisterClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5c842", color: "#1a1d5e", border: "1.5px solid transparent", fontSize: "0.8rem", fontWeight: 800, padding: "6px 16px", borderRadius: 6, letterSpacing: 0.3, boxShadow: "0 2px 8px rgba(0,0,0,0.2)", transition: "all 0.2s", whiteSpace: "nowrap", cursor: "pointer" }} onMouseEnter={e => { e.currentTarget.style.background = "#ffe066"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.25)"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f5c842"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}>Register</button>
                </div>
              )}
            */}

            {/* Mobile hamburger */}
            {isMobile && (
              <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 8, width: 42, height: 42, alignSelf: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {[0, 1, 2].map(i => (<span key={i} style={{ display: "block", width: 20, height: 2, background: "white", borderRadius: 2 }} />))}
                </div>
              </button>
            )}
          </div>
        </div>
      </nav>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
    </>
  );
}