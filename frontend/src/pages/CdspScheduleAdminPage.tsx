import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import axios from "../auth/axiosInstance";
import Navbar from "../components/Navbar";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CdspSchedule {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  start: string;
  end: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  color: string;
}

interface FormState {
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  status: CdspSchedule["status"];
  color: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PESO_NAVY = "#1a1d5e";
const PESO_RED  = "#c0151a";
const PESO_GOLD = "#e8a800";

const EMPTY_FORM: FormState = {
  title:          "",
  description:    "",
  location:       "",
  start_datetime: "",
  end_datetime:   "",
  status:         "upcoming",
  color:          PESO_NAVY,
};

const COLOR_PRESETS = [
  { label: "Navy",   value: "#1a1d5e" },
  { label: "Red",    value: "#c0151a" },
  { label: "Gold",   value: "#e8a800" },
  { label: "Green",  value: "#15803d" },
  { label: "Blue",   value: "#0369a1" },
  { label: "Purple", value: "#7c3aed" },
];

const STATUS_OPTS: { value: CdspSchedule["status"]; label: string }[] = [
  { value: "upcoming",  label: "Upcoming"  },
  { value: "ongoing",   label: "Ongoing"   },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  upcoming:  { bg: "#eff6ff", color: "#1d4ed8" },
  ongoing:   { bg: "#f0fdf4", color: "#15803d" },
  completed: { bg: "#f4f4f6", color: "#64748b" },
  cancelled: { bg: "#fff1f2", color: "#c0151a" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// Convert ISO string → datetime-local input value
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Format for display
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", {
    weekday: "short", month: "short", day: "numeric",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)",
        }}
      />
      <div style={{
        position: "fixed", inset: 0, zIndex: 1001,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, overflowY: "auto",
      }}>
        <div style={{
          background: "white", borderRadius: 16, width: "100%", maxWidth: 540,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          overflow: "hidden", animation: "modalIn 0.2s ease",
          maxHeight: "90vh", display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            background: PESO_NAVY, padding: "18px 24px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexShrink: 0,
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              color: "white", fontSize: "1.15rem", margin: 0,
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "50%", width: 32, height: 32,
                color: "white", cursor: "pointer", fontSize: "1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>
          {/* Body */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Schedule Form ─────────────────────────────────────────────────────────────

function ScheduleForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  errors,
}: {
  initial: FormState;
  onSubmit: (form: FormState) => void;
  onCancel: () => void;
  submitting: boolean;
  errors: Record<string, string[]>;
}) {
  const [form, setForm] = useState<FormState>(initial);

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1.5px solid #e2e8f0", fontSize: "0.92rem",
    fontFamily: "'Source Sans 3', sans-serif",
    outline: "none", boxSizing: "border-box",
    color: "#1e293b",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.75rem", fontWeight: 700,
    color: "#64748b", letterSpacing: 1, textTransform: "uppercase",
    marginBottom: 6,
  };

  const fieldErr = (field: string) =>
    errors[field]?.[0] ? (
      <p style={{ color: PESO_RED, fontSize: "0.78rem", margin: "4px 0 0" }}>
        {errors[field][0]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            style={inputStyle}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Resume Writing Workshop"
            required
          />
          {fieldErr("title")}
        </div>

        {/* Start / End */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Start *</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={form.start_datetime}
              onChange={(e) => set("start_datetime", e.target.value)}
              required
            />
            {fieldErr("start_datetime")}
          </div>
          <div>
            <label style={labelStyle}>End *</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={form.end_datetime}
              onChange={(e) => set("end_datetime", e.target.value)}
              required
            />
            {fieldErr("end_datetime")}
          </div>
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>Location</label>
          <input
            style={inputStyle}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. PESO Capiz Office, Room 208"
          />
        </div>

        {/* Status */}
        <div>
          <label style={labelStyle}>Status</label>
          <select
            style={{ ...inputStyle, background: "white" }}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            {STATUS_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label style={labelStyle}>Calendar Color</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => set("color", c.value)}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: c.value, border: "none", cursor: "pointer",
                  boxShadow: form.color === c.value
                    ? `0 0 0 3px white, 0 0 0 5px ${c.value}`
                    : "0 1px 4px rgba(0,0,0,0.2)",
                  transition: "box-shadow 0.15s",
                }}
              />
            ))}
            {/* Custom hex input */}
            <input
              type="color"
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
              style={{ width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0 }}
              title="Custom color"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Brief description of the event..."
          />
        </div>

      </div>

      {/* Footer */}
      <div style={{
        padding: "16px 24px", borderTop: "1px solid #f0f0f4",
        display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: "transparent", border: "1.5px solid #e2e8f0",
            borderRadius: 8, padding: "10px 20px",
            fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", color: "#64748b",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            background: submitting ? "#94a3b8" : PESO_NAVY,
            border: "none", borderRadius: 8,
            padding: "10px 24px", color: "white",
            fontSize: "0.88rem", fontWeight: 700,
            cursor: submitting ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {submitting ? "Saving..." : "Save Schedule"}
        </button>
      </div>
    </form>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function DetailModal({
  schedule,
  onEdit,
  onDelete,
  onClose,
  deleting,
}: {
  schedule: CdspSchedule;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  deleting: boolean;
}) {
  const badge = STATUS_BADGE[schedule.status] ?? STATUS_BADGE.upcoming;

  return (
    <Modal title="Schedule Details" onClose={onClose}>
      <div style={{ padding: 24 }}>
        {/* Color strip */}
        <div style={{
          background: schedule.color, borderRadius: 10,
          padding: "16px 20px", marginBottom: 20,
        }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px" }}>
            CDSP Event
          </p>
          <h3 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", margin: 0 }}>
            {schedule.title}
          </h3>
        </div>

        {/* Status */}
        <span style={{
          display: "inline-block",
          background: badge.bg, color: badge.color,
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1,
          textTransform: "uppercase", padding: "4px 12px",
          borderRadius: 20, marginBottom: 20,
        }}>
          {schedule.status}
        </span>

        {/* Fields */}
        {[
          { label: "📅 Start",    value: fmtDate(schedule.start)    },
          { label: "🏁 End",      value: fmtDate(schedule.end)      },
          { label: "📍 Location", value: schedule.location ?? "—"   },
        ].map(({ label, value }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 3px" }}>{label}</p>
            <p style={{ fontSize: "0.95rem", color: "#1e293b", margin: 0, fontWeight: 500 }}>{value}</p>
          </div>
        ))}

        {schedule.description && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 3px" }}>📝 Description</p>
            <p style={{ fontSize: "0.92rem", color: "#1e293b", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{schedule.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: "16px 24px", borderTop: "1px solid #f0f0f4",
        display: "flex", gap: 10, justifyContent: "flex-end",
      }}>
        <button
          onClick={onDelete}
          disabled={deleting}
          style={{
            background: deleting ? "#f4f4f6" : "#fff1f2",
            color: deleting ? "#94a3b8" : PESO_RED,
            border: `1.5px solid ${deleting ? "#e2e8f0" : "#fecdd3"}`,
            borderRadius: 8, padding: "10px 20px",
            fontSize: "0.88rem", fontWeight: 700,
            cursor: deleting ? "not-allowed" : "pointer",
          }}
        >
          {deleting ? "Deleting..." : "🗑 Delete"}
        </button>
        <button
          onClick={onEdit}
          style={{
            background: PESO_NAVY, color: "white",
            border: "none", borderRadius: 8,
            padding: "10px 24px",
            fontSize: "0.88rem", fontWeight: 700, cursor: "pointer",
          }}
        >
          ✏️ Edit
        </button>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const CdspScheduleAdminPage: React.FC = () => {
  const [schedules, setSchedules]     = useState<CdspSchedule[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // Modal state
  const [showCreate, setShowCreate]   = useState(false);
  const [editTarget, setEditTarget]   = useState<CdspSchedule | null>(null);
  const [viewTarget, setViewTarget]   = useState<CdspSchedule | null>(null);

  // Form state
  const [submitting, setSubmitting]   = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [formErrors, setFormErrors]   = useState<Record<string, string[]>>({});
  const [createDefault, setCreateDefault] = useState<FormState>(EMPTY_FORM);

  const calendarRef = useRef<FullCalendar>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchSchedules = async () => {
    try {
      const res = await axios.get("/cdsp-schedules");
      setSchedules(res.data);
    } catch {
      setError("Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  // Clicking an empty date pre-fills start date
  const handleDateClick = (arg: DateClickArg) => {
    const d       = new Date(arg.date);
    const end     = new Date(d.getTime() + 60 * 60 * 1000); // +1hr
    const toLocal = (dt: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    };
    setCreateDefault({
      ...EMPTY_FORM,
      start_datetime: toLocal(d),
      end_datetime:   toLocal(end),
    });
    setShowCreate(true);
  };

  // Clicking an existing event opens detail modal
  const handleEventClick = (arg: EventClickArg) => {
    const found = schedules.find((s) => String(s.id) === arg.event.id);
    if (found) { setViewTarget(found); }
  };

  // Create
  const handleCreate = async (form: FormState) => {
    setSubmitting(true);
    setFormErrors({});
    try {
      const res = await axios.post("/cdsp-schedules", form);
      setSchedules((prev) => [...prev, res.data.schedule]);
      setShowCreate(false);
      setCreateDefault(EMPTY_FORM);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { errors?: Record<string, string[]> } } }).response?.data?.errors
      ) {
        setFormErrors(
          (err as { response: { data: { errors: Record<string, string[]> } } })
            .response.data.errors
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Update
  const handleUpdate = async (form: FormState) => {
    if (!editTarget) return;
    setSubmitting(true);
    setFormErrors({});
    try {
      const res = await axios.put(`/cdsp-schedules/${editTarget.id}`, form);
      setSchedules((prev) =>
        prev.map((s) => (s.id === editTarget.id ? res.data.schedule : s))
      );
      setEditTarget(null);
      setViewTarget(null);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { errors?: Record<string, string[]> } } }).response?.data?.errors
      ) {
        setFormErrors(
          (err as { response: { data: { errors: Record<string, string[]> } } })
            .response.data.errors
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!viewTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/cdsp-schedules/${viewTarget.id}`);
      setSchedules((prev) => prev.filter((s) => s.id !== viewTarget.id));
      setViewTarget(null);
    } catch {
      // keep modal open on error
    } finally {
      setDeleting(false);
    }
  };

  // ── Calendar Events ─────────────────────────────────────────────────────────

  const events = schedules.map((s) => ({
    id:    String(s.id),
    title: s.title,
    start: s.start,
    end:   s.end,
    color: s.color,
    classNames: s.status === "cancelled" || s.status === "completed"
      ? ["fc-event-dimmed"]
      : [],
  }));

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Navbar />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .fc .fc-toolbar-title {
          font-family: 'Playfair Display', serif !important;
          color: ${PESO_NAVY} !important;
          font-size: 1.3rem !important;
        }
        .fc .fc-button-primary {
          background-color: ${PESO_NAVY} !important;
          border-color: ${PESO_NAVY} !important;
          font-family: 'Source Sans 3', sans-serif !important;
          font-weight: 600 !important;
        }
        .fc .fc-button-primary:hover {
          background-color: ${PESO_RED} !important;
          border-color: ${PESO_RED} !important;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: ${PESO_RED} !important;
          border-color: ${PESO_RED} !important;
        }
        .fc .fc-daygrid-day.fc-day-today {
          background-color: rgba(232,168,0,0.08) !important;
        }
        .fc .fc-col-header-cell {
          background: ${PESO_NAVY} !important;
          color: white !important;
          font-family: 'Source Sans 3', sans-serif !important;
          font-weight: 700 !important;
          font-size: 0.8rem !important;
          letter-spacing: 1px !important;
          text-transform: uppercase !important;
          padding: 10px 0 !important;
        }
        .fc .fc-col-header-cell a { color: white !important; }
        .fc-event {
          cursor: pointer !important;
          border: none !important;
          border-radius: 6px !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          padding: 2px 6px !important;
        }
        .fc-event:hover { filter: brightness(1.12) !important; }
        .fc-event-dimmed { opacity: 0.45 !important; }
        .fc .fc-daygrid-day:not(.fc-day-other) { cursor: pointer; }
        .fc .fc-daygrid-day:not(.fc-day-other):hover {
          background: rgba(26,29,94,0.04) !important;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#f4f4f6",
        fontFamily: "'Source Sans 3', sans-serif",
      }}>

        {/* ── Page Header ── */}
        <div style={{
          background: PESO_NAVY,
          padding: "28px 32px",
          borderBottom: `4px solid ${PESO_GOLD}`,
        }}>
          <div style={{
            maxWidth: 1200, margin: "0 auto",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <p style={{
                color: PESO_GOLD, fontSize: "0.72rem", fontWeight: 700,
                letterSpacing: 3, textTransform: "uppercase", margin: "0 0 4px",
              }}>
                P.E.S.O. Admin Portal
              </p>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                color: "white", fontSize: "1.8rem", margin: 0,
              }}>
                CDSP Schedule Manager
              </h1>
              <p style={{
                color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", margin: "4px 0 0",
              }}>
                Click any date to add a schedule. Click an event to view, edit, or delete.
              </p>
            </div>
            <button
              onClick={() => { setCreateDefault(EMPTY_FORM); setShowCreate(true); }}
              style={{
                background: PESO_GOLD, color: PESO_NAVY,
                border: "none", borderRadius: 8,
                padding: "12px 24px", fontWeight: 800,
                fontSize: "0.9rem", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 2px 12px rgba(232,168,0,0.4)",
              }}
            >
              ＋ Add Schedule
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{
                width: 44, height: 44,
                border: `4px solid ${PESO_NAVY}`,
                borderTopColor: PESO_GOLD,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }} />
              <p style={{ color: PESO_NAVY, fontWeight: 600 }}>Loading schedules...</p>
            </div>
          )}

          {error && (
            <div style={{
              background: "#fff1f2", border: `1.5px solid ${PESO_RED}`,
              color: PESO_RED, borderRadius: 10,
              padding: "14px 20px", fontWeight: 600, marginBottom: 24,
            }}>
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Upcoming list summary */}
              {schedules.filter((s) => s.status === "upcoming").length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{
                    fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8",
                    letterSpacing: 2, textTransform: "uppercase", marginBottom: 10,
                  }}>
                    Upcoming ({schedules.filter((s) => s.status === "upcoming").length})
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {schedules
                      .filter((s) => s.status === "upcoming")
                      .slice(0, 4)
                      .map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setViewTarget(s)}
                          style={{
                            background: "white", borderRadius: 10,
                            padding: "12px 16px",
                            borderLeft: `4px solid ${s.color}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            cursor: "pointer", minWidth: 200, flex: "1 1 200px",
                            maxWidth: 280,
                            transition: "box-shadow 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)")}
                          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}
                        >
                          <p style={{ fontWeight: 700, color: PESO_NAVY, fontSize: "0.9rem", margin: "0 0 4px" }}>
                            {s.title}
                          </p>
                          <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0 }}>
                            {fmtDate(s.start)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Calendar */}
              <div style={{
                background: "white", borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                padding: 24, overflow: "hidden",
              }}>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left:   "prev,next today",
                    center: "title",
                    right:  "dayGridMonth,timeGridWeek",
                  }}
                  events={events}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  height="auto"
                  editable={false}
                  selectable
                  dayMaxEvents={3}
                  nowIndicator
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <Modal
          title="Add New Schedule"
          onClose={() => { setShowCreate(false); setFormErrors({}); }}
        >
          <ScheduleForm
            initial={createDefault}
            onSubmit={handleCreate}
            onCancel={() => { setShowCreate(false); setFormErrors({}); }}
            submitting={submitting}
            errors={formErrors}
          />
        </Modal>
      )}

      {/* ── Detail Modal ── */}
      {viewTarget && !editTarget && (
        <DetailModal
          schedule={viewTarget}
          onEdit={() => setEditTarget(viewTarget)}
          onDelete={handleDelete}
          onClose={() => setViewTarget(null)}
          deleting={deleting}
        />
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <Modal
          title="Edit Schedule"
          onClose={() => { setEditTarget(null); setFormErrors({}); }}
        >
          <ScheduleForm
            initial={{
              title:          editTarget.title,
              description:    editTarget.description ?? "",
              location:       editTarget.location ?? "",
              start_datetime: toLocalInput(editTarget.start),
              end_datetime:   toLocalInput(editTarget.end),
              status:         editTarget.status,
              color:          editTarget.color,
            }}
            onSubmit={handleUpdate}
            onCancel={() => { setEditTarget(null); setFormErrors({}); }}
            submitting={submitting}
            errors={formErrors}
          />
        </Modal>
      )}
    </>
  );
};

export default CdspScheduleAdminPage;