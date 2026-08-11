import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CalendarEvent {
  date: string;      // "MM-DD" repeats yearly, "YYYY-MM-DD" one-time
  title: string;
  description: string;
  type: "deadline" | "opening" | "reminder" | "holiday";
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PESO_NAVY = "#1a1d5e";
const PESO_RED  = "#c0151a";
const PESO_GOLD = "#e8a800";

const TYPE_STYLE: Record<CalendarEvent["type"], { bg: string; color: string; dot: string; label: string }> = {
  deadline: { bg: "#fff1f2", color: "#c0151a", dot: "#c0151a", label: "Deadline" },
  opening:  { bg: "#f0fdf4", color: "#15803d", dot: "#15803d", label: "Opening"  },
  reminder: { bg: "#eff6ff", color: "#1d4ed8", dot: "#1d4ed8", label: "Reminder" },
  holiday:  { bg: "rgba(232,168,0,0.12)", color: "#92660a", dot: "#e8a800", label: "Holiday" },
};

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  HOW TO ADD / EDIT REMINDERS
//
//  Each entry has 4 fields:
//    date        → "MM-DD"      repeats every year  (e.g. "05-01" = every May 1)
//                  "YYYY-MM-DD" one-time only        (e.g. "2026-04-10")
//    title       → Short name shown on the calendar cell
//    description → Full text shown inside the popup modal
//    type        → One of: "opening" | "deadline" | "reminder" | "holiday"
//
//  EXAMPLES:
//    { date: "03-20", title: "JobStart Orientation", description: "...", type: "reminder" }
//    { date: "2026-07-04", title: "Special Job Fair", description: "...", type: "reminder" }
//
//  To DELETE an entry just remove the whole { } block.
//  To ADD an entry just append a new { } block inside the array below.
// ─────────────────────────────────────────────────────────────────────────────

const STATIC_EVENTS: CalendarEvent[] = [
  // ── SPES ──────────────────────────────────────────────────────────────────
  {
    date: "01-05",
    title: "SPES Application Opens",
    description: "Special Program for Employment of Students application period begins. Eligible students may submit requirements to the PESO office.",
    type: "opening",
  },
  {
    date: "02-28",
    title: "SPES Application Deadline",
    description: "Last day to submit SPES applications for the summer cycle. Late applications will not be accepted.",
    type: "deadline",
  },
  {
    date: "06-01",
    title: "SPES Christmas Cycle Opens",
    description: "SPES application period for the Christmas break employment cycle begins.",
    type: "opening",
  },
  {
    date: "09-30",
    title: "SPES Christmas Cycle Deadline",
    description: "Deadline for SPES Christmas cycle applications.",
    type: "deadline",
  },

  // ── GIP ───────────────────────────────────────────────────────────────────
  {
    date: "02-01",
    title: "GIP Application Opens",
    description: "Government Internship Program application period starts. Open to currently enrolled college students.",
    type: "opening",
  },
  {
    date: "03-15",
    title: "GIP Application Deadline",
    description: "Last day to file GIP applications. Slots are limited — submit early.",
    type: "deadline",
  },

  // ── TUPAD ─────────────────────────────────────────────────────────────────
  {
    date: "03-01",
    title: "TUPAD Registration",
    description: "Tulong Panghanapbuhay sa Ating Disadvantaged/Displaced Workers registration opens for informal economy workers.",
    type: "opening",
  },

  // ── Job Fairs ─────────────────────────────────────────────────────────────
  {
    date: "04-25",
    title: "PESO Job Fair",
    description: "Annual PESO Roxas City Job Fair. Hundreds of employers expected. Bring updated resume and valid ID.",
    type: "reminder",
  },
  {
    date: "10-15",
    title: "PESO Job Fair (2nd)",
    description: "Second annual job fair of the year. Open to all job seekers. No registration fee.",
    type: "reminder",
  },

  // ── Holidays ──────────────────────────────────────────────────────────────
  {
    date: "05-01",
    title: "Labor Day",
    description: "Philippine Labor Day — PESO office closed. Public holiday.",
    type: "holiday",
  },
  {
    date: "12-25",
    title: "Christmas Day",
    description: "PESO office closed.",
    type: "holiday",
  },
  {
    date: "01-01",
    title: "New Year's Day",
    description: "PESO office closed.",
    type: "holiday",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Returns events that fall in the given year+month (month is 1-indexed)
const getEventsForMonth = (
  year: number,
  month: number,
): (CalendarEvent & { day: number })[] => {
  const results: (CalendarEvent & { day: number })[] = [];

  STATIC_EVENTS.forEach((ev) => {
    let day: number | null = null;

    if (ev.date.length === 5) {
      // "MM-DD" — repeats every year
      const [mm, dd] = ev.date.split("-").map(Number);
      if (mm === month) day = dd;
    } else {
      // "YYYY-MM-DD" — one-time
      const [yy, mm, dd] = ev.date.split("-").map(Number);
      if (yy === year && mm === month) day = dd;
    }

    if (day !== null) results.push({ ...ev, day });
  });

  return results.sort((a, b) => a.day - b.day);
};

// ── Day Detail Modal ──────────────────────────────────────────────────────────

function DayModal({
  day,
  month,
  year,
  events,
  onClose,
}: {
  day: number;
  month: number;
  year: number;
  events: (CalendarEvent & { day: number })[];
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1001,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}>
        <div style={{
          background: "white", borderRadius: 16,
          width: "100%", maxWidth: 460,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          overflow: "hidden", animation: "modalIn 0.2s ease",
          maxHeight: "85vh", display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            background: PESO_NAVY, padding: "18px 24px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexShrink: 0,
          }}>
            <div>
              <p style={{
                color: PESO_GOLD, fontSize: "0.68rem", fontWeight: 700,
                letterSpacing: 2, textTransform: "uppercase", margin: "0 0 3px",
              }}>
                CDSP Reminders
              </p>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                color: "white", fontSize: "1.2rem", margin: 0,
              }}>
                {MONTH_NAMES[month - 1]} {day}, {year}
              </h2>
            </div>
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

          {/* Events list */}
          <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
            {events.map((ev, i) => {
              const ts = TYPE_STYLE[ev.type];
              return (
                <div key={i} style={{
                  background: ts.bg, borderRadius: 10,
                  padding: "14px 16px", marginBottom: 12,
                  borderLeft: `4px solid ${ts.dot}`,
                }}>
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 700,
                    letterSpacing: 1, textTransform: "uppercase",
                    color: ts.color,
                    background: "rgba(255,255,255,0.6)",
                    padding: "2px 8px", borderRadius: 10,
                    display: "inline-block", marginBottom: 6,
                  }}>
                    {ts.label}
                  </span>
                  <p style={{
                    fontWeight: 700, color: PESO_NAVY,
                    fontSize: "0.92rem", margin: "0 0 5px",
                  }}>
                    {ev.title}
                  </p>
                  <p style={{
                    fontSize: "0.84rem", color: "#5a5a7a",
                    margin: 0, lineHeight: 1.6,
                  }}>
                    {ev.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: "14px 24px", borderTop: "1px solid #f0f0f4",
            display: "flex", justifyContent: "flex-end", flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                background: PESO_NAVY, color: "white",
                border: "none", borderRadius: 8,
                padding: "10px 24px", fontWeight: 700,
                fontSize: "0.88rem", cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const CdspSchedulePage: React.FC = () => {
  const navigate    = useNavigate();
  const today       = new Date();

  const [year, setYear]           = useState(today.getFullYear());
  const [month, setMonth]         = useState(today.getMonth() + 1); // 1-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isMobile, setIsMobile]   = useState(
    () => window.matchMedia("(max-width: 640px)").matches
  );

  // Track mobile breakpoint
  React.useEffect(() => {
    const mq     = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ── Calendar grid helpers ──────────────────────────────────────────────────

  const monthEvents   = getEventsForMonth(year, month);
  const firstDow      = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const daysInMonth   = new Date(year, month, 0).getDate();

  // Build flat array: nulls for leading empty cells, then 1..daysInMonth
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const eventsForDay  = (day: number) => monthEvents.filter((e) => e.day === day);
  const isToday       = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
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
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#f4f4f6",
        fontFamily: "'Source Sans 3', sans-serif",
      }}>

        {/* ── Page Header ── */}
        <div style={{
          background: PESO_NAVY,
          padding: isMobile ? "32px 20px 28px" : "48px 32px 40px",
          borderBottom: `4px solid ${PESO_GOLD}`,
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            {/* Back button */}
            <button
              onClick={() => navigate("/")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.1)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                borderRadius: 8, padding: "7px 14px",
                color: "rgba(255,255,255,0.85)", fontSize: "0.8rem",
                fontWeight: 600, cursor: "pointer", marginBottom: 20,
                letterSpacing: 0.3, fontFamily: "'Source Sans 3', sans-serif",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              }}
            >
              ← Back to Home
            </button>

            <p style={{
              color: PESO_GOLD, fontSize: "0.72rem", fontWeight: 700,
              letterSpacing: 3, textTransform: "uppercase", margin: "0 0 8px",
            }}>
              Career Development Support
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif", color: "white",
              fontSize: isMobile ? "1.8rem" : "clamp(1.8rem, 3.5vw, 2.8rem)",
              margin: "0 0 10px", lineHeight: 1.2,
            }}>
              CDSP Schedule
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.65)", fontSize: "0.95rem",
              fontWeight: 300, margin: 0,
              maxWidth: isMobile ? "100%" : 520,
            }}>
              Key dates for PESO programs — application periods, deadlines,
              job fairs, and public holidays. Click any highlighted date to
              view details.
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: isMobile ? "24px 12px" : "40px 24px",
        }}>

          {/* Legend */}
          <div style={{
            display: "flex", gap: isMobile ? 12 : 20,
            flexWrap: isMobile ? "nowrap" : "wrap",
            overflowX: isMobile ? "auto" : "visible",
            marginBottom: 24, alignItems: "center",
            paddingBottom: isMobile ? 4 : 0,
          }}>
            <span style={{
              fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8",
              letterSpacing: 1, textTransform: "uppercase", flexShrink: 0,
            }}>
              Type:
            </span>
            {Object.entries(TYPE_STYLE).map(([key, val]) => (
              <span key={key} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: "0.78rem", fontWeight: 600,
                color: val.color, flexShrink: 0,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: val.dot, display: "inline-block",
                }} />
                {val.label}
              </span>
            ))}
            {!isMobile && (
              <span style={{
                marginLeft: "auto", fontSize: "0.8rem",
                color: "#94a3b8", fontStyle: "italic",
              }}>
                Click any highlighted date to view details
              </span>
            )}
          </div>

          {/* ── Wall Calendar ── */}
          <div style={{
            background: "white",
            borderRadius: isMobile ? 12 : 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}>

            {/* Month navigation header */}
            <div style={{
              background: PESO_NAVY, padding: "16px 24px",
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
            }}>
              <button
                onClick={prevMonth}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 8, width: 36, height: 36,
                  color: "white", fontSize: "1.2rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >‹</button>

              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                color: "white", fontSize: isMobile ? "1rem" : "1.2rem",
                margin: 0,
              }}>
                {MONTH_NAMES[month - 1]} {year}
              </h3>

              <button
                onClick={nextMonth}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 8, width: 36, height: 36,
                  color: "white", fontSize: "1.2rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >›</button>
            </div>

            {/* Day-of-week headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              background: "#f4f4f6", borderBottom: "1px solid #e2e8f0",
            }}>
              {DAY_NAMES.map((d) => (
                <div key={d} style={{
                  padding: isMobile ? "8px 0" : "10px 0",
                  textAlign: "center",
                  fontSize: isMobile ? "0.62rem" : "0.7rem",
                  fontWeight: 700, color: "#94a3b8",
                  letterSpacing: 1, textTransform: "uppercase",
                }}>
                  {isMobile ? d.charAt(0) : d}
                </div>
              ))}
            </div>

            {/* Day cells grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              borderLeft: "1px solid #f0f0f4",
            }}>
              {cells.map((day, i) => {
                // Empty cell (before first day of month)
                if (day === null) {
                  return (
                    <div key={`empty-${i}`} style={{
                      minHeight: isMobile ? 52 : 80,
                      background: "#fafafa",
                      borderRight: "1px solid #f0f0f4",
                      borderBottom: "1px solid #f0f0f4",
                    }} />
                  );
                }

                const dayEvs     = eventsForDay(day);
                const hasEvs     = dayEvs.length > 0;
                const isSelected = selectedDay === day;
                const isTod      = isToday(day);

                return (
                  <div
                    key={day}
                    onClick={() => hasEvs
                      ? setSelectedDay(isSelected ? null : day)
                      : undefined
                    }
                    style={{
                      minHeight: isMobile ? 52 : 80,
                      padding: isMobile ? "4px 4px" : "6px 8px",
                      borderRight: "1px solid #f0f0f4",
                      borderBottom: "1px solid #f0f0f4",
                      background: isSelected
                        ? "rgba(26,29,94,0.06)"
                        : isTod
                        ? "rgba(232,168,0,0.06)"
                        : "white",
                      cursor: hasEvs ? "pointer" : "default",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (hasEvs && !isSelected)
                        e.currentTarget.style.background = "rgba(26,29,94,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (hasEvs && !isSelected)
                        e.currentTarget.style.background = isTod
                          ? "rgba(232,168,0,0.06)" : "white";
                    }}
                  >
                    {/* Day number circle */}
                    <div style={{
                      width: isMobile ? 22 : 26,
                      height: isMobile ? 22 : 26,
                      borderRadius: "50%",
                      display: "flex", alignItems: "center",
                      justifyContent: "center",
                      background: isTod
                        ? PESO_RED
                        : isSelected ? PESO_NAVY : "transparent",
                      color: isTod || isSelected ? "white" : "#1e293b",
                      fontSize: isMobile ? "0.7rem" : "0.8rem",
                      fontWeight: isTod || isSelected ? 700 : 400,
                      marginBottom: 3,
                    }}>
                      {day}
                    </div>

                    {/* Colored dots for events */}
                    {hasEvs && (
                      <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        {dayEvs.slice(0, 3).map((ev, idx) => (
                          <span key={idx} style={{
                            display: "block",
                            width: isMobile ? 5 : 6,
                            height: isMobile ? 5 : 6,
                            borderRadius: "50%",
                            background: TYPE_STYLE[ev.type].dot,
                            flexShrink: 0,
                          }} />
                        ))}
                        {dayEvs.length > 3 && (
                          <span style={{
                            fontSize: "0.5rem", color: "#94a3b8",
                            fontWeight: 700, lineHeight: 1,
                          }}>
                            +{dayEvs.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Event title pills — desktop only */}
                    {hasEvs && !isMobile && (
                      <div style={{ marginTop: 2 }}>
                        {dayEvs.slice(0, 2).map((ev, idx) => (
                          <div key={idx} style={{
                            background: TYPE_STYLE[ev.type].bg,
                            color: TYPE_STYLE[ev.type].color,
                            fontSize: "0.6rem", fontWeight: 600,
                            borderRadius: 3, padding: "1px 4px",
                            marginBottom: 2,
                            whiteSpace: "nowrap", overflow: "hidden",
                            textOverflow: "ellipsis", maxWidth: "100%",
                          }}>
                            {ev.title}
                          </div>
                        ))}
                        {dayEvs.length > 2 && (
                          <div style={{
                            fontSize: "0.6rem", color: "#94a3b8",
                            fontWeight: 600, paddingLeft: 2,
                          }}>
                            +{dayEvs.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── This month's agenda list below the grid ── */}
            {monthEvents.length > 0 && (
              <div style={{
                borderTop: "2px solid #f0f0f4",
                padding: isMobile ? "16px 12px" : "20px 24px",
              }}>
                <p style={{
                  fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8",
                  letterSpacing: 2, textTransform: "uppercase", marginBottom: 14,
                }}>
                  This Month — {monthEvents.length} reminder{monthEvents.length > 1 ? "s" : ""}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {monthEvents.map((ev, i) => {
                    const ts = TYPE_STYLE[ev.type];
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedDay(ev.day)}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 12,
                          padding: "12px 14px", borderRadius: 10,
                          background: ts.bg, cursor: "pointer",
                          borderLeft: `3px solid ${ts.dot}`,
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        {/* Day number badge */}
                        <div style={{
                          minWidth: 36, height: 36, borderRadius: 8,
                          background: ts.dot,
                          display: "flex", alignItems: "center",
                          justifyContent: "center",
                          color: "white", fontWeight: 800,
                          fontSize: "0.8rem", flexShrink: 0,
                        }}>
                          {ev.day}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            fontSize: "0.65rem", fontWeight: 700,
                            letterSpacing: 1, textTransform: "uppercase",
                            color: ts.color, display: "block", marginBottom: 2,
                          }}>
                            {ts.label}
                          </span>
                          <p style={{
                            fontWeight: 700, color: PESO_NAVY,
                            fontSize: "0.88rem", margin: "0 0 2px",
                            whiteSpace: "nowrap", overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {ev.title}
                          </p>
                          <p style={{
                            fontSize: "0.78rem", color: "#5a5a7a",
                            margin: 0, lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as const,
                            overflow: "hidden",
                          }}>
                            {ev.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty month state */}
            {monthEvents.length === 0 && (
              <div style={{
                borderTop: "1px solid #f0f0f4",
                padding: "32px 24px", textAlign: "center", color: "#94a3b8",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
                <p style={{ fontSize: "0.88rem", margin: 0 }}>
                  No CDSP reminders for this month.
                </p>
              </div>
            )}
          </div>

          {/* Mobile tap hint */}
          {isMobile && (
            <p style={{
              fontSize: "0.75rem", color: "#94a3b8",
              fontStyle: "italic", marginTop: 12, textAlign: "center",
            }}>
              Tap a highlighted date to view details
            </p>
          )}
        </div>
      </div>

      {/* ── Day detail modal — opens when a highlighted day is clicked ── */}
      {selectedDay && eventsForDay(selectedDay).length > 0 && (
        <DayModal
          day={selectedDay}
          month={month}
          year={year}
          events={eventsForDay(selectedDay)}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
};

export default CdspSchedulePage;