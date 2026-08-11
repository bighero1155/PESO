import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import AxiosInstance from "../../auth/axiosInstance";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";

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

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "temporary"];

const emptyForm = {
  job_title: "",
  company_name: "",
  location: "",
  job_type: "full-time",
  description: "",
  requirements: "",
  salary_range: "",
  contact_email: "",
  contact_number: "",
  status: "open",
  deadline: "",
};

export default function EmployerJobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchJobs = async () => {
    try {
      const res = await AxiosInstance.get(`/job-postings?employer_id=${user?.user_id}`);
      setJobs(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) fetchJobs();
  }, [user?.user_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditingJob(null);
    setForm(emptyForm);
    setLogoFile(null);
    setLogoPreview(null);
    setErrors({});
    setMessage(null);
    setShowForm(true);
  };

  const openEdit = (job: JobPosting) => {
    setEditingJob(job);
    setForm({
      job_title: job.job_title,
      company_name: job.company_name,
      location: job.location ?? "",
      job_type: job.job_type,
      description: job.description,
      requirements: job.requirements ?? "",
      salary_range: job.salary_range ?? "",
      contact_email: job.contact_email ?? "",
      contact_number: job.contact_number ?? "",
      status: job.status,
      deadline: job.deadline ?? "",
    });
    setLogoFile(null);
    setLogoPreview(job.company_logo ?? null);
    setErrors({});
    setMessage(null);
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: [] });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (logoFile) formData.append("company_logo", logoFile);

    try {
      if (editingJob) {
        formData.append("_method", "PUT");
        await AxiosInstance.post(`/job-postings/${editingJob.job_id}/update`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage({ type: "success", text: "Job updated successfully!" });
      } else {
        await AxiosInstance.post("/job-postings", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage({ type: "success", text: "Job posted successfully!" });
      }
      await fetchJobs();
      setTimeout(() => {
        setShowForm(false);
        setMessage(null);
      }, 1200);
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
        setMessage({ type: "error", text: "Please fix the errors below." });
      } else {
        setMessage({ type: "error", text: "Something went wrong. Try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (job_id: number) => {
    try {
      await AxiosInstance.delete(`/job-postings/${job_id}`);
      setJobs(jobs.filter((j) => j.job_id !== job_id));
      setDeleteConfirm(null);
    } catch {
      alert("Failed to delete. Try again.");
    }
  };

  const colors = {
    navy: "#1a1d5e",
    red: "#c0151a",
    gold: "#e8a800",
    lightBg: "#f4f4f6",
    white: "#ffffff",
    muted: "#5a5a7a",
    border: "rgba(26,29,94,0.12)",
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", background: colors.lightBg, paddingTop: 72 }}>

        {/* Header */}
        <div style={{ background: colors.navy, padding: "32px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", margin: 0 }}>Job Postings</h1>
              <p style={{ color: "rgba(255,255,255,0.6)", margin: "4px 0 0", fontSize: "0.9rem" }}>
                Manage your job listings — {jobs.filter(j => j.status === "open").length} open, {jobs.filter(j => j.status === "closed").length} closed
              </p>
            </div>
            <button onClick={openCreate}
              style={{ background: colors.gold, color: colors.navy, border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              + Post New Job
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

          {/* Job list */}
          {loading ? (
            <p style={{ color: colors.muted, textAlign: "center", marginTop: 48 }}>Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 80 }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>📋</div>
              <p style={{ color: colors.muted, fontSize: "1.1rem" }}>No job postings yet.</p>
              <button onClick={openCreate}
                style={{ marginTop: 16, background: colors.red, color: "white", border: "none", padding: "12px 28px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                Post Your First Job
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {jobs.map((job) => (
                <div
                  key={job.job_id}
                  onClick={() => navigate(`/employer/jobs/${job.job_id}/applicants`)}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    border: `1.5px solid ${colors.border}`,
                    padding: "24px 28px",
                    display: "flex",
                    gap: 20,
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,29,94,0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Company logo */}
                  <div style={{ flexShrink: 0 }}>
                    {job.company_logo ? (
                      <img src={job.company_logo} alt={job.company_name}
                        style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: `2px solid ${colors.border}` }} />
                    ) : (
                      <div style={{ width: 110, height: 110, borderRadius: "50%", background: colors.lightBg, border: `2px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>
                        🏢
                      </div>
                    )}
                  </div>

                  {/* Status dot */}
                  <div style={{ flexShrink: 0, marginTop: 4 }}>
                    <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: job.status === "open" ? "#22c55e" : "#94a3b8" }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                      <h3 style={{ color: colors.navy, fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{job.job_title}</h3>
                      <span style={{ background: job.status === "open" ? "#dcfce7" : "#f1f5f9", color: job.status === "open" ? "#16a34a" : "#64748b", fontSize: "0.72rem", fontWeight: 700, padding: "2px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                        {job.status}
                      </span>
                      <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: "0.72rem", fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
                        {job.job_type}
                      </span>
                    </div>
                    <p style={{ color: colors.muted, fontSize: "0.9rem", margin: "0 0 8px" }}>
                      🏢 {job.company_name}
                      {job.location && <> · 📍 {job.location}</>}
                      {job.salary_range && <> · 💰 {job.salary_range}</>}
                    </p>
                    <p style={{ color: "#374151", fontSize: "0.88rem", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {job.description}
                    </p>
                    {job.deadline && (
                      <p style={{ color: colors.muted, fontSize: "0.78rem", marginTop: 8 }}>
                        ⏳ Deadline: {new Date(job.deadline).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    )}

                    {/* Click hint */}
                    <p style={{ color: colors.red, fontSize: "0.75rem", fontWeight: 700, marginTop: 10, letterSpacing: 0.3 }}>
                      👥 Click to view applicants →
                    </p>
                  </div>

                  {/* Actions — stopPropagation so card click doesn't fire */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(job); }}
                      style={{ background: colors.navy, color: "white", border: "none", padding: "8px 18px", borderRadius: 6, fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(job.job_id); }}
                      style={{ background: "#fff1f2", color: colors.red, border: `1.5px solid ${colors.red}`, padding: "8px 18px", borderRadius: 6, fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirm Modal */}
        {deleteConfirm !== null && (
          <div onClick={() => setDeleteConfirm(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ background: "white", borderRadius: 16, padding: "32px 28px", maxWidth: 400, width: "100%", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
              <h3 style={{ color: colors.navy, marginBottom: 8 }}>Delete this job posting?</h3>
              <p style={{ color: colors.muted, fontSize: "0.9rem", marginBottom: 24 }}>This action cannot be undone.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={() => setDeleteConfirm(null)}
                  style={{ padding: "10px 24px", borderRadius: 8, border: `1.5px solid ${colors.border}`, background: "white", fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: colors.red, color: "white", fontWeight: 700, cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Form Modal */}
        {showForm && (
          <div onClick={() => setShowForm(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", border: `3px solid ${colors.navy}` }}>

              {/* Modal header */}
              <div style={{ background: colors.navy, padding: "24px 28px", borderRadius: "17px 17px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", margin: 0 }}>
                  {editingJob ? "Edit Job Posting" : "Post a New Job"}
                </h2>
                <button onClick={() => setShowForm(false)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: "1.4rem", cursor: "pointer", lineHeight: 1 }}>×</button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
                {message && (
                  <div style={{ background: message.type === "success" ? "#dcfce7" : "#fff1f2", color: message.type === "success" ? "#16a34a" : colors.red, border: `1.5px solid currentColor`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: "0.88rem", fontWeight: 600 }}>
                    {message.text}
                  </div>
                )}

                {/* Company Logo Upload */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Company Logo</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 12, border: `1.5px dashed rgba(26,29,94,0.3)`, background: colors.lightBg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "1.8rem" }}>🏢</span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        style={{ padding: "8px 16px", borderRadius: 7, border: `1.5px solid rgba(26,29,94,0.25)`, background: "white", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", color: colors.navy }}>
                        {logoPreview ? "Change Logo" : "Upload Logo"}
                      </button>
                      {logoPreview && (
                        <button type="button" onClick={removeLogo}
                          style={{ padding: "8px 16px", borderRadius: 7, border: `1.5px solid ${colors.red}`, background: "#fff1f2", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", color: colors.red }}>
                          Remove
                        </button>
                      )}
                      <span style={{ fontSize: "0.75rem", color: colors.muted }}>JPG, PNG, WEBP · max 2MB</span>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange} style={{ display: "none" }} />
                  </div>
                  {errors.company_logo?.[0] && <div style={errorStyle}>{errors.company_logo[0]}</div>}
                </div>

                {/* Row 1 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <Field label="Job Title *" name="job_title" value={form.job_title} onChange={handleChange} error={errors.job_title?.[0]} />
                  <Field label="Company Name *" name="company_name" value={form.company_name} onChange={handleChange} error={errors.company_name?.[0]} />
                </div>

                {/* Row 2 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <Field label="Location" name="location" value={form.location} onChange={handleChange} error={errors.location?.[0]} placeholder="e.g. Roxas City, Capiz" />
                  <div>
                    <label style={labelStyle}>Job Type *</label>
                    <select name="job_type" value={form.job_type} onChange={handleChange} style={inputStyle}>
                      {JOB_TYPES.map((t) => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Job Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                    placeholder="Describe the role, responsibilities, and expectations..."
                    style={{ ...inputStyle, resize: "vertical" }} />
                  {errors.description?.[0] && <div style={errorStyle}>{errors.description[0]}</div>}
                </div>

                {/* Requirements */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Requirements</label>
                  <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3}
                    placeholder="List qualifications, skills, experience needed..."
                    style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                {/* Row 3 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <Field label="Salary Range" name="salary_range" value={form.salary_range} onChange={handleChange} placeholder="e.g. ₱15,000 – ₱20,000/mo" />
                  <Field label="Application Deadline" name="deadline" value={form.deadline} onChange={handleChange} type="date" />
                </div>

                {/* Row 4 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <Field label="Contact Email" name="contact_email" value={form.contact_email} onChange={handleChange} type="email" error={errors.contact_email?.[0]} />
                  <Field label="Contact Number" name="contact_number" value={form.contact_number} onChange={handleChange} placeholder="e.g. 09XX-XXX-XXXX" />
                </div>

                {/* Status (edit only) */}
                {editingJob && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Status</label>
                    <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ padding: "11px 24px", borderRadius: 8, border: `1.5px solid ${colors.border}`, background: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    style={{ padding: "11px 28px", borderRadius: 8, border: "none", background: colors.navy, color: "white", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontSize: "0.9rem", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "Saving..." : editingJob ? "Save Changes" : "Post Job"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1a1d5e",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1.5px solid rgba(26,29,94,0.2)",
  borderRadius: 8, fontSize: "0.92rem", color: "#111", background: "white",
  outline: "none", fontFamily: "inherit",
};

const errorStyle: React.CSSProperties = {
  color: "#c0151a", fontSize: "0.78rem", marginTop: 4, fontWeight: 600,
};

function Field({ label, name, value, onChange, error, type = "text", placeholder }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        style={{ ...inputStyle, borderColor: error ? "#c0151a" : "rgba(26,29,94,0.2)" }} />
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
}