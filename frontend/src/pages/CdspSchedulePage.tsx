import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParticipantGroup {
  label: string;   // e.g. "Junior High School", "Senior High School", "College", "Faculty"
  female: number;
  male: number;
}

interface CdspEvent {
  date: string;      // "MM-DD" repeats yearly, "YYYY-MM-DD" one-time
  institution: string;
  time: string;
  participants: ParticipantGroup[];
  topics: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PESO_NAVY = "#1a1d5e";
const PESO_RED  = "#c0151a";
const PESO_GOLD = "#e8a800";

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  HOW TO ADD / EDIT ACTIVITIES
//
//  Each entry has 5 fields:
//    date         → "MM-DD"      repeats every year  (e.g. "05-01" = every May 1)
//                   "YYYY-MM-DD" one-time only        (e.g. "2026-08-07")
//    institution  → Name of the institution/office hosting the activity
//    time         → e.g. "8:00 a.m. – 11:00 a.m."
//    participants → Array of groups, each with a label + female/male counts.
//                    Use whichever groups apply — Junior High School, Senior
//                    High School, College, Faculty, etc. Totals per row and
//                    the grand total are calculated automatically.
//    topics       → List of topics requested/discussed
//
//  EXAMPLE:
//    {
//      date: "2026-08-07",
//      institution: "Bungsuan National High School",
//      time: "8:00 a.m. – 11:00 a.m.",
//      participants: [
//        { label: "Junior High School", female: 30, male: 42 },
//        { label: "Senior High School", female: 60, male: 48 },
//        { label: "Faculty",            female: 3,  male: 4  },
//      ],
//      topics: ["Programs and Core Services of PESO", "LMI Situation in Capiz"],
//    }
//
//  To DELETE an entry just remove the whole { } block.
//  To ADD an entry just append a new { } block inside the array below.
// ─────────────────────────────────────────────────────────────────────────────

const STATIC_EVENTS: CdspEvent[] = [
  {
    date: "2026-08-07",
    institution: "Bungsuan National High School, Bungsuan, Dumarao, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "Junior High School", female: 30, male: 42 },
      { label: "Senior High School", female: 60, male: 48 },
      { label: "Faculty",            female: 3,  male: 4  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Four Curriculum Exits",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
    ],
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
): (CdspEvent & { day: number })[] => {
  const results: (CdspEvent & { day: number })[] = [];

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
  events: (CdspEvent & { day: number })[];
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
                CDSP Activity
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
              aria-label="Close"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "50%", width: 32, height: 32,
                color: "white", cursor: "pointer", fontSize: "1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >✕</button>
          </div>

          {/* Events list */}
          <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
            {events.map((ev, i) => (
              <div
                key={i}
                style={{
                  paddingBottom: i === events.length - 1 ? 0 : 20,
                  marginBottom:  i === events.length - 1 ? 0 : 20,
                  borderBottom:  i === events.length - 1 ? "none" : "1.5px solid rgba(26,29,94,0.08)",
                }}
              >
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  color: PESO_NAVY, fontSize: "1.1rem", margin: "0 0 14px", lineHeight: 1.3,
                }}>
                  {ev.institution}
                </h3>

                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
                  <span style={{ fontSize: "1rem" }}>🕐</span>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: PESO_RED }}>Time</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.88rem", color: "#5a5a7a" }}>{ev.time}</p>
                  </div>
                </div>

                <p style={{ margin: "0 0 8px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: PESO_RED }}>
                  Participants
                </p>
                <div style={{
                  border: "1.5px solid rgba(26,29,94,0.08)",
                  borderRadius: 10,
                  overflow: "hidden",
                  marginBottom: 16,
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "#f4f4f6" }}>
                        <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8" }}>Group</th>
                        <th style={{ textAlign: "right", padding: "8px 12px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8" }}>Female</th>
                        <th style={{ textAlign: "right", padding: "8px 12px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8" }}>Male</th>
                        <th style={{ textAlign: "right", padding: "8px 12px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ev.participants.map((group, gi) => (
                        <tr key={gi} style={{ borderTop: "1px solid rgba(26,29,94,0.06)" }}>
                          <td style={{ padding: "8px 12px", color: PESO_NAVY, fontWeight: 600 }}>{group.label}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: "#5a5a7a" }}>{group.female}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: "#5a5a7a" }}>{group.male}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: "#5a5a7a", fontWeight: 700 }}>{group.female + group.male}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: "1.5px solid rgba(26,29,94,0.12)", background: "#fff1f2" }}>
                        <td colSpan={3} style={{ padding: "8px 12px", color: PESO_RED, fontWeight: 700 }}>Grand Total</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: PESO_RED, fontWeight: 800 }}>
                          {ev.participants.reduce((sum, g) => sum + g.female + g.male, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p style={{ margin: "0 0 8px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: PESO_RED }}>
                  Topics Requested
                </p>
                <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                  {ev.topics.map((topic, idx) => (
                    <li key={idx} style={{ fontSize: "0.88rem", color: "#5a5a7a", lineHeight: 1.5 }}>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
              Scheduled CDSP activities — click any highlighted date to view
              the institution, time, participants, and topics requested.
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: isMobile ? "24px 12px" : "40px 24px",
        }}>

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
                aria-label="Previous month"
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
                aria-label="Next month"
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

                    {/* Marker dot for days with an activity */}
                    {hasEvs && (
                      <span style={{
                        display: "block",
                        width: isMobile ? 5 : 6,
                        height: isMobile ? 5 : 6,
                        borderRadius: "50%",
                        background: PESO_RED,
                      }} />
                    )}

                    {/* Institution name pill — desktop only */}
                    {hasEvs && !isMobile && (
                      <div style={{ marginTop: 4 }}>
                        {dayEvs.slice(0, 1).map((ev, idx) => (
                          <div key={idx} style={{
                            background: "#fff1f2",
                            color: PESO_RED,
                            fontSize: "0.6rem", fontWeight: 600,
                            borderRadius: 3, padding: "1px 4px",
                            whiteSpace: "nowrap", overflow: "hidden",
                            textOverflow: "ellipsis", maxWidth: "100%",
                          }}>
                            {ev.institution}
                          </div>
                        ))}
                        {dayEvs.length > 1 && (
                          <div style={{
                            fontSize: "0.6rem", color: "#94a3b8",
                            fontWeight: 600, paddingLeft: 2, marginTop: 2,
                          }}>
                            +{dayEvs.length - 1} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty month state */}
            {monthEvents.length === 0 && (
              <div style={{
                borderTop: "1px solid #f0f0f4",
                padding: "32px 24px", textAlign: "center", color: "#94a3b8",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
                <p style={{ fontSize: "0.88rem", margin: 0 }}>
                  No CDSP activities scheduled for this month.
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