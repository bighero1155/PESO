import { useState, useEffect, useRef } from "react";
import pesoLogo from "/assets/peso-logo.png";
import EmailVerificationGate from '../../email/Emailverificationgate';
import {
  JOBFAIR_SCHEDULES_JOB_FAIRS,
  JOBFAIR_SCHEDULES_JOB_LISTINGS,
  JOBFAIR_SCHEDULES_EDUCATION_LEVELS,
  JOBFAIR_SCHEDULES_DEGREE_OPTIONS,
  JOBFAIR_SCHEDULES_GENDER_OPTIONS,
  JOBFAIR_SCHEDULES_CIVIL_OPTIONS,
  JOBFAIR_SCHEDULES_DISABILITY_OPTIONS,
  JOBFAIR_SCHEDULES_EMPLOYMENT_OPTIONS,
  JOBFAIR_SCHEDULES_OFW_OPTIONS,
  JOBFAIR_SCHEDULES_FOURPS_OPTIONS,
  JOBFAIR_SCHEDULES_LANGUAGE_OPTIONS,
  FAIR_PLACEHOLDER_COLORS,
  JOBFAIR_SCHEDULES_SUBMIT_URL,
  isApplicationClosed,
  formatDeadline,
  getTimeRemaining,
  type JobFairSchedulesFormState,
  type JobFairSchedulesJobFair,
} from "./Jobfairschedules";

export interface JobFairSchedulesDesignProps {
  form: JobFairSchedulesFormState;
  issues: string[];
  attempted: boolean;
  submitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  isMobile: boolean;
  formTopRef: React.RefObject<HTMLDivElement | null>;
  emailVerified: boolean;
  onUpdateForm: (patch: Partial<JobFairSchedulesFormState>) => void;
  onToggleLanguage: (lang: string) => void;
  onSelectFair: (fair: { id: string; name: string; date: string; time: string; venue: string }) => void;
  onBackToFairs: () => void;
  onEmailVerified: (email: string, token: string) => void;
  onChangeEmail: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onNavigateHome: () => void;
  onRegisterAnother: () => void;
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const COLORS = {
  red:       "#c0151a",
  redHover:  "#a01015",
  navy:      "#1a1d5e",
  gold:      "#f5c842",
  green:     "#3fae5a",
  greenText: "#2f8a48",
  bodyText:  "#5a5a7a",
  mutedText: "#9a9ab0",
};

const inputBorder = "1.5px solid rgba(26,29,94,0.15)";

const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "10px 14px",
  borderRadius: 8,
  border:       inputBorder,
  fontSize:     "0.92rem",
  fontFamily:   "'Source Sans 3', sans-serif",
  color:        COLORS.navy,
  outline:      "none",
  background:   "white",
};

const labelCaps: React.CSSProperties = {
  display:       "inline-block",
  fontSize:      "0.72rem",
  fontWeight:    700,
  letterSpacing: 4,
  textTransform: "uppercase",
  color:         COLORS.red,
  marginBottom:  10,
};

const pageHeading: React.CSSProperties = {
  fontFamily:   "'Playfair Display', serif",
  fontSize:     "clamp(1.6rem, 4vw, 2.2rem)",
  color:        COLORS.navy,
  marginBottom: 8,
};

const pageSubtext: React.CSSProperties = {
  color:        COLORS.bodyText,
  fontSize:     "0.95rem",
  lineHeight:   1.65,
  marginBottom: 28,
  maxWidth:     520,
};

const primaryBtn = (disabled: boolean): React.CSSProperties => ({
  marginTop:     8,
  alignSelf:     "flex-start",
  display:       "flex",
  alignItems:    "center",
  gap:           10,
  background:    disabled ? "#ccc" : COLORS.red,
  color:         "white",
  border:        "none",
  padding:       "13px 32px",
  borderRadius:  8,
  fontWeight:    700,
  fontSize:      "0.95rem",
  cursor:        disabled ? "not-allowed" : "pointer",
  boxShadow:     disabled ? "none" : "0 4px 16px rgba(192,21,26,0.3)",
  transition:    "background 0.2s",
  letterSpacing: 0.3,
  fontFamily:    "'Source Sans 3', sans-serif",
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function fieldInputStyle(hasError: boolean): React.CSSProperties {
  return { ...inputStyle, border: hasError ? "1.5px solid #c0151a" : inputBorder };
}

function Field({
  label, required, hint, style, error, children,
}: {
  label: string; required?: boolean; hint?: string;
  style?: React.CSSProperties; error?: string; children: React.ReactNode;
}) {
  return (
    <div style={style}>
      <label style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: COLORS.navy, fontSize: "0.85rem", fontWeight: 700 }}>
          {label}{required && <span style={{ color: COLORS.red }}> *</span>}
        </span>
        {hint && <span style={{ color: COLORS.mutedText, fontSize: "0.74rem" }}>{hint}</span>}
      </label>
      {children}
      {error && <p style={{ color: COLORS.red, fontSize: "0.78rem", marginTop: 5, marginBottom: 0 }}>{error}</p>}
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0 -4px" }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.red, whiteSpace: "nowrap" }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(26,29,94,0.1)" }} />
    </div>
  );
}

function ConsentBox({ checked, onChange, highlightError }: {
  checked: boolean; onChange: (v: boolean) => void; highlightError: boolean;
}) {
  return (
    <div style={{ background: "rgba(26,29,94,0.03)", border: `1.5px solid ${highlightError ? COLORS.red : "rgba(26,29,94,0.12)"}`, borderRadius: 10, padding: "16px 18px", transition: "border-color 0.2s" }}>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: COLORS.red, cursor: "pointer", marginTop: 2, flexShrink: 0 }}
        />
        <span style={{ color: COLORS.navy, fontSize: "0.85rem", lineHeight: 1.65 }}>
          This is to certify that all data/information that I have provided in this form are true
          to the best of my knowledge. This is also to authorize PESO to include my profile in the
          PESO Employment Information System and use my personal information for employment
          facilitation in accordance with R.A. No. 10173 of 2012. I am also aware that PESO is
          not obliged to seek employment on my behalf.
          <span style={{ color: COLORS.red }}> *</span>
        </span>
      </label>
      {highlightError && (
        <p style={{ color: COLORS.red, fontSize: "0.8rem", marginTop: 8, marginBottom: 0, marginLeft: 30 }}>
          Please check this box to continue.
        </p>
      )}
    </div>
  );
}

// ── ScrollSelect ──────────────────────────────────────────────────────────────

interface ScrollSelectProps {
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  hasError?: boolean;
  visibleRows?: number;
}

function ScrollSelect({ value, placeholder, options, onChange, hasError = false, visibleRows = 6 }: ScrollSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find(o => o.value === value)?.label ?? "";
  const ROW_HEIGHT = 40;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const idx  = options.findIndex(o => o.value === value);
        const next = e.key === "ArrowDown" ? Math.min(idx + 1, options.length - 1) : Math.max(idx - 1, 0);
        if (options[next]) onChange(options[next].value);
      }
      if (e.key === "Enter") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown",   onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, options, value, onChange]);

  const triggerStyle: React.CSSProperties = {
    ...inputStyle,
    border:         hasError ? "1.5px solid #c0151a" : open ? `1.5px solid ${COLORS.navy}` : inputBorder,
    cursor:         "pointer",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    userSelect:     "none",
    transition:     "border-color 0.15s",
    boxSizing:      "border-box",
  };

  const panelStyle: React.CSSProperties = {
    position:     "absolute",
    top:          "calc(100% + 4px)",
    left:         0,
    right:        0,
    background:   "white",
    border:       `1.5px solid ${COLORS.navy}`,
    borderRadius: 8,
    boxShadow:    "0 8px 24px rgba(26,29,94,0.13)",
    zIndex:       999,
    overflowY:    "auto",
    maxHeight:    `${ROW_HEIGHT * visibleRows}px`,
    animation:    "expandDown 0.15s ease both",
  };

  const optionStyle = (isSel: boolean, isHov: boolean): React.CSSProperties => ({
    padding:      "0 14px",
    height:       ROW_HEIGHT,
    display:      "flex",
    alignItems:   "center",
    fontSize:     "0.92rem",
    fontFamily:   "'Source Sans 3', sans-serif",
    color:        isSel ? COLORS.red : COLORS.navy,
    fontWeight:   isSel ? 700 : 400,
    background:   isSel ? "rgba(192,21,26,0.05)" : isHov ? "rgba(26,29,94,0.04)" : "transparent",
    cursor:       "pointer",
    transition:   "background 0.1s",
    boxSizing:    "border-box",
    borderBottom: "1px solid rgba(26,29,94,0.05)",
  });

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div
        style={triggerStyle}
        onClick={() => setOpen(v => !v)}
        tabIndex={0}
        onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setOpen(v => !v); } }}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span style={{ color: selectedLabel ? COLORS.navy : COLORS.mutedText, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedLabel || placeholder}
        </span>
        <span style={{ marginLeft: 8, fontSize: "0.7rem", color: COLORS.mutedText, flexShrink: 0, transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none", display: "inline-block" }}>▼</span>
      </div>
      {open && (
        <div style={panelStyle} role="listbox">
          {options.map(opt => (
            <HoverOption key={opt.value} label={opt.label} isSelected={opt.value === value} style={optionStyle} onClick={() => { onChange(opt.value); setOpen(false); }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── DegreeCombobox ────────────────────────────────────────────────────────────

interface DegreeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

function DegreeCombobox({ value, onChange, hasError = false }: DegreeComboboxProps) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [ownMode, setOwnMode] = useState(false);
  const [ownText, setOwnText] = useState("");
  const containerRef          = useRef<HTMLDivElement>(null);
  const searchRef             = useRef<HTMLInputElement>(null);
  const ownInputRef           = useRef<HTMLInputElement>(null);

  const ROW_HEIGHT = 40;
  const VISIBLE    = 6;

  useEffect(() => {
    if (value && !JOBFAIR_SCHEDULES_DEGREE_OPTIONS.includes(value)) {
      setOwnMode(true);
      setOwnText(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = query.trim()
    ? JOBFAIR_SCHEDULES_DEGREE_OPTIONS.filter(d => d.toLowerCase().includes(query.toLowerCase()))
    : JOBFAIR_SCHEDULES_DEGREE_OPTIONS;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        if (ownMode && ownText.trim()) onChange(ownText.trim());
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, ownMode, ownText, onChange]);

  const openPanel = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const pick = (val: string) => {
    onChange(val);
    setOwnMode(false);
    setOwnText("");
    setOpen(false);
  };

  const commitOwn = () => {
    if (ownText.trim()) {
      onChange(ownText.trim());
      setOpen(false);
    }
  };

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setOwnText("");
    setOwnMode(false);
  };

  const triggerStyle: React.CSSProperties = {
    ...inputStyle,
    border: hasError
      ? "1.5px solid #c0151a"
      : open
        ? `1.5px solid ${COLORS.navy}`
        : inputBorder,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    userSelect: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const panelStyle: React.CSSProperties = {
    position:     "absolute",
    top:          "calc(100% + 4px)",
    left:         0,
    right:        0,
    background:   "white",
    border:       `1.5px solid ${COLORS.navy}`,
    borderRadius: 8,
    boxShadow:    "0 8px 24px rgba(26,29,94,0.13)",
    zIndex:       999,
    overflow:     "hidden",
    animation:    "expandDown 0.15s ease both",
  };

  const optStyle = (sel: boolean, hov: boolean): React.CSSProperties => ({
    padding:      "0 14px",
    height:       ROW_HEIGHT,
    display:      "flex",
    alignItems:   "center",
    fontSize:     "0.92rem",
    fontFamily:   "'Source Sans 3', sans-serif",
    color:        sel ? COLORS.red : COLORS.navy,
    fontWeight:   sel ? 700 : 400,
    background:   sel ? "rgba(192,21,26,0.05)" : hov ? "rgba(26,29,94,0.04)" : "transparent",
    cursor:       "pointer",
    borderBottom: "1px solid rgba(26,29,94,0.05)",
    boxSizing:    "border-box",
  });

  const isPreset = JOBFAIR_SCHEDULES_DEGREE_OPTIONS.includes(value);
  const hasValue = !!value.trim();

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger */}
      <div
        style={triggerStyle}
        onClick={() => { if (open) { setOpen(false); } else { openPanel(); } }}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (open) { setOpen(false); } else { openPanel(); } }
        }}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span style={{ color: hasValue ? COLORS.navy : COLORS.mutedText, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {hasValue ? value : "e.g. BS Information Technology"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {hasValue && (
            <span onClick={clearValue} title="Clear" style={{ fontSize: "0.72rem", color: COLORS.mutedText, cursor: "pointer", lineHeight: 1, padding: "2px 4px" }}>✕</span>
          )}
          <span style={{ fontSize: "0.7rem", color: COLORS.mutedText, display: "inline-block", transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
        </span>
      </div>

      {/* Confirmation badge */}
      {hasValue && (
        <p style={{ fontSize: "0.76rem", color: COLORS.greenText, fontWeight: 600, margin: "5px 0 0", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 7, height: 7, background: COLORS.green, borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
          {isPreset ? value : `Custom: ${value}`}
        </p>
      )}

      {/* Dropdown panel */}
      {open && (
        <div style={panelStyle}>
          {/* Search */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(26,29,94,0.08)" }}>
            <input
              ref={searchRef}
              style={{ ...inputStyle, background: "#f8f7fc", fontSize: "0.88rem", padding: "7px 10px" }}
              placeholder="Search courses…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Options list */}
          <div style={{ maxHeight: `${ROW_HEIGHT * VISIBLE}px`, overflowY: "auto" }}>
            {filtered.length > 0
              ? filtered.map(d => (
                  <HoverOption key={d} label={d} isSelected={d === value} style={optStyle} onClick={() => pick(d)} />
                ))
              : <p style={{ padding: "12px 14px", color: COLORS.mutedText, fontSize: "0.84rem", margin: 0 }}>No matches — use "Type my own" below.</p>
            }
          </div>

          {/* Others / type your own */}
          <div style={{ borderTop: "1.5px dashed rgba(26,29,94,0.12)" }}>
            <button
              type="button"
              onClick={() => { setOwnMode(v => !v); if (!ownMode) setTimeout(() => ownInputRef.current?.focus(), 50); }}
              style={{ width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 9, background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif", textAlign: "left", transition: "background 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,29,94,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(192,21,26,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", flexShrink: 0 }}>✏️</span>
              <span style={{ color: COLORS.navy, fontWeight: 700, fontSize: "0.88rem" }}>Others</span>
              <span style={{ color: COLORS.mutedText, fontSize: "0.78rem", marginLeft: 2 }}>Not in the list?</span>
            </button>
            {ownMode && (
              <div style={{ padding: "0 10px 10px", animation: "expandDown 0.14s ease both" }}>
                <input
                  ref={ownInputRef}
                  style={{ ...inputStyle, border: "1.5px solid rgba(192,21,26,0.4)", background: "rgba(192,21,26,0.03)", fontSize: "0.9rem" }}
                  placeholder="e.g. BS Geodetic Engineering"
                  value={ownText}
                  onChange={e => { const val = e.target.value.toUpperCase(); setOwnText(val); onChange(val); }}
                  onKeyDown={e => { if (e.key === "Enter") commitOwn(); }}
                />
                <p style={{ fontSize: "0.74rem", color: COLORS.mutedText, marginTop: 4, marginBottom: 0 }}>Press Enter or click outside to confirm.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── HoverOption ───────────────────────────────────────────────────────────────

function HoverOption({ label, isSelected, style, onClick }: {
  label: string;
  isSelected: boolean;
  style: (isSel: boolean, isHov: boolean) => React.CSSProperties;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={style(isSelected, hovered)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
    >
      {isSelected && <span style={{ marginRight: 8, fontSize: "0.75rem" }}>✓</span>}
      {label}
    </div>
  );
}

// ── Image Lightbox ────────────────────────────────────────────────────────────

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position:       "fixed",
        inset:           0,
        background:     "rgba(10,11,38,0.88)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        zIndex:         2000,
        padding:        24,
        animation:      "fadeIn 0.18s ease both",
        cursor:         "zoom-out",
      }}
    >
      <button
        onClick={e => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
        style={{
          position:     "absolute",
          top:          20,
          right:        24,
          width:        42,
          height:       42,
          borderRadius: "50%",
          border:       "1.5px solid rgba(255,255,255,0.3)",
          background:   "rgba(255,255,255,0.08)",
          color:        "white",
          fontSize:     "1.3rem",
          cursor:       "pointer",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          transition:   "background 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
      >
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth:     "92vw",
          maxHeight:    "88vh",
          objectFit:    "contain",
          borderRadius: 10,
          boxShadow:    "0 24px 80px rgba(0,0,0,0.5)",
          cursor:       "default",
          animation:    "popIn 0.2s ease both",
        }}
      />
    </div>
  );
}

// ── Deadline badge (shown in header) ──────────────────────────────────────────
// Live countdown, ticking every second, down to the registration deadline.
// Ported from JobsDesign.tsx.

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function DeadlineBadge() {
  const [time, setTime] = useState(() => getTimeRemaining());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time.expired) {
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 999,
        padding: "5px 14px",
        fontSize: "0.8rem",
        fontWeight: 700,
        color: COLORS.gold,
        whiteSpace: "nowrap",
        width: "fit-content",
      }}>
        ⏰ Registration closed
      </span>
    );
  }

  const urgent = time.totalMs < 1000 * 60 * 60 * 24; // under 24h left

  const countdownStr = `${time.days > 0 ? `${time.days}d ` : ""}${pad2(time.hours)}:${pad2(time.minutes)}:${pad2(time.seconds)}`;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: urgent ? "rgba(192,21,26,0.35)" : "rgba(255,255,255,0.12)",
        border: `1px solid ${urgent ? "rgba(245,200,66,0.6)" : "rgba(255,255,255,0.25)"}`,
        borderRadius: 999,
        padding: "5px 14px",
        fontSize: "0.8rem",
        fontWeight: 700,
        color: COLORS.gold,
        whiteSpace: "nowrap",
        width: "fit-content",
      }}
    >
      ⏰ Registration closes {formatDeadline()} — {countdownStr} remaining
    </span>
  );
}

// ── Registration Closed page ──────────────────────────────────────────────────
// Ported from JobsDesign.tsx's ApplicationsClosed, adapted to list job fairs
// instead of job listings.

function RegistrationClosed({
  isMobile,
  onNavigateHome,
}: {
  isMobile: boolean;
  onNavigateHome: () => void;
}) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes stampIn {
          from { opacity: 0; transform: rotate(-8deg) scale(1.5); }
          to   { opacity: 1; transform: rotate(-8deg) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        body { font-family: 'Source Sans 3', sans-serif; background: #fdf8f0; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fdf8f0", display: "flex", flexDirection: "column" }}>
        <header style={{ background: COLORS.red, padding: "12px 24px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, minHeight: 34 }}>
            <button onClick={onNavigateHome} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
              <img src={pesoLogo} alt="PESO" style={{ width: 36, height: 36, objectFit: "contain" }} />
              <span style={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: 1 }}>P.E.S.O. Capiz</span>
            </button>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", fontWeight: 600 }}>Job Fair Pre-Registration</span>
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "40px 20px" : "60px 24px" }}>
          <div style={{ background: "white", borderRadius: 16, boxShadow: "0 12px 48px rgba(26,29,94,0.10)", padding: isMobile ? "40px 28px 36px" : "56px 64px 52px", maxWidth: 560, width: "100%", textAlign: "center", position: "relative", animation: "fadeUp 0.4s ease both" }}>
            <img src={pesoLogo} alt="PESO Capiz" style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 20, opacity: 0.85 }} />
            <div style={{ display: "inline-block", border: `4px solid ${COLORS.red}`, borderRadius: 10, padding: isMobile ? "8px 20px" : "10px 28px", marginBottom: 28, animation: "stampIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both", animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: isMobile ? "1.5rem" : "2rem", color: COLORS.red, letterSpacing: 3, textTransform: "uppercase", display: "block", transform: "rotate(-8deg)" }}>
                Registration Closed
              </span>
            </div>
            <p style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: COLORS.red, marginBottom: 10 }}>
              P.E.S.O. Capiz — Roxas City
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.5rem" : "1.9rem", color: COLORS.navy, lineHeight: 1.2, marginBottom: 14 }}>
              Pre-registration for these job fairs has ended.
            </h1>
            <p style={{ color: COLORS.bodyText, fontSize: "0.92rem", lineHeight: 1.65, marginBottom: 28 }}>
              The deadline for online pre-registration was{" "}
              <strong style={{ color: COLORS.navy }}>{formatDeadline()}</strong>.
              Please visit the PESO Capiz office or check back for future job fair announcements.
            </p>
            <div style={{ background: "rgba(26,29,94,0.04)", border: "1.5px solid rgba(26,29,94,0.09)", borderRadius: 10, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: COLORS.navy, marginBottom: 12 }}>
                Job fairs that were open for registration
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {JOBFAIR_SCHEDULES_JOB_FAIRS.map(fair => (
                  <div key={fair.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ color: COLORS.navy, fontWeight: 700, fontSize: "0.92rem", display: "block" }}>{fair.name}</span>
                      <span style={{ color: COLORS.bodyText, fontSize: "0.82rem" }}>{fair.date}&nbsp;•&nbsp;{fair.venue}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 0.5, color: COLORS.mutedText, background: "rgba(26,29,94,0.06)", borderRadius: 99, padding: "3px 10px", whiteSpace: "nowrap" }}>
                      {fair.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={onNavigateHome} style={{ background: COLORS.red, color: "white", border: "none", padding: "13px 32px", borderRadius: 8, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(192,21,26,0.28)", fontFamily: "'Source Sans 3', sans-serif", transition: "background 0.2s", letterSpacing: 0.3 }}
              onMouseEnter={e => { e.currentTarget.style.background = COLORS.redHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = COLORS.red; }}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Job Fair Selection Screen ─────────────────────────────────────────────────

function JobFairSelectionScreen({
  isMobile,
  onSelectFair,
}: {
  isMobile: boolean;
  onSelectFair: (fair: { id: string; name: string; date: string; time: string; venue: string }) => void;
}) {
  const [lightboxFair, setLightboxFair] = useState<JobFairSchedulesJobFair | null>(null);

  return (
    <div style={{ maxWidth: 1320, margin: "0 auto", padding: isMobile ? "32px 18px" : "52px 24px" }}>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
        <h1 style={{ ...pageHeading, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginBottom: 12, textAlign: "center" }}>
          Online Pre-Registration
        </h1>
      </div>

      {/* Cards grid */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(380px, 1fr))",
        gap:                 32,
        maxWidth:            1240,
        margin:              "0 auto",
      }}>
        {JOBFAIR_SCHEDULES_JOB_FAIRS.map((fair, i) => (
          <JobFairCard
            key={fair.id}
            fair={fair}
            index={i}
            isMobile={isMobile}
            onSelect={onSelectFair}
            onViewImage={() => setLightboxFair(fair)}
          />
        ))}
      </div>

      {/* Full-image lightbox */}
      {lightboxFair?.image && (
        <ImageLightbox
          src={lightboxFair.image}
          alt={lightboxFair.name}
          onClose={() => setLightboxFair(null)}
        />
      )}
    </div>
  );
}

function JobFairCard({ fair, index, isMobile, onSelect, onViewImage }: {
  fair: JobFairSchedulesJobFair;
  index: number;
  isMobile: boolean;
  onSelect: (fair: { id: string; name: string; date: string; time: string; venue: string }) => void;
  onViewImage: () => void;
}) {
  const [hovered, setHovered]         = useState(false);
  const [imageOk, setImageOk]         = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const placeholder = FAIR_PLACEHOLDER_COLORS[fair.id] ?? { bg: COLORS.navy, accent: COLORS.gold };

  const showImage  = !!fair.image && imageOk;
  const canExpand  = showImage && imageLoaded;

  return (
    <div
      style={{
        background:            "white",
        borderRadius:          isMobile ? 14 : 18,
        boxShadow:             hovered ? "0 20px 56px rgba(26,29,94,0.18)" : "0 5px 24px rgba(26,29,94,0.1)",
        overflow:              "hidden",
        transition:            "box-shadow 0.2s, transform 0.2s",
        transform:             hovered ? "translateY(-5px)" : "none",
        animation:             `fadeUp 0.35s ease both`,
        animationDelay:        `${index * 0.08}s`,
        opacity:               0,
        animationFillMode:     "forwards",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image / Placeholder banner */}
      <div
        style={{ position: "relative", height: isMobile ? 190 : 300, overflow: "hidden", background: "rgba(26,29,94,0.04)", cursor: canExpand ? "zoom-in" : "default" }}
        onClick={() => { if (canExpand) onViewImage(); }}
        role={canExpand ? "button" : undefined}
        aria-label={canExpand ? `View full image of ${fair.name}` : undefined}
      >
        {showImage && (
          <img
            src={fair.image!}
            alt={fair.name}
            onLoad={e => {
              const img = e.currentTarget;
              if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                setImageOk(false);
              } else {
                setImageLoaded(true);
              }
            }}
            onError={() => setImageOk(false)}
            style={{
              width:      "100%",
              height:     "100%",
              objectFit:  "cover",
              display:    "block",
              opacity:    imageLoaded ? 1 : 0,
              transition: "opacity 0.25s, transform 0.3s",
              transform:  hovered ? "scale(1.04)" : "scale(1)",
            }}
          />
        )}

        {/* Placeholder shows by default until the real image finishes loading, or permanently if it fails/doesn't exist */}
        {(!showImage || !imageLoaded) && (
          <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: placeholder.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
            <img src={pesoLogo} alt="PESO" style={{ width: isMobile ? 54 : 76, height: isMobile ? 54 : 76, objectFit: "contain", opacity: 0.7, filter: "brightness(0) invert(1)" }} />
            <span style={{ color: placeholder.accent, fontWeight: 800, fontSize: "0.8rem", letterSpacing: 3, textTransform: "uppercase" }}>P.E.S.O. Capiz</span>
          </div>
        )}

        {/* Gradient overlay, only once the real image is actually showing */}
        {canExpand && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)", pointerEvents: "none" }} />
        )}

        {/* Expand hint */}
        {canExpand && (
          <div
            style={{
              position:     "absolute",
              top:          14,
              right:        14,
              width:        36,
              height:       36,
              borderRadius: "50%",
              background:   "rgba(10,11,38,0.5)",
              color:        "white",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              fontSize:     "1rem",
              opacity:      hovered || isMobile ? 1 : 0,
              transition:   "opacity 0.18s",
              pointerEvents: "none",
            }}
          >
            🔍
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: isMobile ? "20px 20px 22px" : "28px 30px 30px" }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.25rem" : "1.5rem", color: COLORS.navy, margin: "0 0 12px", lineHeight: 1.3 }}>
          {fair.name}
        </h3>

        {/* Date / Time / Venue info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: isMobile ? 18 : 24 }}>
          <span style={{ fontSize: isMobile ? "0.86rem" : "0.94rem", color: COLORS.bodyText }}>
            📅 {fair.date} &nbsp;·&nbsp; 🕗 {fair.time}
          </span>
          <span style={{ fontSize: isMobile ? "0.86rem" : "0.94rem", color: COLORS.bodyText }}>
            📍 {fair.venue}
          </span>
        </div>

        <button
          onClick={() => onSelect({ id: fair.id, name: fair.name, date: fair.date, time: fair.time, venue: fair.venue })}
          style={{ width: "100%", background: COLORS.red, color: "white", border: "none", padding: isMobile ? "13px 0" : "14px 0", borderRadius: 10, fontWeight: 700, fontSize: isMobile ? "0.95rem" : "1.02rem", cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 3px 14px rgba(192,21,26,0.25)", transition: "background 0.18s", letterSpacing: 0.3 }}
          onMouseEnter={e => { e.currentTarget.style.background = COLORS.redHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = COLORS.red; }}
        >
          Register →
        </button>
      </div>
    </div>
  );
}

// ── Reference panel (right side) ──────────────────────────────────────────────

function AvailableJobsReference({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ flex: isMobile ? "none" : "0 0 38%", order: isMobile ? 1 : 2 }}>
      <div style={{ position: isMobile ? "static" : "sticky", top: 24 }}>
        <div style={{ background: COLORS.navy, borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 32px rgba(26,29,94,0.18)" }}>
          <div style={{ padding: isMobile ? "18px 20px 14px" : "22px 24px 18px" }}>
            <span style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.gold, marginBottom: 6 }}>
              For Reference
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.2rem" : "1.4rem", color: "white", lineHeight: 1.2, margin: 0 }}>
              Available Positions
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {JOBFAIR_SCHEDULES_JOB_LISTINGS.map((j, i) => (
              <div key={j.id} style={{ padding: isMobile ? "14px 20px 16px" : "18px 24px 20px", borderTop: i === 0 ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ color: "white", fontWeight: 700, fontSize: "0.95rem", display: "block", marginBottom: 2 }}>{j.position}</span>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", display: "block", marginBottom: 12 }}>{j.company}&nbsp;•&nbsp;{j.location}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.8rem" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>Education</span>
                    <span style={{ color: "white", fontWeight: 700, textAlign: "right" }}>{j.educationLabel}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.8rem" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>Skills</span>
                    <span style={{ color: "white", fontWeight: 700, textAlign: "right" }}>{j.requiredSkills.join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Success page ──────────────────────────────────────────────────────────────

function SuccessPage({ form, isMobile, onNavigateHome }: {
  form: JobFairSchedulesFormState; isMobile: boolean;
  onNavigateHome: () => void;
}) {

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "32px 20px" : "72px 24px" }}>
      <div style={{ background: "white", borderRadius: isMobile ? 16 : 20, boxShadow: "0 20px 64px rgba(26,29,94,0.14)", padding: isMobile ? "32px 22px" : "64px 76px", maxWidth: 1280, width: "100%", animation: "fadeUp 0.4s ease both" }}>
        <div style={{ display: "flex", gap: isMobile ? 28 : 64, flexWrap: "wrap", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "flex-start" }}>

          {/* Left: logo + greeting */}
          <div style={{ flex: isMobile ? "none" : "0 0 360px", textAlign: isMobile ? "center" : "left", display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-start" }}>
            <img src={pesoLogo} alt="PESO" style={{ width: isMobile ? 140 : 300, height: isMobile ? 140 : 300, objectFit: "contain", marginBottom: isMobile ? 16 : 24 }} />
            <h1 style={{ ...pageHeading, fontSize: isMobile ? "1.6rem" : "2.4rem", marginBottom: 16, wordBreak: "break-word" }}>You're registered, {form.firstName.trim()}!</h1>
            <p style={{ color: COLORS.bodyText, fontSize: isMobile ? "0.92rem" : "1.05rem", lineHeight: 1.7, margin: 0, wordBreak: "break-word" }}>
              Confirmation sent to <strong style={{ color: COLORS.navy }}>{form.email.trim()}</strong>.
            </p>
          </div>

          {/* Right: summary + reminders */}
          <div style={{ flex: "1 1 440px", width: "100%", display: "flex", flexDirection: "column", gap: isMobile ? 18 : 26 }}>

            {/* Registration summary */}
            <div style={{ background: "rgba(26,29,94,0.03)", border: "1.5px solid rgba(26,29,94,0.09)", borderRadius: 14, padding: isMobile ? "20px 20px" : "26px 30px", textAlign: "left" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: COLORS.navy, marginBottom: 18 }}>Event Details:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {([
                  ["Job Fair", form.jobFairName],
                  ["Date",     form.jobFairDate],
                  ["Time",     form.jobFairTime],
                  ["Venue",    form.jobFairVenue],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: isMobile ? "0.9rem" : "1rem" }}>
                    <span style={{ color: COLORS.mutedText, flexShrink: 0 }}>{label}</span>
                    <span style={{ color: COLORS.navy, fontWeight: 600, textAlign: "right" }}>{value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reminder box */}
            <div style={{ background: "rgba(245,200,66,0.10)", border: "1.5px solid rgba(245,200,66,0.35)", borderRadius: 14, padding: isMobile ? "18px 20px" : "24px 30px", textAlign: "left" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#8a6a00", marginBottom: 14 }}>Important Reminder:</p>
              <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Please take a screenshot of this confirmation and present it at the registration area on the day of the job fair as proof of your pre-registration.",
                ].map(r => (
                  <li key={r} style={{ color: COLORS.bodyText, fontSize: isMobile ? "0.86rem" : "0.94rem", lineHeight: 1.6 }}>{r}</li>
                ))}
              </ul>
            </div>

            <div>
              <button
                onClick={onNavigateHome}
                style={{ width: isMobile ? "100%" : "auto", background: COLORS.navy, color: "white", border: "none", padding: isMobile ? "15px 0" : "16px 34px", borderRadius: 9, fontWeight: 700, fontSize: "1rem", cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif", transition: "background 0.2s", letterSpacing: 0.3 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#12154a"; }}
                onMouseLeave={e => { e.currentTarget.style.background = COLORS.navy; }}
              >
                🏠 Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function JobFairSchedulesDesign({
  form, issues, attempted, submitting, submitError, submitSuccess,
  isMobile, formTopRef, emailVerified, onUpdateForm, onToggleLanguage,
  onSelectFair, onBackToFairs, onEmailVerified, onChangeEmail, onSubmit, onNavigateHome,
}: JobFairSchedulesDesignProps) {

  // If registration has closed, block new sign-ups — but still let someone who
  // already registered (submitSuccess) see their confirmation screen.
  if (isApplicationClosed() && !submitSuccess) {
    return <RegistrationClosed isMobile={isMobile} onNavigateHome={onNavigateHome} />;
  }

  // Checks for EXACT issue messages returned by getJobFairSchedulesIssues,
  // rather than loose substring keywords. Substring matching previously caused
  // false positives — e.g. hasIssue("address") also matched the word
  // "addresses" inside the disposable-email message, which incorrectly put
  // the Address field into an error state whenever the Email field had an
  // unrelated error.
  const hasIssue = (...exactMessages: string[]) =>
    exactMessages.some(msg => issues.includes(msg));

  const submitDisabled = submitting || !form.consentGiven || !emailVerified;
  const consentError   = attempted && !form.consentGiven;

  const educationOptions = JOBFAIR_SCHEDULES_EDUCATION_LEVELS.map(lvl => ({
    value: lvl.label,
    label: lvl.label,
  }));

  const fairSelected = !!form.jobFairId;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp    { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin      { to { transform:rotate(360deg); } }
        @keyframes expandDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
        @keyframes popIn     { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        * { box-sizing:border-box; }
        body { font-family:'Source Sans 3',sans-serif; background:#fdf8f0; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "0 0 80px" }}>

        {/* ── Header ── */}
        <header style={{ background: COLORS.red, padding: isMobile ? "10px 14px" : "12px 24px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", gap: isMobile ? 8 : 12, minHeight: 34, flexWrap: "wrap" }}>
            <button onClick={onNavigateHome} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: isMobile ? 7 : 10, padding: 0, flexShrink: 0 }}>
              <img src={pesoLogo} alt="PESO" style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, objectFit: "contain" }} />
              <span style={{ color: "white", fontWeight: 800, fontSize: isMobile ? "0.82rem" : "0.95rem", letterSpacing: 1, whiteSpace: "nowrap" }}>P.E.S.O. Capiz</span>
            </button>
            {!isMobile && (
              <>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", fontWeight: 600 }}>Job Fair Pre-Registration</span>
              </>
            )}
            {fairSelected && !isMobile && (
              <>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.82rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{form.jobFairName}</span>
              </>
            )}
          </div>
          {isMobile && (
            <div style={{ maxWidth: 1180, margin: "4px auto 0" }}>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.74rem", fontWeight: 600, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Job Fair Pre-Registration{fairSelected ? ` · ${form.jobFairName}` : ""}
              </span>
            </div>
          )}
          <div style={{ maxWidth: 1180, margin: "0 auto", marginTop: 8 }}>
            <DeadlineBadge />
          </div>
        </header>

        {/* ── Body ── */}
        {submitSuccess ? (
          <SuccessPage form={form} isMobile={isMobile} onNavigateHome={onNavigateHome} />
        ) : !fairSelected ? (
          <JobFairSelectionScreen isMobile={isMobile} onSelectFair={onSelectFair} />
        ) : (
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: isMobile ? "20px 14px 0" : "40px 24px 0" }}>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>

              {/* ── Left: Form ── */}
              <div ref={formTopRef} style={{ flex: isMobile ? "none" : "1 1 0%", order: isMobile ? 2 : 1 }}>
                <div style={{ background: "white", borderRadius: isMobile ? 12 : 14, boxShadow: "0 8px 32px rgba(26,29,94,0.08)", padding: isMobile ? "18px 16px" : "32px 36px", animation: "slideIn 0.3s ease both" }}>

                  {/* Back to fair selection */}
                  <button
                    onClick={onBackToFairs}
                    style={{ background: "transparent", border: "1.5px solid rgba(26,29,94,0.15)", color: COLORS.navy, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, fontWeight: 700, fontSize: "0.82rem", fontFamily: "'Source Sans 3', sans-serif", transition: "all 0.15s", marginBottom: 20 }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,29,94,0.04)"; e.currentTarget.style.borderColor = "rgba(26,29,94,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(26,29,94,0.15)"; }}
                  >
                    ← Change Job Fair
                  </button>

                  {/* Selected fair badge */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(26,29,94,0.05)", border: "1.5px solid rgba(26,29,94,0.12)", borderRadius: 99, padding: "5px 14px", marginBottom: 18, maxWidth: "100%" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: COLORS.red, flexShrink: 0 }}>Registering for</span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: COLORS.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.jobFairName}</span>
                  </div>

                  {/* Event details strip */}
                  <div style={{ display: "flex", gap: isMobile ? 10 : 20, flexWrap: "wrap", marginBottom: 24, padding: isMobile ? "10px 14px" : "12px 16px", background: "rgba(26,29,94,0.03)", border: "1.5px solid rgba(26,29,94,0.08)", borderRadius: 10 }}>
                    <span style={{ fontSize: isMobile ? "0.78rem" : "0.83rem", color: COLORS.bodyText }}>📅 <strong style={{ color: COLORS.navy }}>{form.jobFairDate}</strong></span>
                    <span style={{ fontSize: isMobile ? "0.78rem" : "0.83rem", color: COLORS.bodyText }}>🕗 <strong style={{ color: COLORS.navy }}>{form.jobFairTime}</strong></span>
                    <span style={{ fontSize: isMobile ? "0.78rem" : "0.83rem", color: COLORS.bodyText }}>📍 <strong style={{ color: COLORS.navy }}>{form.jobFairVenue}</strong></span>
                  </div>

                  {/* Nothing past this point is visible until the email is verified */}
                  {!emailVerified ? (
                    <EmailVerificationGate
                      formLabel={form.jobFairName}
                      colors={COLORS}
                      isMobile={isMobile}
                      otpUrl={JOBFAIR_SCHEDULES_SUBMIT_URL}
                      onVerified={onEmailVerified}
                    />
                  ) : (
                    <>
                      <span style={labelCaps}>Job Fair Pre-Registration</span>
                      <h1 style={pageHeading}>Personal Information</h1>
                      <p style={pageSubtext}>
                        Please fill out the required details and information. Indicate “N/A” if not applicable.
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                        {/* Name */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <Field label="First Name" required style={{ flex: isMobile ? "1 1 100%" : "1 1 200px" }} error={hasIssue("First name is required.") ? "First name is required." : undefined}>
                            <input style={fieldInputStyle(hasIssue("First name is required."))} value={form.firstName} onChange={e => onUpdateForm({ firstName: e.target.value.toUpperCase() })} placeholder="JUAN" />
                          </Field>
                          <Field label="Middle Name" required style={{ flex: isMobile ? "1 1 100%" : "1 1 160px" }} error={hasIssue("Middle name is required.") ? "Middle name is required." : undefined}>
                            <input style={fieldInputStyle(hasIssue("Middle name is required."))} value={form.middleName} onChange={e => onUpdateForm({ middleName: e.target.value.toUpperCase() })} placeholder="SANTOS" />
                          </Field>
                          <Field label="Last Name" required style={{ flex: isMobile ? "1 1 100%" : "1 1 200px" }} error={hasIssue("Last name is required.") ? "Last name is required." : undefined}>
                            <input style={fieldInputStyle(hasIssue("Last name is required."))} value={form.lastName} onChange={e => onUpdateForm({ lastName: e.target.value.toUpperCase() })} placeholder="DELA CRUZ" />
                          </Field>
                        </div>

                        {/* Email (verified, read-only) + Contact */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <Field label="Email Address" required style={{ flex: isMobile ? "1 1 100%" : "1 1 240px" }}>
                            <div
                              style={{
                                display:        "flex",
                                alignItems:     "center",
                                justifyContent: "space-between",
                                gap:            10,
                                padding:        "10px 14px",
                                borderRadius:   8,
                                border:         "1.5px solid rgba(63,174,90,0.35)",
                                background:     "rgba(63,174,90,0.06)",
                                boxSizing:      "border-box",
                              }}
                            >
                              <span style={{ color: COLORS.greenText, fontWeight: 700, fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                ✓ {form.email}
                              </span>
                              <button
                                type="button"
                                onClick={onChangeEmail}
                                style={{ background: "transparent", border: "none", color: COLORS.red, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", flexShrink: 0, fontFamily: "'Source Sans 3', sans-serif", padding: 0 }}
                              >
                                Change
                              </button>
                            </div>
                          </Field>
                          <Field label="Contact Number" required style={{ flex: isMobile ? "1 1 100%" : "1 1 180px" }} error={hasIssue("Contact number is required.") ? "Contact number is required." : undefined}>
                            <input style={fieldInputStyle(hasIssue("Contact number is required."))} value={form.contact} onChange={e => onUpdateForm({ contact: e.target.value.toUpperCase() })} placeholder="09XXXXXXXXX" />
                          </Field>
                        </div>

                        {/* Address */}
                        <Field label="Address" required error={hasIssue("Address is required.") ? "Address is required." : undefined}>
                          <input style={fieldInputStyle(hasIssue("Address is required."))} value={form.address} onChange={e => onUpdateForm({ address: e.target.value.toUpperCase() })} placeholder="BRGY., CITY/MUNICIPALITY, PROVINCE" />
                        </Field>

                        <SectionDivider title="Personal Profile" />

                        {/* Birthday + Gender + Civil Status */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <Field label="Birthday" required style={{ flex: isMobile ? "1 1 100%" : "1 1 180px" }} error={hasIssue("Birthday is required.") ? "Birthday is required." : undefined}>
                            <input type="date" style={fieldInputStyle(hasIssue("Birthday is required."))} value={form.birthday} onChange={e => onUpdateForm({ birthday: e.target.value })} />
                          </Field>
                          <Field label="Gender" required style={{ flex: isMobile ? "1 1 100%" : "1 1 180px" }} error={hasIssue("Gender is required.") ? "Gender is required." : undefined}>
                            <select style={fieldInputStyle(hasIssue("Gender is required."))} value={form.gender} onChange={e => onUpdateForm({ gender: e.target.value })}>
                              <option value="">Select gender</option>
                              {JOBFAIR_SCHEDULES_GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </Field>
                          <Field label="Civil Status" required style={{ flex: isMobile ? "1 1 100%" : "1 1 180px" }} error={hasIssue("Civil status is required.") ? "Civil status is required." : undefined}>
                            <select style={fieldInputStyle(hasIssue("Civil status is required."))} value={form.civilStatus} onChange={e => onUpdateForm({ civilStatus: e.target.value })}>
                              <option value="">Select civil status</option>
                              {JOBFAIR_SCHEDULES_CIVIL_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </Field>
                        </div>

                        {/* Disability */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <Field label="Disability" required style={{ flex: isMobile ? "1 1 100%" : "1 1 180px" }} error={hasIssue("Please indicate if you have a disability.") ? "Please indicate if you have a disability." : undefined}>
                            <select style={fieldInputStyle(hasIssue("Please indicate if you have a disability."))} value={form.hasDisability} onChange={e => onUpdateForm({ hasDisability: e.target.value, ...(e.target.value !== "Yes" ? { disabilityDetails: "" } : {}) })}>
                              <option value="">Select an option</option>
                              {JOBFAIR_SCHEDULES_DISABILITY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </Field>
                          {form.hasDisability === "Yes" && (
                            <Field label="Please specify (optional)" style={{ flex: isMobile ? "1 1 100%" : "2 1 240px" }}>
                              <input style={inputStyle} value={form.disabilityDetails} onChange={e => onUpdateForm({ disabilityDetails: e.target.value.toUpperCase() })} placeholder="E.G. VISUAL IMPAIRMENT, MOBILITY IMPAIRMENT, ETC." />
                            </Field>
                          )}
                        </div>

                        {/* Employment + OFW + 4Ps */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <Field label="Employment Status" required style={{ flex: isMobile ? "1 1 100%" : "1 1 180px" }} error={hasIssue("Employment status is required.") ? "Employment status is required." : undefined}>
                            <select style={fieldInputStyle(hasIssue("Employment status is required."))} value={form.employmentStatus} onChange={e => onUpdateForm({ employmentStatus: e.target.value })}>
                              <option value="">Select status</option>
                              {JOBFAIR_SCHEDULES_EMPLOYMENT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </Field>
                          <Field label="Are you an OFW?" required style={{ flex: isMobile ? "1 1 100%" : "1 1 180px" }} error={hasIssue("OFW status is required.") ? "OFW status is required." : undefined}>
                            <select style={fieldInputStyle(hasIssue("OFW status is required."))} value={form.ofwStatus} onChange={e => onUpdateForm({ ofwStatus: e.target.value })}>
                              <option value="">Select status</option>
                              {JOBFAIR_SCHEDULES_OFW_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </Field>
                          <Field label="4Ps Beneficiary" required hint="Pantawid Pamilyang Pilipino Program" style={{ flex: isMobile ? "1 1 100%" : "1 1 180px" }} error={hasIssue("Please indicate if you are a 4Ps beneficiary.") ? "Please indicate if you are a 4Ps beneficiary." : undefined}>
                            <select style={fieldInputStyle(hasIssue("Please indicate if you are a 4Ps beneficiary."))} value={form.fourPsBeneficiary} onChange={e => onUpdateForm({ fourPsBeneficiary: e.target.value })}>
                              <option value="">Select an option</option>
                              {JOBFAIR_SCHEDULES_FOURPS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </Field>
                        </div>

                        <SectionDivider title="Educational Background" />

                        {/* Educational Attainment */}
                        <Field label="Educational Attainment" required error={hasIssue("Educational attainment is required.") ? "Educational attainment is required." : undefined}>
                          <ScrollSelect
                            value={form.educationalAttainment}
                            placeholder="Select your highest attainment"
                            options={educationOptions}
                            onChange={v => onUpdateForm({ educationalAttainment: v })}
                            hasError={hasIssue("Educational attainment is required.")}
                            visibleRows={6}
                          />
                        </Field>

                        {/* School + Degree */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <Field label="School" required style={{ flex: isMobile ? "1 1 100%" : "1 1 240px" }} error={hasIssue("School name is required.") ? "School name is required." : undefined}>
                            <input
                              style={fieldInputStyle(hasIssue("School name is required."))}
                              value={form.school}
                              onChange={e => onUpdateForm({ school: e.target.value.toUpperCase() })}
                              placeholder="E.G. FILAMER CHRISTIAN UNIVERSITY"
                            />
                          </Field>
                          <Field label="Degree / Course" required hint="Pick from list or type your own" style={{ flex: isMobile ? "1 1 100%" : "1 1 240px" }} error={hasIssue("Degree/Course is required.") ? "Degree/Course is required." : undefined}>
                            <DegreeCombobox
                              value={form.degree}
                              onChange={v => onUpdateForm({ degree: v })}
                              hasError={hasIssue("Degree/Course is required.")}
                            />
                          </Field>
                        </div>

                        <SectionDivider title="Job Preferences" />

                        {/* Preferred Occupation + Location */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <Field label="Preferred Occupation" required style={{ flex: isMobile ? "1 1 100%" : "1 1 240px" }} error={hasIssue("Preferred occupation is required.") ? "Preferred occupation is required." : undefined}>
                            <input style={fieldInputStyle(hasIssue("Preferred occupation is required."))} value={form.preferredOccupation} onChange={e => onUpdateForm({ preferredOccupation: e.target.value.toUpperCase() })} placeholder="E.G. CASHIER, OFFICE STAFF, DRIVER" />
                          </Field>
                          <Field label="Preferred Work Location" required style={{ flex: isMobile ? "1 1 100%" : "1 1 240px" }} error={hasIssue("Preferred work location is required.") ? "Preferred work location is required." : undefined}>
                            <input style={fieldInputStyle(hasIssue("Preferred work location is required."))} value={form.preferredWorkLocation} onChange={e => onUpdateForm({ preferredWorkLocation: e.target.value.toUpperCase() })} placeholder="E.G. ROXAS CITY, CAPIZ" />
                          </Field>
                        </div>

                        {/* Language Proficiency */}
                        <Field label="Language Proficiency" required error={hasIssue("Please select at least one language you're proficient in.") ? "Please select at least one language you're proficient in." : undefined}>
                          <p style={{ color: COLORS.bodyText, fontSize: "0.85rem", marginBottom: 10, marginTop: -4 }}>
                            Select all languages you can speak/write proficiently.
                          </p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                            {JOBFAIR_SCHEDULES_LANGUAGE_OPTIONS.map(lang => {
                              const checked     = form.languages.includes(lang);
                              const errorBorder = hasIssue("Please select at least one language you're proficient in.") && !checked;
                              return (
                                <label key={lang} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.88rem", color: COLORS.navy, fontWeight: 600, border: `1.5px solid ${checked ? "rgba(26,29,94,0.3)" : errorBorder ? "rgba(192,21,26,0.3)" : "rgba(26,29,94,0.12)"}`, background: checked ? "rgba(26,29,94,0.05)" : "transparent", borderRadius: 999, padding: "6px 14px", transition: "all 0.15s" }}>
                                  <input type="checkbox" checked={checked} onChange={() => onToggleLanguage(lang)} style={{ width: 16, height: 16, accentColor: COLORS.navy, cursor: "pointer" }} />
                                  {lang}
                                </label>
                              );
                            })}
                          </div>
                          {form.languages.includes("Others") && (
                            <input style={{ ...inputStyle, marginTop: 10, border: hasIssue("Please specify your other language(s).") ? "1.5px solid #c0151a" : inputBorder }} value={form.otherLanguage} onChange={e => onUpdateForm({ otherLanguage: e.target.value.toUpperCase() })} placeholder="PLEASE SPECIFY OTHER LANGUAGE(S)" />
                          )}
                        </Field>

                        <SectionDivider title="Data Privacy Consent" />

                        <ConsentBox checked={form.consentGiven} onChange={checked => onUpdateForm({ consentGiven: checked })} highlightError={consentError} />

                        {/* Validation summary */}
                        {attempted && issues.length > 0 && (
                          <div style={{ background: "rgba(192,21,26,0.05)", border: "1.5px solid rgba(192,21,26,0.2)", borderRadius: 10, padding: "14px 18px", animation: "fadeUp 0.25s ease both" }}>
                            <p style={{ color: COLORS.red, fontWeight: 700, fontSize: "0.85rem", marginBottom: 6 }}>Please fix the following before submitting:</p>
                            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                              {issues.map((issue, i) => <li key={i} style={{ color: COLORS.bodyText, fontSize: "0.83rem", lineHeight: 1.5 }}>{issue}</li>)}
                            </ul>
                          </div>
                        )}

                        {/* Submit error */}
                        {submitError && (
                          <div style={{ background: "rgba(192,21,26,0.05)", border: "1.5px solid rgba(192,21,26,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                            <p style={{ color: COLORS.red, fontSize: "0.85rem", margin: 0 }}>⚠️ Submission failed: {submitError}. Please try again.</p>
                          </div>
                        )}

                        {/* Submit + Back buttons */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", flexDirection: isMobile ? "column-reverse" : "row" }}>
                          <button
                            type="button"
                            onClick={onSubmit}
                            disabled={submitDisabled}
                            style={{ ...primaryBtn(submitDisabled), width: isMobile ? "100%" : "auto", justifyContent: "center", alignSelf: isMobile ? "stretch" : "flex-start" }}
                            onMouseEnter={e => { if (!submitDisabled) e.currentTarget.style.background = COLORS.redHover; }}
                            onMouseLeave={e => { if (!submitDisabled) e.currentTarget.style.background = COLORS.red; }}
                          >
                            {submitting && <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
                            {submitting ? "Registering…" : "Submit"}
                          </button>
                          <button
                            type="button"
                            onClick={onNavigateHome}
                            style={{ background: "transparent", border: "1.5px solid rgba(26,29,94,0.15)", color: COLORS.navy, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "13px 20px", borderRadius: 8, fontWeight: 700, fontSize: "0.88rem", fontFamily: "'Source Sans 3', sans-serif", transition: "all 0.15s", width: isMobile ? "100%" : "auto" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,29,94,0.04)"; e.currentTarget.style.borderColor = "rgba(26,29,94,0.15)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(26,29,94,0.15)"; }}
                          >
                            🏠 Back to Home
                          </button>
                        </div>

                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Right: Reference panel ── */}
              <AvailableJobsReference isMobile={isMobile} />

            </div>
          </div>
        )}
      </div>
    </>
  );
}