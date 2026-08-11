import { useState, useEffect } from "react";
import AxiosInstance from "../../auth/axiosInstance";
import Sidebar from "../Sidebar";

interface Application {
  application_id: number;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  cover_letter: string | null;
  resume_url: string | null;
  applied_at: string;
  job: {
    job_id: number;
    job_title: string;
    company_name: string;
    company_logo: string | null;
    location: string;
    job_type: string;
    salary_range: string;
    status: "open" | "closed";
  } | null;
}

const C = {
  navy: "#1a1d5e", red: "#c0151a", gold: "#e8a800",
  goldLight: "#f5c842", lightBg: "#f4f4f6", cream: "#fdf8f0",
  muted: "#5a5a7a", border: "rgba(26,29,94,0.12)",
};

const STATUS_CFG = {
  pending:     { label: "Pending",     emoji: "⏳", textColor: "#7c4a00", bg: "#fff8e6", border: C.gold      },
  reviewed:    { label: "Reviewed",    emoji: "👁️", textColor: C.navy,    bg: "#eef0ff", border: C.navy      },
  shortlisted: { label: "Shortlisted", emoji: "⭐", textColor: "#145c3a", bg: "#e6f9f1", border: "#1a9c5e"   },
  rejected:    { label: "Rejected",    emoji: "✕",  textColor: C.red,     bg: "#fff0f0", border: C.red       },
  hired:       { label: "Hired",       emoji: "🎉", textColor: "#3d1f8c", bg: "#f3eeff", border: "#7c3aed"   },
};

const STATUS_MESSAGES = {
  pending:     "Your application is waiting to be reviewed by the employer.",
  reviewed:    "The employer has reviewed your application.",
  shortlisted: "Great news! You've been shortlisted. Expect to hear from the employer soon.",
  rejected:    "Unfortunately, you were not selected for this position.",
  hired:       "Congratulations! You've been hired for this position!",
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | Application["status"]>("all");
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    AxiosInstance.get("/my-applications")
      .then(res => setApplications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── NEW: withdraw handler ─────────────────────────────────────────────────
  const handleWithdraw = async (applicationId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening the modal
    if (!confirm("Withdraw this application? This cannot be undone.")) return;
    try {
      await AxiosInstance.delete(`/my-applications/${applicationId}`);
      setApplications(prev => prev.filter(a => a.application_id !== applicationId));
      setSelected(null); // close modal if open
    } catch {
      alert("Failed to withdraw application. Please try again.");
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const stats = {
    total:       applications.length,
    pending:     applications.filter(a => a.status === "pending").length,
    shortlisted: applications.filter(a => a.status === "shortlisted").length,
    hired:       applications.filter(a => a.status === "hired").length,
    rejected:    applications.filter(a => a.status === "rejected").length,
  };

  const filtered = activeTab === "all"
    ? applications
    : applications.filter(a => a.status === activeTab);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />

      <div style={{ display: "flex", minHeight: "100vh", background: C.cream, fontFamily: "'Source Sans 3', sans-serif" }}>
        <Sidebar />

        <div style={{ marginLeft: 260, flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Header */}
          <div style={{ background: C.navy, padding: "32px 32px 28px", borderBottom: `4px solid ${C.gold}` }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.gold, display: "block", marginBottom: 6 }}>
              My Applications
            </span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 4px" }}>
              Application Tracker
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: "0.9rem" }}>
              Track the status of all your job applications
            </p>
          </div>

          <div style={{ padding: "28px 32px", flex: 1 }}>

            {/* Stats */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              {[
                { num: stats.total,       label: "Total",       color: C.navy    },
                { num: stats.pending,     label: "Pending",     color: "#a06800" },
                { num: stats.shortlisted, label: "Shortlisted", color: "#1a9c5e" },
                { num: stats.hired,       label: "Hired",       color: "#7c3aed" },
                { num: stats.rejected,    label: "Rejected",    color: C.red     },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, minWidth: 100, background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 14px", textAlign: "center", boxShadow: "0 2px 8px rgba(26,29,94,0.06)" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontSize: "0.72rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "inline-flex", gap: 4, background: "white", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 4, flexWrap: "wrap" }}>
                {([
                  { key: "all",         label: "All"            },
                  { key: "pending",     label: "⏳ Pending"      },
                  { key: "shortlisted", label: "⭐ Shortlisted"  },
                  { key: "hired",       label: "🎉 Hired"        },
                  { key: "rejected",    label: "✕ Rejected"     },
                ] as const).map(({ key, label }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    style={{ padding: "9px 18px", borderRadius: 7, border: "none", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", background: activeTab === key ? C.navy : "transparent", color: activeTab === key ? "white" : C.muted, boxShadow: activeTab === key ? "0 3px 10px rgba(26,29,94,0.22)" : "none", transition: "all 0.18s" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications List */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: C.muted }}>Loading your applications...</div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", background: "white", borderRadius: 16, border: `1.5px dashed ${C.border}` }}>
                <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>📭</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: C.navy, marginBottom: 8 }}>No applications yet</h3>
                <p style={{ color: C.muted, fontSize: "0.9rem" }}>Browse available jobs and start applying!</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 16, border: `1.5px dashed ${C.border}` }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔎</div>
                <p style={{ color: C.muted, fontSize: "0.9rem" }}>No {activeTab} applications.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {filtered.map(app => {
                  const cfg = STATUS_CFG[app.status];
                  return (
                    <div key={app.application_id}
                      onClick={() => setSelected(app)}
                      style={{ background: "white", borderRadius: 14, border: `1.5px solid ${C.border}`, padding: "20px 24px", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,29,94,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      {/* Left accent by status */}
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: cfg.border, borderRadius: "14px 0 0 14px" }} />

                      {/* Company Logo */}
                      <div style={{ width: 56, height: 56, borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.lightBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0, overflow: "hidden", marginLeft: 8 }}>
                        {app.job?.company_logo
                          ? <img src={app.job.company_logo} alt={app.job?.company_name ?? "Company"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : "🏢"}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", color: C.navy, fontSize: "1.05rem", margin: "0 0 3px" }}>
                          {app.job?.job_title ?? "Position Unavailable"}
                        </h3>
                        <p style={{ color: C.muted, fontSize: "0.83rem", margin: "0 0 8px" }}>
                          🏢 {app.job?.company_name ?? "Unknown Company"}
                          {app.job?.location && <> · 📍 {app.job.location}</>}
                          {app.job?.salary_range && <> · 💰 {app.job.salary_range}</>}
                        </p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {app.job?.job_type && (
                            <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: "0.7rem", fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                              {app.job.job_type}
                            </span>
                          )}
                          {app.job ? (
                            <span style={{ background: app.job.status === "open" ? "#dcfce7" : "#f1f5f9", color: app.job.status === "open" ? "#16a34a" : "#64748b", fontSize: "0.7rem", fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                              {app.job.status === "open" ? "🟢 Open" : "⚫ Closed"}
                            </span>
                          ) : (
                            <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.7rem", fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                              ⚫ Job Removed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status + Date + NEW: Withdraw button */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, background: cfg.bg, color: cfg.textColor, border: `1px solid ${cfg.border}` }}>
                          {cfg.emoji} {cfg.label}
                        </span>
                        <span style={{ fontSize: "0.73rem", color: C.muted }}>
                          Applied {new Date(app.applied_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span style={{ fontSize: "0.73rem", color: C.red, fontWeight: 700 }}>View details →</span>
                        {/* ── NEW ── */}
                        {app.status !== "hired" && (
                          <button
                            onClick={(e) => handleWithdraw(app.application_id, e)}
                            style={{ fontSize: "0.72rem", color: "white", fontWeight: 700, background: C.red, border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit", marginTop: 2 }}
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <ApplicationDetailModal
          app={selected}
          onClose={() => setSelected(null)}
          onWithdraw={handleWithdraw}
        />
      )}
    </>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function ApplicationDetailModal({
  app,
  onClose,
  onWithdraw, // ── NEW prop
}: {
  app: Application;
  onClose: () => void;
  onWithdraw: (applicationId: number, e: React.MouseEvent) => void; // ── NEW prop
}) {
  const [tab, setTab] = useState<"status" | "cover">("status");
  const cfg = STATUS_CFG[app.status];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 4000, background: "rgba(26,29,94,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, border: `2px solid ${C.navy}`, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ background: C.navy, borderRadius: "18px 18px 0 0", padding: "22px 24px 18px", borderBottom: `3px solid ${C.gold}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0, overflow: "hidden" }}>
              {app.job?.company_logo
                ? <img src={app.job.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : "🏢"}
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 900, color: "white", margin: "0 0 2px" }}>
                {app.job?.job_title ?? "Position Unavailable"}
              </p>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", margin: 0 }}>
                {app.job?.company_name ?? "Unknown Company"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", width: 30, height: 30, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Tabs */}
        {app.cover_letter && (
          <div style={{ display: "flex", gap: 4, padding: "14px 24px 0", background: "white" }}>
            {(["status", "cover"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: "9px", borderRadius: "7px 7px 0 0", border: "none", background: tab === t ? C.lightBg : "transparent", color: tab === t ? C.navy : C.muted, fontWeight: tab === t ? 700 : 600, fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit" }}>
                {t === "status" ? "📊 Status" : "📝 Cover Letter"}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: "20px 24px 28px", background: C.lightBg, borderRadius: "0 0 18px 18px" }}>

          {tab === "status" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Current status banner */}
              <div style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 12, padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{cfg.emoji}</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: cfg.textColor, fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>{cfg.label}</div>
                <p style={{ color: cfg.textColor, fontSize: "0.88rem", opacity: 0.85, margin: 0, lineHeight: 1.6 }}>{STATUS_MESSAGES[app.status]}</p>
              </div>

              {/* Application details */}
              {[
                { icon: "💼", label: "Job Type",   val: app.job?.job_type ?? "N/A" },
                { icon: "📍", label: "Location",   val: app.job?.location || "Not specified" },
                { icon: "💰", label: "Salary",     val: app.job?.salary_range || "Not specified" },
                { icon: "📅", label: "Applied On", val: new Date(app.applied_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ display: "flex", gap: 12, alignItems: "center", background: "white", borderRadius: 10, padding: "12px 14px", border: `1.5px solid ${C.border}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: C.lightBg, border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ fontSize: "0.68rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 1px" }}>{label}</p>
                    <p style={{ fontSize: "0.88rem", color: C.navy, margin: 0, fontWeight: 500 }}>{val}</p>
                  </div>
                </div>
              ))}

              {/* Resume link */}
              {app.resume_url && (
                <a href={app.resume_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, background: "white", borderRadius: 10, padding: "12px 14px", border: `1.5px solid ${C.border}`, textDecoration: "none", color: C.navy, fontWeight: 600, fontSize: "0.88rem", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = C.navy; }}
                >
                  <span style={{ fontSize: "1.1rem" }}>📄</span>
                  View My Resume / CV
                </a>
              )}

              {/* ── NEW: Withdraw button inside modal ── */}
              {app.status !== "hired" && (
                <button
                  onClick={(e) => onWithdraw(app.application_id, e)}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, background: C.red, color: "white", border: "none", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  🗑️ Withdraw Application
                </button>
              )}

            </div>
          )}

          {tab === "cover" && app.cover_letter && (
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 10px" }}>Your Cover Letter</p>
              <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", fontSize: "0.88rem", color: "#374151", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                {app.cover_letter}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}