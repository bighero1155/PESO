import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../../auth/axiosInstance";

// ─── Types ───────────────────────────────────────────────────────────────────
interface JobPosting {
  job_id: number;
  job_title: string;
  company_name: string;
  company_logo: string | null;
  location: string;
  job_type: string;
  description: string;
  requirements: string;
  salary_range: string;
  contact_email: string;
  contact_number: string;
  status: "open" | "closed";
  deadline: string;
  created_at: string;
}

interface Applicant {
  application_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  contact_number?: string;
  resume_url?: string;
  cover_letter?: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  applied_at: string;
  avatar?: string;
}

// ─── PESO palette (mirrors peso.tsx exactly) ──────────────────────────────────
const C = {
  navy:    "#1a1d5e",
  red:     "#c0151a",
  gold:    "#e8a800",
  goldLight: "#f5c842",
  lightBg: "#f4f4f6",
  cream:   "#fdf8f0",
  white:   "#ffffff",
  muted:   "#5a5a7a",
  border:  "rgba(26,29,94,0.12)",
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<
  Applicant["status"],
  { label: string; textColor: string; bg: string; border: string; emoji: string }
> = {
  pending:     { label: "Pending",     textColor: "#7c4a00", bg: "#fff8e6", border: C.gold,    emoji: "⏳" },
  reviewed:    { label: "Reviewed",    textColor: C.navy,    bg: "#eef0ff", border: C.navy,    emoji: "👁️" },
  shortlisted: { label: "Shortlisted", textColor: "#145c3a", bg: "#e6f9f1", border: "#1a9c5e", emoji: "⭐" },
  rejected:    { label: "Rejected",    textColor: C.red,     bg: "#fff0f0", border: C.red,     emoji: "✕"  },
  hired:       { label: "Hired",       textColor: "#3d1f8c", bg: "#f3eeff", border: "#7c3aed", emoji: "🎉" },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const PageCSS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .jap-page { min-height: 100vh; background: ${C.cream}; font-family: 'Source Sans 3', sans-serif; }

    /* topbar — same red as PESO navbar */
    .jap-topbar {
      background: ${C.red}; height: 58px; padding: 0 24px;
      display: flex; align-items: center; gap: 14px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.18);
      position: sticky; top: 0; z-index: 50;
    }
    .jap-back-btn {
      display: inline-flex; align-items: center; gap: 7px;
      background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.35);
      color: white; padding: 7px 16px; border-radius: 7px;
      font-size: 0.82rem; font-weight: 600; font-family: 'Source Sans 3', sans-serif;
      cursor: pointer; transition: all 0.2s; white-space: nowrap;
    }
    .jap-back-btn:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.7); }
    .jap-topbar-title {
      color: white; font-family: 'Playfair Display', serif;
      font-size: 1.05rem; font-weight: 700; flex: 1;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    /* gold accent line — same as MarqueeBar background */
    .jap-gold-bar { background: ${C.gold}; height: 5px; }

    .jap-content { max-width: 1100px; margin: 0 auto; padding: 36px 24px 64px; }

    /* job header card — navy background like PESO footer/trivia */
    .jap-job-card {
      background: ${C.navy}; border-radius: 16px; padding: 28px 32px;
      margin-bottom: 28px; display: flex; gap: 22px;
      align-items: flex-start; flex-wrap: wrap;
      box-shadow: 0 8px 32px rgba(26,29,94,0.2);
      position: relative; overflow: hidden;
    }
    .jap-job-card::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0;
      height: 4px; background: linear-gradient(90deg, ${C.red}, ${C.gold});
    }
    .jap-job-logo {
      width: 72px; height: 72px; border-radius: 12px; object-fit: cover;
      flex-shrink: 0; border: 2px solid rgba(255,255,255,0.2);
    }
    .jap-job-logo-ph {
      width: 72px; height: 72px; border-radius: 12px; flex-shrink: 0;
      background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center; font-size: 2rem;
    }
    .jap-job-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.4rem, 3.5vw, 2rem); color: white;
      font-weight: 900; margin: 0 0 4px; line-height: 1.1;
    }
    .jap-job-company { color: rgba(255,255,255,0.6); font-size: 0.92rem; margin: 0 0 14px; }
    .jap-badges { display: flex; flex-wrap: wrap; gap: 8px; }
    .jap-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 12px; border-radius: 20px;
      font-size: 0.75rem; font-weight: 700; border-width: 1px; border-style: solid;
    }
    .jap-badge-open   { background: rgba(34,197,94,0.15);  color: #4ade80; border-color: rgba(34,197,94,0.35); }
    .jap-badge-closed { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); border-color: rgba(255,255,255,0.15); }
    .jap-badge-type   { background: rgba(232,168,0,0.15);  color: ${C.goldLight}; border-color: rgba(232,168,0,0.35); }
    .jap-badge-loc    { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.65); border-color: rgba(255,255,255,0.15); }
    .jap-badge-count  { background: rgba(255,255,255,0.1);  color: white; border-color: rgba(255,255,255,0.25); }

    /* stats — white cards like ServiceCardItem */
    .jap-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; }
    .jap-stat {
      flex: 1; min-width: 100px; background: white;
      border: 1.5px solid ${C.border}; border-radius: 12px;
      padding: 18px 14px; text-align: center;
      box-shadow: 0 2px 8px rgba(26,29,94,0.06); transition: box-shadow 0.2s;
    }
    .jap-stat:hover { box-shadow: 0 6px 20px rgba(26,29,94,0.1); }
    .jap-stat-num {
      font-family: 'Playfair Display', serif; font-size: 1.8rem;
      font-weight: 900; line-height: 1;
    }
    .jap-stat-label {
      font-size: 0.72rem; color: ${C.muted};
      text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-top: 4px;
    }

    /* section label / title — matches sectionLabel / sectionTitle in peso.tsx */
    .jap-section-label {
      display: inline-block; font-size: 0.72rem; font-weight: 700;
      letter-spacing: 4px; text-transform: uppercase; color: ${C.red}; margin-bottom: 6px;
    }
    .jap-section-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.4rem, 3vw, 1.9rem); color: ${C.navy}; margin: 0 0 24px;
    }

    /* tabs — white pill bar */
    .jap-tabs-wrap { margin-bottom: 20px; }
    .jap-tabs {
      display: inline-flex; gap: 4px; background: white;
      border: 1.5px solid ${C.border}; border-radius: 10px;
      padding: 4px; box-shadow: 0 2px 8px rgba(26,29,94,0.06); flex-wrap: wrap;
    }
    .jap-tab {
      padding: 9px 18px; border-radius: 7px; border: none;
      font-family: 'Source Sans 3', sans-serif; font-size: 0.82rem; font-weight: 600;
      color: ${C.muted}; background: transparent; cursor: pointer;
      transition: all 0.18s; white-space: nowrap;
    }
    .jap-tab:hover { color: ${C.navy}; background: ${C.lightBg}; }
    .jap-tab.active {
      background: ${C.navy}; color: white; font-weight: 700;
      box-shadow: 0 3px 10px rgba(26,29,94,0.22);
    }

    /* search */
    .jap-search-wrap { position: relative; margin-bottom: 24px; max-width: 460px; }
    .jap-search-icon {
      position: absolute; left: 13px; top: 50%;
      transform: translateY(-50%); font-size: 0.88rem; pointer-events: none;
    }
    .jap-search-input {
      width: 100%; padding: 11px 14px 11px 38px;
      border: 1.5px solid ${C.border}; border-radius: 10px;
      font-size: 0.9rem; color: ${C.navy}; background: white;
      font-family: 'Source Sans 3', sans-serif; outline: none;
      transition: border-color 0.2s; box-shadow: 0 2px 6px rgba(26,29,94,0.05);
    }
    .jap-search-input::placeholder { color: ${C.muted}; }
    .jap-search-input:focus { border-color: ${C.red}; }

    /* applicant grid */
    .jap-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; }

    /* card — white with red/gold hover bottom bar (like ServiceCardItem) */
    .jap-card {
      background: white; border: 1.5px solid ${C.border}; border-radius: 16px;
      padding: 24px 18px 18px; display: flex; flex-direction: column;
      align-items: center; text-align: center; cursor: pointer;
      transition: all 0.22s; box-shadow: 0 2px 8px rgba(26,29,94,0.06);
      position: relative; overflow: hidden;
    }
    .jap-card::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, ${C.red}, ${C.gold});
      transform: scaleX(0); transform-origin: left; transition: transform 0.25s ease;
    }
    .jap-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 36px rgba(26,29,94,0.12);
      border-color: rgba(26,29,94,0.22);
    }
    .jap-card:hover::after { transform: scaleX(1); }

    .jap-avatar {
      width: 72px; height: 72px; border-radius: 50%;
      border: 3px solid ${C.border}; display: flex; align-items: center;
      justify-content: center; font-size: 1.8rem; margin-bottom: 12px;
      background: ${C.lightBg}; overflow: hidden; flex-shrink: 0;
      transition: border-color 0.2s;
    }
    .jap-card:hover .jap-avatar { border-color: ${C.red}; }
    .jap-avatar img { width: 100%; height: 100%; object-fit: cover; }

    .jap-card-name { font-weight: 700; font-size: 0.95rem; color: ${C.navy}; margin: 0 0 3px; line-height: 1.3; }
    .jap-card-email { font-size: 0.74rem; color: ${C.muted}; margin: 0 0 12px; word-break: break-all; }
    .jap-status-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 12px; border-radius: 20px; font-size: 0.72rem; font-weight: 700;
      margin-bottom: 10px; border-width: 1px; border-style: solid;
    }
    .jap-card-date { font-size: 0.71rem; color: ${C.muted}; margin-top: auto; }

    /* empty */
    .jap-empty {
      grid-column: 1/-1; text-align: center; padding: 64px 24px;
      background: white; border-radius: 16px; border: 1.5px dashed ${C.border};
    }
    .jap-empty-icon { font-size: 3.5rem; margin-bottom: 16px; }
    .jap-empty h4 { color: ${C.navy}; font-size: 1.1rem; margin: 0 0 8px; font-family: 'Playfair Display', serif; }
    .jap-empty p  { color: ${C.muted}; font-size: 0.9rem; }

    /* modal */
    .jap-modal-backdrop {
      position: fixed; inset: 0; z-index: 4000;
      background: rgba(26,29,94,0.5); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 16px; animation: jap-fade 0.15s ease;
    }
    .jap-modal {
      background: white; border-radius: 20px; border: 2px solid ${C.navy};
      width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;
      animation: jap-up 0.22s cubic-bezier(0.34,1.4,0.64,1);
    }
    .jap-modal-hdr {
      background: ${C.navy}; border-radius: 18px 18px 0 0;
      padding: 22px 24px 18px; display: flex;
      align-items: flex-start; justify-content: space-between; gap: 12px;
      border-bottom: 3px solid ${C.gold};
    }
    .jap-modal-title { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 900; color: white; margin: 0 0 3px; }
    .jap-modal-sub   { font-size: 0.8rem; color: rgba(255,255,255,0.55); margin: 0; }
    .jap-modal-x {
      background: rgba(255,255,255,0.12); border: none; color: rgba(255,255,255,0.6);
      font-size: 1.1rem; width: 30px; height: 30px; border-radius: 7px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0;
    }
    .jap-modal-x:hover { background: rgba(255,255,255,0.22); color: white; }

    .jap-modal-body { padding: 24px; }
    .jap-modal-tabs {
      display: flex; gap: 4px; margin-bottom: 20px;
      background: ${C.lightBg}; border-radius: 9px; padding: 4px;
    }
    .jap-modal-tab {
      flex: 1; padding: 8px; border-radius: 6px; border: none;
      font-family: 'Source Sans 3', sans-serif; font-size: 0.82rem; font-weight: 600;
      color: ${C.muted}; background: transparent; cursor: pointer; transition: all 0.18s;
    }
    .jap-modal-tab.active { background: ${C.navy}; color: white; box-shadow: 0 2px 8px rgba(26,29,94,0.2); }

    .jap-detail-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .jap-detail-icon {
      width: 36px; height: 36px; border-radius: 9px;
      background: ${C.lightBg}; border: 1.5px solid ${C.border};
      display: flex; align-items: center; justify-content: center;
      font-size: 0.95rem; flex-shrink: 0;
    }
    .jap-detail-lbl { font-size: 0.7rem; font-weight: 700; color: ${C.muted}; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 2px; }
    .jap-detail-val { font-size: 0.9rem; color: ${C.navy}; margin: 0; word-break: break-word; font-weight: 500; }

    .jap-cover-box {
      background: ${C.lightBg}; border: 1.5px solid ${C.border};
      border-radius: 10px; padding: 14px 16px;
      font-size: 0.88rem; color: ${C.muted}; line-height: 1.75;
      max-height: 160px; overflow-y: auto;
    }
    .jap-resume-link {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 8px;
      background: ${C.lightBg}; color: ${C.navy};
      border: 1.5px solid ${C.border}; font-size: 0.82rem; font-weight: 700;
      text-decoration: none; transition: all 0.2s; margin-top: 4px;
    }
    .jap-resume-link:hover { background: ${C.navy}; color: white; border-color: ${C.navy}; }

    .jap-divider { border: none; border-top: 1.5px solid ${C.border}; }
    .jap-modal-footer { padding: 16px 24px 24px; display: flex; gap: 10px; flex-wrap: wrap; }

    /* buttons — red / navy / gold matching PESO CTA buttons */
    .jap-btn {
      flex: 1; min-width: 90px; padding: 10px 14px; border-radius: 8px; border: none;
      font-family: 'Source Sans 3', sans-serif; font-size: 0.82rem; font-weight: 700;
      cursor: pointer; transition: all 0.18s; display: flex;
      align-items: center; justify-content: center; gap: 6px;
    }
    .jap-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .jap-btn-shortlist { background: ${C.navy}; color: white; }
    .jap-btn-shortlist:hover:not(:disabled) { background: #12154a; transform: translateY(-1px); }
    .jap-btn-hire { background: ${C.gold}; color: ${C.navy}; }
    .jap-btn-hire:hover:not(:disabled) { background: ${C.goldLight}; transform: translateY(-1px); }
    .jap-btn-reject { background: #fff0f0; color: ${C.red}; border: 1.5px solid rgba(192,21,26,0.3) !important; }
    .jap-btn-reject:hover:not(:disabled) { background: #ffe0e0; }
    .jap-btn-close { background: ${C.lightBg}; color: ${C.muted}; border: 1.5px solid ${C.border} !important; }
    .jap-btn-close:hover { background: #e8e8f0; color: ${C.navy}; }

    /* loading */
    .jap-loading {
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 14px; background: ${C.cream};
    }
    .jap-spinner {
      width: 44px; height: 44px; border-radius: 50%;
      border: 3px solid ${C.border}; border-top-color: ${C.red};
      animation: jap-spin 0.7s linear infinite;
    }

    @keyframes jap-spin { to { transform: rotate(360deg); } }
    @keyframes jap-fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes jap-up {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    @media (max-width: 600px) {
      .jap-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
      .jap-job-card { padding: 20px 18px; }
      .jap-content { padding: 24px 16px 48px; }
      .jap-tabs { width: 100%; }
      .jap-tab { flex: 1; text-align: center; font-size: 0.75rem; padding: 8px 10px; }
    }
  `}</style>
);

// ─── Applicant Detail Modal ───────────────────────────────────────────────────
const ApplicantModal: React.FC<{
  applicant: Applicant;
  onClose: () => void;
  onStatusChange: (id: number, status: Applicant["status"]) => Promise<void>;
}> = ({ applicant, onClose, onStatusChange }) => {
  const [tab, setTab] = useState<"overview" | "cover">("overview");
  const [saving, setSaving] = useState(false);
  const cfg = STATUS_CFG[applicant.status];

  const fullName = [applicant.first_name, applicant.middle_name, applicant.last_name]
    .filter(Boolean).join(" ");

  const changeStatus = async (s: Applicant["status"]) => {
    setSaving(true);
    await onStatusChange(applicant.application_id, s);
    setSaving(false);
  };

  return (
    <div className="jap-modal-backdrop" onClick={onClose}>
      <div className="jap-modal" onClick={(e) => e.stopPropagation()}>

        <div className="jap-modal-hdr">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              className="jap-avatar"
              style={{ width: 50, height: 50, fontSize: "1.3rem", margin: 0,
                background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.2)" }}
            >
              {applicant.avatar ? <img src={applicant.avatar} alt={fullName} /> : "👤"}
            </div>
            <div>
              <p className="jap-modal-title">{fullName}</p>
              <p className="jap-modal-sub">
                Applied {new Date(applicant.applied_at).toLocaleDateString("en-PH", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          </div>
          <button className="jap-modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="jap-modal-body">
          {/* Current status */}
          <div style={{ marginBottom: 18 }}>
            <span
              className="jap-status-pill"
              style={{ background: cfg.bg, color: cfg.textColor, borderColor: cfg.border, fontSize: "0.82rem", padding: "5px 14px" }}
            >
              {cfg.emoji} {cfg.label}
            </span>
          </div>

          {/* Tabs (only show if cover letter exists) */}
          {applicant.cover_letter && (
            <div className="jap-modal-tabs">
              <button className={`jap-modal-tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
              <button className={`jap-modal-tab ${tab === "cover" ? "active" : ""}`} onClick={() => setTab("cover")}>Cover Letter</button>
            </div>
          )}

          {tab === "overview" && (
            <>
              <div className="jap-detail-row">
                <div className="jap-detail-icon">📧</div>
                <div>
                  <p className="jap-detail-lbl">Email</p>
                  <p className="jap-detail-val">{applicant.email}</p>
                </div>
              </div>
              {applicant.contact_number && (
                <div className="jap-detail-row">
                  <div className="jap-detail-icon">📞</div>
                  <div>
                    <p className="jap-detail-lbl">Contact Number</p>
                    <p className="jap-detail-val">{applicant.contact_number}</p>
                  </div>
                </div>
              )}
              {applicant.resume_url && (
                <div className="jap-detail-row">
                  <div className="jap-detail-icon">📄</div>
                  <div>
                    <p className="jap-detail-lbl">Resume</p>
                    <a href={applicant.resume_url} target="_blank" rel="noopener noreferrer" className="jap-resume-link">
                      📎 View Resume
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "cover" && applicant.cover_letter && (
            <>
              <p className="jap-detail-lbl" style={{ marginBottom: 8 }}>Cover Letter</p>
              <div className="jap-cover-box">{applicant.cover_letter}</div>
            </>
          )}
        </div>

        <hr className="jap-divider" />

        <div className="jap-modal-footer">
          {applicant.status !== "shortlisted" && applicant.status !== "hired" && (
            <button className="jap-btn jap-btn-shortlist" disabled={saving} onClick={() => changeStatus("shortlisted")}>
              ⭐ Shortlist
            </button>
          )}
          {applicant.status !== "hired" && (
            <button className="jap-btn jap-btn-hire" disabled={saving} onClick={() => changeStatus("hired")}>
              🎉 Hire
            </button>
          )}
          {applicant.status !== "rejected" && (
            <button className="jap-btn jap-btn-reject" disabled={saving} onClick={() => changeStatus("rejected")}>
              ✕ Reject
            </button>
          )}
          <button className="jap-btn jap-btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobPosting | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | Applicant["status"]>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Applicant | null>(null);

  const fetchData = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const [jobRes, appRes] = await Promise.all([
        AxiosInstance.get(`/job-postings/${jobId}`),
        AxiosInstance.get(`/job-postings/${jobId}/applications`),
      ]);
      setJob(jobRes.data);
      const raw = appRes.data;
      setApplicants(Array.isArray(raw) ? raw : raw?.data ?? []);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (applicationId: number, newStatus: Applicant["status"]) => {
    try {
      await AxiosInstance.patch(`/applications/${applicationId}/status`, { status: newStatus });
      setApplicants((prev) =>
        prev.map((a) => a.application_id === applicationId ? { ...a, status: newStatus } : a)
      );
      setSelected((prev) =>
        prev?.application_id === applicationId ? { ...prev, status: newStatus } : prev
      );
    } catch {
      alert("Failed to update status. Try again.");
    }
  };

  const stats = {
    total:       applicants.length,
    pending:     applicants.filter((a) => a.status === "pending").length,
    shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
    hired:       applicants.filter((a) => a.status === "hired").length,
    rejected:    applicants.filter((a) => a.status === "rejected").length,
  };

  const filtered = applicants.filter((a) => {
    const matchTab = activeTab === "all" || a.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      `${a.first_name} ${a.middle_name ?? ""} ${a.last_name}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  if (loading) {
    return (
      <div className="jap-loading">
        <PageCSS />
        <div className="jap-spinner" />
        <p style={{ color: C.muted, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600, fontSize: "0.9rem" }}>
          Loading applicants...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageCSS />
      <div className="jap-page">

        {/* Sticky top bar — PESO red */}
        <div className="jap-topbar">
          <button className="jap-back-btn" onClick={() => navigate("/employer/jobs")}>
            ← Back
          </button>
          <span className="jap-topbar-title">
            {job ? `${job.job_title} — Applicants` : "Applicants"}
          </span>
        </div>

        {/* Gold accent line */}
        <div className="jap-gold-bar" />

        <div className="jap-content">

          {/* Job header */}
          {job && (
            <div className="jap-job-card">
              {job.company_logo
                ? <img src={job.company_logo} alt={job.company_name} className="jap-job-logo" />
                : <div className="jap-job-logo-ph">🏢</div>
              }
              <div style={{ flex: 1, minWidth: 180 }}>
                <h1 className="jap-job-title">{job.job_title}</h1>
                <p className="jap-job-company">🏢 {job.company_name}</p>
                <div className="jap-badges">
                  <span className={`jap-badge ${job.status === "open" ? "jap-badge-open" : "jap-badge-closed"}`}>
                    {job.status === "open" ? "🟢 Open" : "⚫ Closed"}
                  </span>
                  <span className="jap-badge jap-badge-type">📋 {job.job_type}</span>
                  {job.location && <span className="jap-badge jap-badge-loc">📍 {job.location}</span>}
                  <span className="jap-badge jap-badge-count">
                    👥 {stats.total} applicant{stats.total !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="jap-stats">
            {[
              { num: stats.total,       label: "Total",       color: C.navy       },
              { num: stats.pending,     label: "Pending",     color: "#a06800"    },
              { num: stats.shortlisted, label: "Shortlisted", color: "#1a9c5e"    },
              { num: stats.hired,       label: "Hired",       color: "#7c3aed"    },
              { num: stats.rejected,    label: "Rejected",    color: C.red        },
            ].map((s) => (
              <div key={s.label} className="jap-stat">
                <div className="jap-stat-num" style={{ color: s.color }}>{s.num}</div>
                <div className="jap-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Heading */}
          <span className="jap-section-label">Manage Applications</span>
          <h2 className="jap-section-title">All Applicants</h2>

          {/* Tabs */}
          <div className="jap-tabs-wrap">
            <div className="jap-tabs">
              {([
                { key: "all",         label: "All"         },
                { key: "pending",     label: "⏳ Pending"     },
                { key: "shortlisted", label: "⭐ Shortlisted" },
                { key: "hired",       label: "🎉 Hired"       },
                { key: "rejected",    label: "✕ Rejected"    },
              ] as const).map(({ key, label }) => (
                <button key={key} className={`jap-tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="jap-search-wrap">
            <span className="jap-search-icon">🔍</span>
            <input
              className="jap-search-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Grid */}
          <div className="jap-grid">
            {filtered.length === 0 ? (
              <div className="jap-empty">
                <div className="jap-empty-icon">{applicants.length === 0 ? "📭" : "🔎"}</div>
                <h4>
                  {applicants.length === 0
                    ? "No applicants yet"
                    : search ? `No results for "${search}"` : `No ${activeTab} applicants`}
                </h4>
                <p>
                  {applicants.length === 0
                    ? "Applicants will appear here once people apply for this job."
                    : "Try a different filter or search term."}
                </p>
              </div>
            ) : (
              filtered.map((applicant) => {
                const cfg = STATUS_CFG[applicant.status];
                const fullName = [applicant.first_name, applicant.middle_name, applicant.last_name]
                  .filter(Boolean).join(" ");
                return (
                  <div key={applicant.application_id} className="jap-card" onClick={() => setSelected(applicant)}>
                    <div className="jap-avatar">
                      {applicant.avatar ? <img src={applicant.avatar} alt={fullName} /> : "👤"}
                    </div>
                    <p className="jap-card-name">{fullName}</p>
                    <p className="jap-card-email">{applicant.email}</p>
                    <span className="jap-status-pill" style={{ background: cfg.bg, color: cfg.textColor, borderColor: cfg.border }}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    <p className="jap-card-date">
                      {new Date(applicant.applied_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {selected && (
          <ApplicantModal
            applicant={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </>
  );
}