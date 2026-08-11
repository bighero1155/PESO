/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef } from "react";
import pesoLogo from "/assets/peso-logo.png";
import {
  JOB_LISTINGS,
  EDUCATION_LEVELS,
  GENDER_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  DISABILITY_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  OFW_STATUS_OPTIONS,
  FOUR_PS_OPTIONS,
  LANGUAGE_OPTIONS,
  DEGREE_OPTIONS,
  JOBS_SUBMIT_URL,
  isValidGDriveLink,
  getStep1Issues,
  getMatchPercent,
  isApplicationClosed,
  formatDeadline,
  getTimeRemaining,
  type JobListing,
  type FormState,
  type JobResult,
} from "./Jobs";
import EmailVerificationGate from "../../email/Emailverificationgate";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface JobsDesignProps {
  step: 1 | 2;
  isMobile: boolean;
  form: FormState;
  chosenJobIds: string[];
  selectedJobId: string;
  jobResults: JobResult[];
  submitted: boolean;
  submitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  matchPercent: number;
  activeJob: JobListing;
  allChosenSkills: { skill: string; jobLabel: string }[];
  qualifiedResults: JobResult[];
  notQualifiedResults: JobResult[];
  formTopRef: React.RefObject<HTMLDivElement | null>;
  appliedJobIds: string[];
  step1Attempted: boolean;
  emailVerified: boolean;
  onUpdateForm: (patch: Partial<FormState>) => void;
  onToggleSkill: (skill: string) => void;
  onToggleLanguage: (lang: string) => void;
  onToggleChosenJob: (id: string) => void;
  onSelectJobTab: (id: string) => void;
  onEmailVerified: (email: string, token: string) => void;
  onChangeEmail: () => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onNavigateHome: () => void;
}

// ── Shared design tokens ───────────────────────────────────────────────────────

const COLORS = {
  red: "#c0151a",
  redHover: "#a01015",
  navy: "#1a1d5e",
  gold: "#f5c842",
  green: "#3fae5a",
  greenText: "#2f8a48",
  amberText: "#b8860b",
  bodyText: "#5a5a7a",
  mutedText: "#9a9ab0",
};

const inputBorder = "1.5px solid rgba(26,29,94,0.15)";

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: inputBorder,
  fontSize: "0.92rem",
  fontFamily: "'Source Sans 3', sans-serif",
  color: COLORS.navy,
  outline: "none",
  background: "white",
};

const labelCaps: React.CSSProperties = {
  display: "inline-block",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: 4,
  textTransform: "uppercase",
  color: COLORS.red,
  marginBottom: 10,
};

const pageHeading: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
  color: COLORS.navy,
  marginBottom: 8,
};

const pageSubtext: React.CSSProperties = {
  color: COLORS.bodyText,
  fontSize: "0.95rem",
  lineHeight: 1.65,
  marginBottom: 28,
  maxWidth: 520,
};

const primaryButtonStyle = (disabled: boolean): React.CSSProperties => ({
  marginTop: 8,
  alignSelf: "flex-start",
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: disabled ? "#ccc" : COLORS.red,
  color: "white",
  border: "none",
  padding: "13px 32px",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: "0.95rem",
  cursor: disabled ? "not-allowed" : "pointer",
  boxShadow: disabled ? "none" : "0 4px 16px rgba(192,21,26,0.3)",
  transition: "background 0.2s",
  letterSpacing: 0.3,
});

const microLabel: React.CSSProperties = {
  color: COLORS.navy,
  fontSize: "0.7rem",
  letterSpacing: 1.5,
  textTransform: "uppercase",
  fontWeight: 800,
  marginBottom: 10,
};

// ── Custom scrollable dropdown: plain select (no typing) ──────────────────────
// Used for Educational Attainment.

interface ScrollSelectProps {
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  hasError?: boolean;
  visibleRows?: number;
}

function ScrollSelect({
  value,
  placeholder,
  options,
  onChange,
  hasError = false,
  visibleRows = 6,
}: ScrollSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(o => o.value === value)?.label ?? "";
  const ROW_HEIGHT = 40;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const idx = options.findIndex(o => o.value === value);
        const next = e.key === "ArrowDown"
          ? Math.min(idx + 1, options.length - 1)
          : Math.max(idx - 1, 0);
        if (options[next]) onChange(options[next].value);
      }
      if (e.key === "Enter") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, options, value, onChange]);

  const triggerStyle: React.CSSProperties = {
    ...inputStyle,
    border: hasError ? "1.5px solid #c0151a" : open ? `1.5px solid ${COLORS.navy}` : inputBorder,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    userSelect: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  const panelStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "white",
    border: `1.5px solid ${COLORS.navy}`,
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(26,29,94,0.13)",
    zIndex: 999,
    overflowY: "auto",
    maxHeight: `${ROW_HEIGHT * visibleRows}px`,
    animation: "expandDown 0.15s ease both",
  };

  const optionStyle = (isSelected: boolean, isHovered: boolean): React.CSSProperties => ({
    padding: "0 14px",
    height: ROW_HEIGHT,
    display: "flex",
    alignItems: "center",
    fontSize: "0.92rem",
    fontFamily: "'Source Sans 3', sans-serif",
    color: isSelected ? COLORS.red : COLORS.navy,
    fontWeight: isSelected ? 700 : 400,
    background: isSelected ? "rgba(192,21,26,0.05)" : isHovered ? "rgba(26,29,94,0.04)" : "transparent",
    cursor: "pointer",
    transition: "background 0.1s",
    boxSizing: "border-box",
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
            <HoverOption
              key={opt.value}
              label={opt.label}
              isSelected={opt.value === value}
              style={optionStyle}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Degree / Course combobox with search + "Type my own" ──────────────────────

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

  // If the current value is not a preset, seed the own-text input
  useEffect(() => {
    if (value && !DEGREE_OPTIONS.includes(value)) {
      setOwnMode(true);
      setOwnText(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = query.trim()
    ? DEGREE_OPTIONS.filter(d => d.toLowerCase().includes(query.toLowerCase()))
    : DEGREE_OPTIONS;

  // Close on outside click, committing own-text if active
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
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "white",
    border: `1.5px solid ${COLORS.navy}`,
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(26,29,94,0.13)",
    zIndex: 999,
    overflow: "hidden",
    animation: "expandDown 0.15s ease both",
  };

  const optStyle = (sel: boolean, hov: boolean): React.CSSProperties => ({
    padding: "0 14px",
    height: ROW_HEIGHT,
    display: "flex",
    alignItems: "center",
    fontSize: "0.92rem",
    fontFamily: "'Source Sans 3', sans-serif",
    color: sel ? COLORS.red : COLORS.navy,
    fontWeight: sel ? 700 : 400,
    background: sel ? "rgba(192,21,26,0.05)" : hov ? "rgba(26,29,94,0.04)" : "transparent",
    cursor: "pointer",
    borderBottom: "1px solid rgba(26,29,94,0.05)",
    boxSizing: "border-box",
  });

  const isPreset   = DEGREE_OPTIONS.includes(value);
  const hasValue   = !!value.trim();

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
        <span style={{
          color: hasValue ? COLORS.navy : COLORS.mutedText,
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {hasValue ? value : "e.g. BS Information Technology"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {hasValue && (
            <span
              onClick={clearValue}
              title="Clear"
              style={{ fontSize: "0.72rem", color: COLORS.mutedText, cursor: "pointer", lineHeight: 1, padding: "2px 4px" }}
            >
              ✕
            </span>
          )}
          <span style={{
            fontSize: "0.7rem",
            color: COLORS.mutedText,
            display: "inline-block",
            transition: "transform 0.15s",
            transform: open ? "rotate(180deg)" : "none",
          }}>
            ▼
          </span>
        </span>
      </div>

      {/* Confirmation badge */}
      {hasValue && (
        <p style={{
          fontSize: "0.76rem",
          color: COLORS.greenText,
          fontWeight: 600,
          margin: "5px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}>
          <span style={{
            width: 7,
            height: 7,
            background: COLORS.green,
            borderRadius: "50%",
            display: "inline-block",
            flexShrink: 0,
          }} />
          {isPreset ? value : `Custom: ${value}`}
        </p>
      )}

      {/* Dropdown panel */}
      {open && (
        <div style={panelStyle}>

          {/* Search input */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(26,29,94,0.08)" }}>
            <input
              ref={searchRef}
              style={{
                ...inputStyle,
                background: "#f8f7fc",
                fontSize: "0.88rem",
                padding: "7px 10px",
              }}
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
                  <HoverOption
                    key={d}
                    label={d}
                    isSelected={d === value}
                    style={optStyle}
                    onClick={() => pick(d)}
                  />
                ))
              : (
                <p style={{ padding: "12px 14px", color: COLORS.mutedText, fontSize: "0.84rem", margin: 0 }}>
                  No matches — use "Type my own" below.
                </p>
              )
            }
          </div>

          {/* "Type my own course" section */}
          <div style={{ borderTop: "1.5px dashed rgba(26,29,94,0.12)" }}>
            <button
              type="button"
              onClick={() => {
                setOwnMode(v => !v);
                if (!ownMode) setTimeout(() => ownInputRef.current?.focus(), 50);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 9,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Source Sans 3', sans-serif",
                textAlign: "left",
                transition: "background 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,29,94,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(192,21,26,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.78rem",
                flexShrink: 0,
              }}>
                ✏️
              </span>
              <span style={{ color: COLORS.navy, fontWeight: 700, fontSize: "0.88rem" }}>
                Others
              </span>
              <span style={{ color: COLORS.mutedText, fontSize: "0.78rem", marginLeft: 2 }}>
                Not in the list?
              </span>
            </button>

            {ownMode && (
              <div style={{ padding: "0 10px 10px", animation: "expandDown 0.14s ease both" }}>
                <input
                  ref={ownInputRef}
                  style={{
                    ...inputStyle,
                    border: "1.5px solid rgba(192,21,26,0.4)",
                    background: "rgba(192,21,26,0.03)",
                    fontSize: "0.9rem",
                  }}
                  placeholder="e.g. BS Geodetic Engineering"
                  value={ownText}
                  onChange={e => {
                    setOwnText(e.target.value);
                    onChange(e.target.value); // live update so badge reflects typing
                  }}
                  onKeyDown={e => { if (e.key === "Enter") commitOwn(); }}
                />
                <p style={{ fontSize: "0.74rem", color: COLORS.mutedText, marginTop: 4, marginBottom: 0 }}>
                  Press Enter or click outside to confirm.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared hover-aware option row ─────────────────────────────────────────────

function HoverOption({
  label,
  isSelected,
  style,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  style: (isSelected: boolean, isHovered: boolean) => React.CSSProperties;
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

// ── Deadline badge (shown in header) ──────────────────────────────────────────
// Live countdown, ticking every second, down to the application deadline.

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
        ⏰ Applications closed
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
      ⏰ Applications close in {formatDeadline()} — {countdownStr} remaining
    </span>
  );
}

// ── Applications Closed page ──────────────────────────────────────────────────

function ApplicationsClosed({
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
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", fontWeight: 600 }}>Pre-Application</span>
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "40px 20px" : "60px 24px" }}>
          <div style={{ background: "white", borderRadius: 16, boxShadow: "0 12px 48px rgba(26,29,94,0.10)", padding: isMobile ? "40px 28px 36px" : "56px 64px 52px", maxWidth: 560, width: "100%", textAlign: "center", position: "relative", animation: "fadeUp 0.4s ease both" }}>
            <img src={pesoLogo} alt="PESO Capiz" style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 20, opacity: 0.85 }} />
            <div style={{ display: "inline-block", border: `4px solid ${COLORS.red}`, borderRadius: 10, padding: isMobile ? "8px 20px" : "10px 28px", marginBottom: 28, animation: "stampIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both", animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: isMobile ? "1.5rem" : "2rem", color: COLORS.red, letterSpacing: 3, textTransform: "uppercase", display: "block", transform: "rotate(-8deg)" }}>
                Applications Closed
              </span>
            </div>
            <p style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: COLORS.red, marginBottom: 10 }}>
              P.E.S.O. Capiz — Roxas City
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.5rem" : "1.9rem", color: COLORS.navy, lineHeight: 1.2, marginBottom: 14 }}>
              This job fair's application period has ended.
            </h1>
            <p style={{ color: COLORS.bodyText, fontSize: "0.92rem", lineHeight: 1.65, marginBottom: 28 }}>
              The deadline for submitting applications was{" "}
              <strong style={{ color: COLORS.navy }}>{formatDeadline()}</strong>.
              Please visit the PESO Capiz office or check back for future job fair announcements.
            </p>
            <div style={{ background: "rgba(26,29,94,0.04)", border: "1.5px solid rgba(26,29,94,0.09)", borderRadius: 10, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: COLORS.navy, marginBottom: 12 }}>
                Positions that were available
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {JOB_LISTINGS.map(job => (
                  <div key={job.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ color: COLORS.navy, fontWeight: 700, fontSize: "0.92rem", display: "block" }}>{job.position}</span>
                      <span style={{ color: COLORS.bodyText, fontSize: "0.82rem" }}>{job.company}&nbsp;•&nbsp;{job.location}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 0.5, color: COLORS.mutedText, background: "rgba(26,29,94,0.06)", borderRadius: 99, padding: "3px 10px", whiteSpace: "nowrap" }}>
                      {job.salaryRange}
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

// ── Root design component ─────────────────────────────────────────────────────

export default function JobsDesign({
  step,
  isMobile,
  form,
  chosenJobIds,
  jobResults,
  submitted,
  submitting,
  submitError,
  submitSuccess,
  qualifiedResults,
  notQualifiedResults,
  formTopRef,
  appliedJobIds,
  step1Attempted,
  emailVerified,
  onUpdateForm,
  onToggleSkill,
  onToggleLanguage,
  onToggleChosenJob,
  onEmailVerified,
  onChangeEmail,
  onNext,
  onBack,
  onSubmit,
  onNavigateHome,
}: JobsDesignProps) {

  if (isApplicationClosed()) {
    return <ApplicationsClosed isMobile={isMobile} onNavigateHome={onNavigateHome} />;
  }

  const anyQualified = qualifiedResults.length > 0;
  const allQualified = jobResults.length > 0 && jobResults.every(r => r.status === "qualified");

  const step1Issues = step1Attempted ? getStep1Issues(form) : [];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes stampIn {
          from { opacity: 0; transform: translate(-50%, -50%) rotate(-12deg) scale(1.6); }
          to   { opacity: 1; transform: translate(-50%, -50%) rotate(-12deg) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        body { font-family: 'Source Sans 3', sans-serif; background: #fdf8f0; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fdf8f0", padding: "0 0 80px" }}>

        <header style={{ background: COLORS.red, padding: "12px 24px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, minHeight: 34 }}>
            <button onClick={onNavigateHome} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
              <img src={pesoLogo} alt="PESO" style={{ width: 36, height: 36, objectFit: "contain" }} />
              <span style={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: 1 }}>P.E.S.O. Capiz</span>
            </button>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", fontWeight: 600 }}>Pre-Application</span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <StepPill number={1} label="Your Info" active={step === 1} done={step === 2} />
              <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.3)" }} />
              <StepPill number={2} label="Job Match" active={step === 2} done={false} />
            </div>
          </div>
          <div style={{ maxWidth: 1180, margin: "0 auto", marginTop: 8 }}>
            <DeadlineBadge />
          </div>
        </header>

        <div style={{ maxWidth: 1180, margin: "0 auto", padding: isMobile ? "24px 18px 0" : "40px 24px 0" }}>
          {step === 1 ? (
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
              <div ref={formTopRef} style={{ flex: isMobile ? "none" : "1 1 0%", order: isMobile ? 2 : 1 }}>
                <div key="step1" style={{ background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(26,29,94,0.08)", padding: isMobile ? "24px 20px" : "32px 36px", animation: "slideIn 0.3s ease both" }}>
                  <Step1Card
                    form={form}
                    step1Issues={step1Issues}
                    isMobile={isMobile}
                    emailVerified={emailVerified}
                    onUpdateForm={onUpdateForm}
                    onToggleLanguage={onToggleLanguage}
                    onNext={onNext}
                    onNavigateHome={onNavigateHome}
                    onEmailVerified={onEmailVerified}
                    onChangeEmail={onChangeEmail}
                  />
                </div>
              </div>
              <AvailableJobsReference isMobile={isMobile} />
            </div>
          ) : (
            <div ref={formTopRef}>
              <div key="step2" style={{ background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(26,29,94,0.08)", padding: isMobile ? "24px 20px" : "32px 36px", animation: "slideIn 0.3s ease both" }}>
                <Step2Card
                  form={form}
                  chosenJobIds={chosenJobIds}
                  jobResults={jobResults}
                  submitted={submitted}
                  submitting={submitting}
                  submitError={submitError}
                  submitSuccess={submitSuccess}
                  qualifiedResults={qualifiedResults}
                  notQualifiedResults={notQualifiedResults}
                  anyQualified={anyQualified}
                  allQualified={allQualified}
                  onUpdateForm={onUpdateForm}
                  onToggleSkill={onToggleSkill}
                  onToggleChosenJob={onToggleChosenJob}
                  onBack={onBack}
                  onSubmit={onSubmit}
                  onNavigateHome={onNavigateHome}
                  appliedJobIds={appliedJobIds}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Step pill ─────────────────────────────────────────────────────────────────

function StepPill({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? COLORS.green : active ? "white" : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: done ? "white" : active ? COLORS.red : "rgba(255,255,255,0.5)", flexShrink: 0, transition: "all 0.25s" }}>
        {done ? "✓" : number}
      </div>
      <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 0.5, color: active ? "white" : done ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)", transition: "color 0.25s" }}>
        {label}
      </span>
    </div>
  );
}

// ── Step 1 right panel ────────────────────────────────────────────────────────

function AvailableJobsReference({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ flex: isMobile ? "none" : "0 0 38%", order: isMobile ? 1 : 2 }}>
      <div style={{ position: "sticky", top: 24 }}>
        <div style={{ background: COLORS.navy, borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 32px rgba(26,29,94,0.18)" }}>
          <div style={{ padding: "22px 24px 18px" }}>
            <span style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.gold, marginBottom: 6 }}>
              For Reference
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "white", lineHeight: 1.2, margin: 0 }}>
              Available Positions
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {JOB_LISTINGS.map((j, i) => (
              <div key={j.id} style={{ padding: "16px 24px", borderTop: i === 0 ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ color: "white", fontWeight: 700, fontSize: "0.95rem", display: "block", marginBottom: 2 }}>{j.position}</span>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", display: "block", marginBottom: 12 }}>{j.company}&nbsp;•&nbsp;{j.location}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <RefRequirementRow label="Education" value={EDUCATION_LEVELS.find(e => e.rank === j.minEducationRank)?.label || "—"} />
                  <RefRequirementRow label="Education Background" value="School & Degree/Course required" />
                  <RefRequirementRow label="Skills" value={j.requiredSkills.join(", ")} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RefRequirementRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.8rem" }}>
      <span style={{ color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ── Step 1 card ───────────────────────────────────────────────────────────────

interface Step1CardProps {
  form: FormState;
  step1Issues: string[];
  isMobile: boolean;
  emailVerified: boolean;
  onUpdateForm: (patch: Partial<FormState>) => void;
  onToggleLanguage: (lang: string) => void;
  onNext: () => void;
  onNavigateHome: () => void;
  onEmailVerified: (email: string, token: string) => void;
  onChangeEmail: () => void;
}

function Step1Card({
  form, step1Issues, isMobile, emailVerified,
  onUpdateForm, onToggleLanguage, onNext, onNavigateHome,
  onEmailVerified, onChangeEmail,
}: Step1CardProps) {
  // Checks for EXACT issue messages returned by getStep1Issues, rather than
  // loose substring keywords. Substring matching previously caused false
  // positives — e.g. hasIssue("address") also matched the word "addresses"
  // inside the disposable-email message, which incorrectly put the Address
  // field into an error state whenever the Email field had an unrelated error.
  const hasIssue = (...exactMessages: string[]) =>
    exactMessages.some(msg => step1Issues.includes(msg));

  return (
    <>
      <span style={labelCaps}>Step 1 of 2</span>
      <h1 style={pageHeading}>Personal Information</h1>
      <p style={pageSubtext}>
        Please fill out the required details and information. Once all information is
        provided, click <strong>Next</strong> to match your qualifications with the available vacancies. Indicate{" "}
        <strong>N/A</strong> if not applicable. Prepare your updated resume.
      </p>

      {/* Nothing past this point is visible until the email is verified */}
      {!emailVerified ? (
        <EmailVerificationGate
          formLabel="Job Application"
          colors={COLORS}
          isMobile={isMobile}
          otpUrl={JOBS_SUBMIT_URL}
          onVerified={onEmailVerified}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="First Name" required style={{ flex: "1 1 200px" }} error={hasIssue("First name is required.") ? "First name is required." : undefined}>
              <input style={fieldInputStyle(hasIssue("First name is required."))} value={form.firstName} onChange={e => onUpdateForm({ firstName: e.target.value.toUpperCase() })} placeholder="JUAN" />
            </Field>
            <Field label="Middle Name" required style={{ flex: "1 1 160px" }} error={hasIssue("Middle name is required.") ? "Middle name is required." : undefined}>
              <input style={fieldInputStyle(hasIssue("Middle name is required."))} value={form.middleName} onChange={e => onUpdateForm({ middleName: e.target.value.toUpperCase() })} placeholder="SANTOS" />
            </Field>
            <Field label="Last Name" required style={{ flex: "1 1 200px" }} error={hasIssue("Last name is required.") ? "Last name is required." : undefined}>
              <input style={fieldInputStyle(hasIssue("Last name is required."))} value={form.lastName} onChange={e => onUpdateForm({ lastName: e.target.value.toUpperCase() })} placeholder="DELA CRUZ" />
            </Field>
          </div>

          {/* Email (verified, read-only) + Contact */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Email Address" required style={{ flex: "1 1 240px" }}>
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
            <Field label="Contact Number" required style={{ flex: "1 1 180px" }} error={hasIssue("Contact number is required.") ? "Contact number is required." : undefined}>
              <input style={fieldInputStyle(hasIssue("Contact number is required."))} value={form.contact} onChange={e => onUpdateForm({ contact: e.target.value.toUpperCase() })} placeholder="09XXXXXXXXX" />
            </Field>
          </div>

          <Field label="Address" required error={hasIssue("Address is required.") ? "Address is required." : undefined}>
            <input
            style={fieldInputStyle(hasIssue("Address is required."))}
            value={form.address}
            onChange={e => onUpdateForm({ address: e.target.value.toUpperCase() })}
            placeholder="BRGY., CITY/MUNICIPALITY, PROVINCE"
          />
          </Field>

          <SectionDivider title="Personal Profile" />

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Birthday" required style={{ flex: "1 1 180px" }} error={hasIssue("Birthday is required.") ? "Birthday is required." : undefined}>
              <input type="date" style={fieldInputStyle(hasIssue("Birthday is required."))} value={form.birthday} onChange={e => onUpdateForm({ birthday: e.target.value })} />
            </Field>
            <Field label="Gender" required style={{ flex: "1 1 180px" }} error={hasIssue("Gender is required.") ? "Gender is required." : undefined}>
              <select style={fieldInputStyle(hasIssue("Gender is required."))} value={form.gender} onChange={e => onUpdateForm({ gender: e.target.value })}>
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Civil Status" required style={{ flex: "1 1 180px" }} error={hasIssue("Civil status is required.") ? "Civil status is required." : undefined}>
              <select style={fieldInputStyle(hasIssue("Civil status is required."))} value={form.civilStatus} onChange={e => onUpdateForm({ civilStatus: e.target.value })}>
                <option value="">Select civil status</option>
                {CIVIL_STATUS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Disability" required style={{ flex: "1 1 180px" }} error={hasIssue("Please indicate if you have a disability.") ? "Please indicate if you have a disability." : undefined}>
              <select style={fieldInputStyle(hasIssue("Please indicate if you have a disability."))} value={form.hasDisability} onChange={e => onUpdateForm({ hasDisability: e.target.value, ...(e.target.value !== "Yes" ? { disabilityDetails: "" } : {}) })}>
                <option value="">Select an option</option>
                {DISABILITY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            {form.hasDisability === "Yes" && (
              <Field label="Please specify (optional)" style={{ flex: "2 1 240px" }}>
                <input style={inputStyle} value={form.disabilityDetails} onChange={e => onUpdateForm({ disabilityDetails: e.target.value.toUpperCase() })} placeholder="E.G. VISUAL IMPAIRMENT, MOBILITY IMPAIRMENT, ETC." />
              </Field>
            )}
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Employment Status" required style={{ flex: "1 1 180px" }} error={hasIssue("Employment status is required.") ? "Employment status is required." : undefined}>
              <select style={fieldInputStyle(hasIssue("Employment status is required."))} value={form.employmentStatus} onChange={e => onUpdateForm({ employmentStatus: e.target.value })}>
                <option value="">Select status</option>
                {EMPLOYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Are you an OFW?" required style={{ flex: "1 1 180px" }} error={hasIssue("OFW status is required.") ? "OFW status is required." : undefined}>
              <select style={fieldInputStyle(hasIssue("OFW status is required."))} value={form.ofwStatus} onChange={e => onUpdateForm({ ofwStatus: e.target.value })}>
                <option value="">Select status</option>
                {OFW_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="4Ps Beneficiary" required hint="Pantawid Pamilyang Pilipino Program" style={{ flex: "1 1 180px" }} error={hasIssue("Please indicate if you are a 4Ps beneficiary.") ? "Please indicate if you are a 4Ps beneficiary." : undefined}>
              <select style={fieldInputStyle(hasIssue("Please indicate if you are a 4Ps beneficiary."))} value={form.fourPsBeneficiary} onChange={e => onUpdateForm({ fourPsBeneficiary: e.target.value })}>
                <option value="">Select an option</option>
                {FOUR_PS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <SectionDivider title="Job Preferences" />

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Preferred Occupation" required style={{ flex: "1 1 240px" }} error={hasIssue("Preferred occupation is required.") ? "Preferred occupation is required." : undefined}>
              <input style={fieldInputStyle(hasIssue("Preferred occupation is required."))} value={form.preferredOccupation} onChange={e => onUpdateForm({ preferredOccupation: e.target.value.toUpperCase() })} placeholder="E.G. CASHIER, OFFICE STAFF, DRIVER" />
            </Field>
            <Field label="Preferred Work Location" required style={{ flex: "1 1 240px" }} error={hasIssue("Preferred work location is required.") ? "Preferred work location is required." : undefined}>
              <input style={fieldInputStyle(hasIssue("Preferred work location is required."))} value={form.preferredWorkLocation} onChange={e => onUpdateForm({ preferredWorkLocation: e.target.value.toUpperCase() })} placeholder="E.G. ROXAS CITY, CAPIZ" />
            </Field>
          </div>

          <Field label="Language Proficiency" required error={hasIssue("Please select at least one language you're proficient in.") ? "Please select at least one language you're proficient in." : undefined}>
            <p style={{ color: COLORS.bodyText, fontSize: "0.85rem", marginBottom: 10, marginTop: -4 }}>
              Select all languages you can speak/write proficiently.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {LANGUAGE_OPTIONS.map(lang => {
                const checked = form.languages.includes(lang);
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
              <input style={{ ...inputStyle, marginTop: 10, border: hasIssue("Please specify your other language(s).") ? "1.5px solid #c0151a" : inputStyle.border as string }} value={form.otherLanguage} onChange={e => onUpdateForm({ otherLanguage: e.target.value.toUpperCase() })} placeholder="PLEASE SPECIFY OTHER LANGUAGE(S)" />
            )}
          </Field>

          {step1Issues.length > 0 && (
            <div style={{ background: "rgba(192,21,26,0.05)", border: "1.5px solid rgba(192,21,26,0.2)", borderRadius: 10, padding: "14px 18px", animation: "fadeUp 0.25s ease both" }}>
              <p style={{ color: COLORS.red, fontWeight: 700, fontSize: "0.85rem", marginBottom: 6 }}>Please fix the following before continuing:</p>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {step1Issues.map((issue, i) => (
                  <li key={i} style={{ color: COLORS.bodyText, fontSize: "0.83rem", lineHeight: 1.5 }}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" onClick={onNext} style={primaryButtonStyle(false)}
              onMouseEnter={e => { e.currentTarget.style.background = COLORS.redHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = COLORS.red; }}>
              Next: Job Matching
              <span style={{ fontSize: "1rem" }}>→</span>
            </button>
            <button type="button" onClick={onNavigateHome}
              style={{ background: "transparent", border: "1.5px solid rgba(26,29,94,0.15)", color: COLORS.navy, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "13px 20px", borderRadius: 8, fontWeight: 700, fontSize: "0.88rem", fontFamily: "'Source Sans 3', sans-serif", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,29,94,0.04)"; e.currentTarget.style.borderColor = "rgba(26,29,94,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(26,29,94,0.15)"; }}>
              🏠 Back to Home
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Step 2 card ───────────────────────────────────────────────────────────────

interface Step2CardProps {
  form: FormState;
  chosenJobIds: string[];
  jobResults: JobResult[];
  submitted: boolean;
  submitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  qualifiedResults: JobResult[];
  notQualifiedResults: JobResult[];
  anyQualified: boolean;
  allQualified: boolean;
  onUpdateForm: (patch: Partial<FormState>) => void;
  onToggleSkill: (skill: string) => void;
  onToggleChosenJob: (id: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onNavigateHome: () => void;
  appliedJobIds: string[];
}

function Step2Card({
  form, chosenJobIds, jobResults, submitted, submitting, submitError, submitSuccess,
  qualifiedResults, notQualifiedResults, anyQualified, allQualified,
  onUpdateForm, onToggleSkill, onToggleChosenJob, onBack, onSubmit, onNavigateHome, appliedJobIds,
}: Step2CardProps) {
  const resumeTrimmed = form.resumeLink.trim();
  const resumeValid   = !!resumeTrimmed && isValidGDriveLink(resumeTrimmed);

  const submitDisabled =
    chosenJobIds.length === 0 ||
    submitting ||
    !form.consentGiven ||
    !resumeValid;

  const consentError = submitted && !form.consentGiven;
  const schoolError  = submitted && !form.school.trim();
  const degreeError  = submitted && !form.degree.trim();
  const resumeError  = submitted && !resumeValid;

  const educationOptions = EDUCATION_LEVELS.map(lvl => ({
    value: String(lvl.rank),
    label: lvl.label,
  }));

  const navBtnBase: React.CSSProperties = {
    background: "transparent", border: "1.5px solid rgba(26,29,94,0.15)",
    color: COLORS.navy, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 7, fontWeight: 700, fontSize: "0.82rem",
    fontFamily: "'Source Sans 3', sans-serif", transition: "all 0.15s",
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button type="button" onClick={onBack} style={navBtnBase}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,29,94,0.04)"; e.currentTarget.style.borderColor = "rgba(26,29,94,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(26,29,94,0.15)"; }}>
          ← Back to Your Info
        </button>
        <button type="button" onClick={onNavigateHome} style={navBtnBase}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,29,94,0.04)"; e.currentTarget.style.borderColor = "rgba(26,29,94,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(26,29,94,0.15)"; }}>
          🏠 Back to Home
        </button>
      </div>

      <span style={labelCaps}>Step 2 of 2</span>
      <h1 style={pageHeading}>Job Matching and Referral</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        <SectionDivider title="Eligibility Info" />

        <Field label="Educational Attainment" required>
          <ScrollSelect
            value={form.education === 0 ? "" : String(form.education)}
            placeholder="Select your highest attainment"
            options={educationOptions}
            onChange={v => onUpdateForm({ education: v === "" ? 0 : Number(v) })}
            hasError={false}
            visibleRows={6}
          />
        </Field>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Field label="School" required style={{ flex: "1 1 240px" }} error={schoolError ? "School name is required." : undefined}>
            <input style={fieldInputStyle(schoolError)} value={form.school} onChange={e => onUpdateForm({ school: e.target.value })} placeholder="e.g. Filamer Christian University" />
          </Field>

          {/* ── NEW: DegreeCombobox replaces ScrollCombobox ── */}
          <Field
            label="Degree / Course"
            required
            hint="Pick from list or type your own"
            style={{ flex: "1 1 240px" }}
            error={degreeError ? "Degree/Course is required." : undefined}
          >
            <DegreeCombobox
              value={form.degree}
              onChange={v => onUpdateForm({ degree: v })}
              hasError={degreeError}
            />
          </Field>
        </div>

        <Field
          label="Resume (Google Drive Link)"
          required
          hint="Must be set to 'Anyone with the link'"
          error={
            resumeError
              ? (!resumeTrimmed
                  ? "Resume link is required."
                  : "Resume link must be a valid Google Drive link.")
              : undefined
          }
        >
          <div style={{ position: "relative" }}>
            <input
              style={{ ...inputStyle, paddingRight: resumeTrimmed ? "40px" : "14px", border: resumeError ? "1.5px solid #c0151a" : resumeTrimmed ? resumeValid ? "1.5px solid #3fae5a" : "1.5px solid #c0151a" : inputBorder, transition: "border-color 0.2s" }}
              value={form.resumeLink}
              onChange={e => onUpdateForm({ resumeLink: e.target.value })}
              placeholder="https://drive.google.com/file/d/…"
            />
            {resumeTrimmed && (
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: "1rem", lineHeight: 1, pointerEvents: "none" }}>
                {resumeValid ? "✅" : "❌"}
              </span>
            )}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: COLORS.mutedText, lineHeight: 1.5 }}>
            Go to <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.navy, fontWeight: 600 }}>Google Drive</a>{" "}
            → right-click your resume → <em>Share</em> → <em>"Anyone with the link"</em> → copy &amp; paste here.
          </p>
        </Field>

        <Field label="Available Vacancies" required>
          <p style={{ color: COLORS.bodyText, fontSize: "0.85rem", marginBottom: 10, marginTop: -4 }}>
            Select all Vacancies you'd like to apply for. Checking a position reveals its details and lets you confirm the related skills.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {JOB_LISTINGS.map(j => (
              <JobOptionCard
                key={j.id}
                job={j}
                isChosen={chosenJobIds.includes(j.id)}
                isApplied={appliedJobIds.includes(j.id)}
                result={jobResults.find(r => r.jobId === j.id) ?? null}
                form={form}
                onToggleChosenJob={onToggleChosenJob}
                onToggleSkill={onToggleSkill}
              />
            ))}
          </div>
          {submitted && chosenJobIds.length === 0 && (
            <p style={{ color: COLORS.red, fontSize: "0.82rem", marginTop: 8 }}>Please select at least one position.</p>
          )}
        </Field>

        <SectionDivider title="Data Privacy Consent" />

        <ConsentBox
          checked={form.consentGiven}
          onChange={checked => onUpdateForm({ consentGiven: checked })}
          highlightError={consentError}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitDisabled}
          style={primaryButtonStyle(submitDisabled)}
          onMouseEnter={e => { if (!submitDisabled) e.currentTarget.style.background = COLORS.redHover; }}
          onMouseLeave={e => { if (!submitDisabled) e.currentTarget.style.background = COLORS.red; }}>
          {submitting && (
            <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          )}
          {submitting ? "Submitting…" : "Submit Application"}
        </button>

        {!submitted && chosenJobIds.length > 0 && (!resumeValid || !form.consentGiven) && (
          <p style={{ color: COLORS.mutedText, fontSize: "0.8rem", marginTop: -4 }}>
            {!resumeValid && !form.consentGiven
              ? "Please provide a valid resume link and agree to the Data Privacy Consent above to enable submission."
              : !resumeValid
                ? "Please provide a valid Google Drive resume link above to enable submission."
                : "Please agree to the Data Privacy Consent above to enable submission."}
          </p>
        )}
      </div>

      {jobResults.length > 0 && (
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          {allQualified && (
            <ResultsBanner tone="success">
              <h4 style={resultsHeading(COLORS.greenText)}>
                You qualify for all {qualifiedResults.length > 1 ? `${qualifiedResults.length} selected positions` : "the selected position"}!
              </h4>
              <JobResultList results={qualifiedResults} color={COLORS.greenText} prefix="" />
              {submitting && <p style={{ color: COLORS.bodyText, fontSize: "0.88rem", lineHeight: 1.6, margin: "12px 0 0" }}>Submitting your application…</p>}
              {submitSuccess && (
                <>
                  <p style={{ color: COLORS.greenText, fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.6, margin: "12px 0 10px" }}>
                    ✅ Your application has been submitted! Please check your email for confirmation.
                  </p>
                  <button type="button" onClick={onNavigateHome}
                    style={{ background: COLORS.navy, color: "white", border: "none", padding: "10px 22px", borderRadius: 8, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif", transition: "background 0.2s", letterSpacing: 0.3 }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#12154a"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = COLORS.navy; }}>
                    🏠 Back to Home
                  </button>
                </>
              )}
              {submitError && <p style={{ color: COLORS.red, fontSize: "0.88rem", lineHeight: 1.6, margin: "12px 0 0" }}>⚠️ We couldn't submit your application ({submitError}). Please try again.</p>}
            </ResultsBanner>
          )}

          {anyQualified && !allQualified && (
            <ResultsBanner tone="warning">
              <h4 style={resultsHeading(COLORS.amberText)}>
                You qualify for {qualifiedResults.length} of {jobResults.length} selected positions — but you must qualify for all to proceed.
              </h4>
              <JobResultList results={qualifiedResults} color={COLORS.greenText} prefix="✓ " />
              <p style={{ color: COLORS.bodyText, fontSize: "0.85rem", marginTop: 4, marginBottom: 0 }}>
                Fix the issues below for the remaining position(s), or deselect them if you only want to apply for the ones you qualify for.
              </p>
            </ResultsBanner>
          )}

          {notQualifiedResults.length > 0 && (
            <ResultsBanner tone="error">
              <h4 style={resultsHeading(COLORS.red, 12)}>
                {notQualifiedResults.length === 1 ? "You don't meet the requirements for 1 position yet:" : `You don't meet the requirements for ${notQualifiedResults.length} positions yet:`}
              </h4>
              {notQualifiedResults.map(r => {
                const j = JOB_LISTINGS.find(jj => jj.id === r.jobId)!;
                return (
                  <div key={r.jobId} style={{ marginBottom: 14 }}>
                    <p style={{ color: COLORS.navy, fontWeight: 700, fontSize: "0.88rem", marginBottom: 6 }}>{j.position} at {j.company}</p>
                    <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                      {r.issues.map((issue, i) => <li key={i} style={{ color: COLORS.bodyText, fontSize: "0.85rem", lineHeight: 1.5 }}>{issue}</li>)}
                    </ul>
                  </div>
                );
              })}
              <p style={{ color: COLORS.bodyText, fontSize: "0.85rem", marginTop: 4, marginBottom: 0 }}>You can go back and update your details, then check again.</p>
            </ResultsBanner>
          )}
        </div>
      )}
    </>
  );
}

// ── Job option card ───────────────────────────────────────────────────────────

function JobOptionCard({ job, isChosen, isApplied, result, form, onToggleChosenJob, onToggleSkill }: {
  job: JobListing; isChosen: boolean; isApplied: boolean; result: JobResult | null;
  form: FormState; onToggleChosenJob: (id: string) => void; onToggleSkill: (skill: string) => void;
}) {
  const [appliedExpanded, setAppliedExpanded] = useState(true);

  const borderColor = isApplied ? "rgba(63,174,90,0.5)"
    : result ? result.status === "qualified" ? "rgba(63,174,90,0.5)" : "rgba(192,21,26,0.35)"
    : isChosen ? "rgba(26,29,94,0.25)" : "rgba(26,29,94,0.1)";
  const bgColor = isApplied ? "rgba(63,174,90,0.06)"
    : result ? result.status === "qualified" ? "rgba(63,174,90,0.05)" : "rgba(192,21,26,0.04)"
    : isChosen ? "rgba(26,29,94,0.04)" : "transparent";

  const showExpanded = isApplied ? appliedExpanded : isChosen;
  const matchPercent = getMatchPercent(job, form);

  return (
    <div style={{ border: `1.5px solid ${borderColor}`, borderRadius: 8, background: bgColor, transition: "all 0.18s", overflow: "hidden", opacity: isApplied ? 0.85 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", cursor: isApplied ? "default" : "pointer" }}
        onClick={() => { if (isApplied) setAppliedExpanded(v => !v); }}>
        {isApplied ? (
          <span style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2, background: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "white", fontWeight: 900 }}>✓</span>
        ) : (
          <input type="checkbox" checked={isChosen} onChange={() => onToggleChosenJob(job.id)} onClick={e => e.stopPropagation()} style={{ width: 18, height: 18, accentColor: COLORS.navy, cursor: "pointer", marginTop: 2, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <span style={{ color: COLORS.navy, fontWeight: 700, fontSize: "0.92rem", display: "block" }}>{job.position}</span>
          <span style={{ color: COLORS.bodyText, fontSize: "0.82rem" }}>{job.company}&nbsp;•&nbsp;{job.salaryRange}</span>
        </div>
        {isApplied ? (
          <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", padding: "3px 10px", borderRadius: 99, color: COLORS.greenText, background: "rgba(63,174,90,0.12)", flexShrink: 0, alignSelf: "center" }}>✓ Applied</span>
        ) : result ? (
          <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", padding: "3px 10px", borderRadius: 99, color: result.status === "qualified" ? COLORS.greenText : COLORS.red, background: result.status === "qualified" ? "rgba(63,174,90,0.1)" : "rgba(192,21,26,0.08)", flexShrink: 0, alignSelf: "center" }}>
            {result.status === "qualified" ? "✓ Qualified" : "✕ Not Qualified"}
          </span>
        ) : null}
        {isApplied && <span style={{ color: COLORS.mutedText, fontSize: "0.75rem", alignSelf: "center", flexShrink: 0, marginLeft: 2 }}>{appliedExpanded ? "▲" : "▼"}</span>}
      </div>

      {showExpanded && (
        <div style={{ padding: "4px 14px 16px 44px", animation: "expandDown 0.2s ease both" }}>
          <p style={{ color: COLORS.bodyText, fontSize: "0.86rem", lineHeight: 1.6, margin: "0 0 14px" }}>{job.description}</p>

          {!isApplied && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ color: COLORS.navy, fontSize: "0.7rem", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800 }}>Eligibility Match</span>
                <span style={{ color: COLORS.red, fontWeight: 800, fontSize: "0.95rem" }}>{matchPercent}%</span>
              </div>
              <div style={{ height: 7, borderRadius: 5, background: "rgba(26,29,94,0.1)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${matchPercent}%`, background: matchPercent === 100 ? COLORS.green : COLORS.gold, transition: "width 0.35s ease, background 0.35s ease", borderRadius: 5 }} />
              </div>
            </div>
          )}

          <div style={{ background: "rgba(26,29,94,0.04)", border: "1px solid rgba(26,29,94,0.08)", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
            <h5 style={microLabel}>Requirements</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
              <RequirementRow label="Education" value={EDUCATION_LEVELS.find(e => e.rank === job.minEducationRank)?.label || "—"} />
              <EducationBackgroundStatusRow school={form.school} degree={form.degree} />
              <RequirementRow label="Other" value={job.requiredSkills.join(", ")} />
              <ResumeStatusRow resumeLink={form.resumeLink} />
            </ul>
          </div>

          <div>
            <p style={microLabel}>(please check if you possess the skills required for the position)</p>
            {isApplied && <p style={{ color: COLORS.greenText, fontSize: "0.8rem", fontWeight: 600, marginBottom: 8 }}>✓ You have already submitted an application for this position.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {job.requiredSkills.map(skill => (
                <label key={skill} style={{ display: "flex", alignItems: "center", gap: 10, cursor: isApplied ? "default" : "pointer", fontSize: "0.9rem", color: isApplied ? COLORS.mutedText : COLORS.navy, fontWeight: 600 }}>
                  <input type="checkbox" checked={isApplied ? true : form.skills.includes(skill)} disabled={isApplied} onChange={() => { if (!isApplied) onToggleSkill(skill); }} style={{ width: 17, height: 17, accentColor: isApplied ? COLORS.green : COLORS.red, cursor: isApplied ? "default" : "pointer" }} />
                  {skill}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Results banner ────────────────────────────────────────────────────────────

const RESULT_TONES = {
  success: { bg: "rgba(63,174,90,0.07)", border: "rgba(63,174,90,0.3)" },
  warning: { bg: "rgba(245,200,66,0.08)", border: "rgba(245,200,66,0.4)" },
  error:   { bg: "rgba(192,21,26,0.06)", border: "rgba(192,21,26,0.25)" },
} as const;

function ResultsBanner({ tone, children }: { tone: keyof typeof RESULT_TONES; children: React.ReactNode }) {
  const { bg, border } = RESULT_TONES[tone];
  return <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 10, padding: "18px 22px", animation: "fadeUp 0.3s ease both" }}>{children}</div>;
}

function resultsHeading(color: string, marginBottom = 6): React.CSSProperties {
  return { color, fontSize: "0.95rem", fontWeight: 800, marginBottom };
}

function JobResultList({ results, color, prefix }: { results: JobResult[]; color: string; prefix: string }) {
  return (
    <ul style={{ margin: "0 0 12px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
      {results.map(r => {
        const j = JOB_LISTINGS.find(jj => jj.id === r.jobId)!;
        return <li key={r.jobId} style={{ color, fontSize: "0.88rem", fontWeight: 600 }}>{prefix}{j.position} at {j.company}</li>;
      })}
    </ul>
  );
}

// ── Small reusable subcomponents ──────────────────────────────────────────────

function Field({ label, required, hint, style, error, children }: { label: string; required?: boolean; hint?: string; style?: React.CSSProperties; error?: string; children: React.ReactNode }) {
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

function fieldInputStyle(hasError: boolean): React.CSSProperties {
  return { ...inputStyle, border: hasError ? "1.5px solid #c0151a" : inputBorder };
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0 -4px" }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: COLORS.red, whiteSpace: "nowrap" }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(26,29,94,0.1)" }} />
    </div>
  );
}

function ConsentBox({ checked, onChange, highlightError }: { checked: boolean; onChange: (checked: boolean) => void; highlightError: boolean }) {
  return (
    <div style={{ background: "rgba(26,29,94,0.03)", border: `1.5px solid ${highlightError ? COLORS.red : "rgba(26,29,94,0.12)"}`, borderRadius: 10, padding: "16px 18px", transition: "border-color 0.2s" }}>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 18, height: 18, accentColor: COLORS.red, cursor: "pointer", marginTop: 2, flexShrink: 0 }} />
        <span style={{ color: COLORS.navy, fontSize: "0.85rem", lineHeight: 1.65 }}>
          This is to certify that all data/information that I have provided in this form are true to the best of my knowledge. This is also to authorize PESO to include my profile in the PESO Employment Information System and use my personal information for employment facilitation in accordance with R.A. No. 10173 of 2012. I am also aware that PESO is not obliged to seek employment on my behalf.
          <span style={{ color: COLORS.red }}> *</span>
        </span>
      </label>
      {highlightError && <p style={{ color: COLORS.red, fontSize: "0.8rem", marginTop: 8, marginBottom: 0, marginLeft: 30 }}>Please check this box to continue.</p>}
    </div>
  );
}

function ResumeStatusRow({ resumeLink }: { resumeLink: string }) {
  const empty = !resumeLink.trim();
  const valid = !empty && isValidGDriveLink(resumeLink.trim());
  return (
    <li style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: "0.84rem" }}>
      <span style={{ color: COLORS.bodyText }}>Resume</span>
      <span style={{ color: empty ? COLORS.mutedText : valid ? COLORS.greenText : COLORS.red, fontWeight: 600, textAlign: "right", transition: "color 0.2s" }}>
        {empty ? "Not provided" : valid ? "✅ Valid Google Drive link" : "❌ Not a valid Drive link"}
      </span>
    </li>
  );
}

function EducationBackgroundStatusRow({ school, degree }: { school: string; degree: string }) {
  const complete = !!school.trim() && !!degree.trim();
  return (
    <li style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: "0.84rem" }}>
      <span style={{ color: COLORS.bodyText }}>Education Background</span>
      <span style={{ color: complete ? COLORS.greenText : COLORS.mutedText, fontWeight: 600, textAlign: "right", transition: "color 0.2s" }}>
        {complete ? "✅ School & Degree provided" : "School & Degree required below"}
      </span>
    </li>
  );
}

function RequirementRow({ label, value }: { label: string; value: string }) {
  return (
    <li style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: "0.84rem" }}>
      <span style={{ color: COLORS.bodyText }}>{label}</span>
      <span style={{ color: COLORS.navy, fontWeight: 600, textAlign: "right" }}>{value}</span>
    </li>
  );
}