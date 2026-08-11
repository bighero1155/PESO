import { useState, useEffect } from "react";
import AxiosInstance from "../../auth/axiosInstance";
import Sidebar from "../Sidebar";

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
  deadline: string;
  status: "open" | "closed";
  created_at: string;
}

const C = {
  navy: "#1a1d5e", red: "#c0151a", gold: "#e8a800",
  goldLight: "#f5c842", lightBg: "#f4f4f6", cream: "#fdf8f0",
  muted: "#5a5a7a", border: "rgba(26,29,94,0.12)",
};

export default function ApplicantJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selected, setSelected] = useState<JobPosting | null>(null);

  useEffect(() => {
    AxiosInstance.get("/job-postings")
      .then(res => setJobs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const JOB_TYPES = ["all", "full-time", "part-time", "contract", "internship", "temporary"];

  const filtered = jobs.filter(j => {
    const matchType = filterType === "all" || j.job_type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      j.job_title.toLowerCase().includes(q) ||
      j.company_name.toLowerCase().includes(q) ||
      (j.location ?? "").toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />

      <div style={{ display: "flex", minHeight: "100vh", background: C.cream, fontFamily: "'Source Sans 3', sans-serif" }}>
        <Sidebar />

        <div style={{ marginLeft: 260, flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Header */}
          <div style={{ background: C.navy, padding: "32px 32px 28px", borderBottom: `4px solid ${C.gold}` }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.gold, display: "block", marginBottom: 6 }}>
              Opportunities
            </span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 4px" }}>
              Available Jobs
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: "0.9rem" }}>
              {jobs.length} open position{jobs.length !== 1 ? "s" : ""} — click any card to apply
            </p>
          </div>

          <div style={{ padding: "28px 32px", flex: 1 }}>

            {/* Search + Filter */}
            <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: "0.88rem", pointerEvents: "none" }}>🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by title, company, or location..."
                  style={{ width: "100%", padding: "11px 14px 11px 36px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: "0.9rem", color: C.navy, background: "white", outline: "none", fontFamily: "inherit" }}
                />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {JOB_TYPES.map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    style={{ padding: "10px 16px", borderRadius: 8, border: filterType === t ? "none" : `1.5px solid ${C.border}`, background: filterType === t ? C.navy : "white", color: filterType === t ? "white" : C.muted, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit" }}>
                    {t === "all" ? "All Types" : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Grid */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: C.muted }}>Loading jobs...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
                <p style={{ color: C.muted, fontSize: "1rem" }}>No jobs found. Try a different search.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                {filtered.map(job => (
                  <JobCard key={job.job_id} job={job} onClick={() => setSelected(job)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <ApplyModal job={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

// ── Job Card ──────────────────────────────────────────────────────────────────
function JobCard({ job, onClick }: { job: JobPosting; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white", borderRadius: 16, border: `1.5px solid ${C.border}`,
        padding: "24px 22px", cursor: "pointer", position: "relative", overflow: "hidden",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 36px rgba(26,29,94,0.12)" : "0 2px 8px rgba(26,29,94,0.06)",
        transition: "all 0.22s",
      }}
    >
      {/* Bottom accent bar on hover */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.red}, ${C.gold})`, transform: hovered ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 0.25s ease" }} />

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.lightBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0, overflow: "hidden" }}>
          {job.company_logo ? <img src={job.company_logo} alt={job.company_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🏢"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: C.navy, fontSize: "1.05rem", margin: "0 0 3px", lineHeight: 1.3 }}>{job.job_title}</h3>
          <p style={{ color: C.muted, fontSize: "0.82rem", margin: 0 }}>{job.company_name}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{job.job_type}</span>
        {job.location && <span style={{ background: C.lightBg, color: C.muted, fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>📍 {job.location}</span>}
        {job.salary_range && <span style={{ background: "rgba(232,168,0,0.12)", color: "#7c5200", fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>💰 {job.salary_range}</span>}
      </div>

      <p style={{ color: "#374151", fontSize: "0.85rem", lineHeight: 1.6, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {job.description}
      </p>

      {job.deadline && (
        <p style={{ color: C.muted, fontSize: "0.75rem", margin: "0 0 14px" }}>
          ⏳ Deadline: {new Date(job.deadline).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>🟢 Open</span>
        <span style={{ color: C.red, fontSize: "0.78rem", fontWeight: 700 }}>Apply Now →</span>
      </div>
    </div>
  );
}

// ── Apply Modal ───────────────────────────────────────────────────────────────
function ApplyModal({ job, onClose }: { job: JobPosting; onClose: () => void }) {
  const [tab, setTab] = useState<"details" | "apply">("details");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await AxiosInstance.post(`/job-postings/${job.job_id}/applications`, {
        cover_letter: coverLetter,
        resume_url: resumeUrl || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 4000, background: "rgba(26,29,94,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, border: `2px solid ${C.navy}`, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>

        {/* Modal header */}
        <div style={{ background: C.navy, borderRadius: "18px 18px 0 0", padding: "22px 24px 18px", borderBottom: `3px solid ${C.gold}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0, overflow: "hidden" }}>
              {job.company_logo ? <img src={job.company_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🏢"}
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 900, color: "white", margin: "0 0 2px" }}>{job.job_title}</p>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", margin: 0 }}>{job.company_name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", width: 30, height: 30, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: "16px 24px 0", background: "white" }}>
          {(["details", "apply"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: "10px", borderRadius: "8px 8px 0 0", border: "none", background: tab === t ? C.lightBg : "transparent", color: tab === t ? C.navy : C.muted, fontWeight: tab === t ? 700 : 600, fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
              {t === "details" ? "📋 Job Details" : "📝 Apply Now"}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 24px 28px", background: C.lightBg, borderRadius: "0 0 18px 18px" }}>

          {/* Details tab */}
          {tab === "details" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "📍", label: "Location", val: job.location || "Not specified" },
                { icon: "💼", label: "Job Type", val: job.job_type },
                { icon: "💰", label: "Salary", val: job.salary_range || "Not specified" },
                { icon: "📧", label: "Contact Email", val: job.contact_email || "Not specified" },
                { icon: "⏳", label: "Deadline", val: job.deadline ? new Date(job.deadline).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "Not specified" },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "white", border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 2px" }}>{label}</p>
                    <p style={{ fontSize: "0.9rem", color: C.navy, margin: 0, fontWeight: 500 }}>{val}</p>
                  </div>
                </div>
              ))}

              {job.description && (
                <div>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 8px" }}>Description</p>
                  <p style={{ fontSize: "0.88rem", color: "#374151", lineHeight: 1.75, margin: 0, background: "white", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${C.border}` }}>{job.description}</p>
                </div>
              )}

              {job.requirements && (
                <div>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 8px" }}>Requirements</p>
                  <p style={{ fontSize: "0.88rem", color: "#374151", lineHeight: 1.75, margin: 0, background: "white", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${C.border}` }}>{job.requirements}</p>
                </div>
              )}

              <button onClick={() => setTab("apply")}
                style={{ marginTop: 8, padding: "13px", borderRadius: 10, border: "none", background: C.red, color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", fontFamily: "inherit" }}>
                Proceed to Apply →
              </button>
            </div>
          )}

          {/* Apply tab */}
          {tab === "apply" && (
            <div>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🎉</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", color: C.navy, fontSize: "1.3rem", marginBottom: 8 }}>Application Submitted!</h3>
                  <p style={{ color: C.muted, fontSize: "0.9rem", marginBottom: 24 }}>The employer will review your application and get back to you.</p>
                  <button onClick={onClose}
                    style={{ padding: "11px 28px", borderRadius: 8, border: "none", background: C.navy, color: "white", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    Close
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {error && (
                    <div style={{ background: "#fff0f0", color: C.red, border: `1.5px solid ${C.red}`, borderRadius: 8, padding: "12px 16px", fontSize: "0.88rem", fontWeight: 600 }}>
                      {error}
                    </div>
                  )}

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: C.navy, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Resume / CV Link
                    </label>
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={e => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/your-resume"
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: "0.9rem", color: C.navy, background: "white", outline: "none", fontFamily: "inherit" }}
                    />
                    <p style={{ color: C.muted, fontSize: "0.75rem", marginTop: 5 }}>Paste a link to your resume (Google Drive, Dropbox, etc.)</p>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: C.navy, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Cover Letter <span style={{ color: C.muted, fontWeight: 400, textTransform: "none", fontSize: "0.75rem" }}>(optional)</span>
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={e => setCoverLetter(e.target.value)}
                      rows={6}
                      placeholder="Tell the employer why you're a great fit for this role..."
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: "0.88rem", color: C.navy, background: "white", outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.65 }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setTab("details")}
                      style={{ flex: 1, padding: "12px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: "white", color: C.muted, fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", fontFamily: "inherit" }}>
                      ← Back
                    </button>
                    <button onClick={handleApply} disabled={submitting}
                      style={{ flex: 2, padding: "12px", borderRadius: 8, border: "none", background: submitting ? C.muted : C.red, color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
                      {submitting ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}