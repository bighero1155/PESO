import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import pesoLogo from "/assets/peso-logo.png";
import gipLogo from "/assets/GIP.png";

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
  cream:     "#fdf8f0",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface GipEvent {
  id: string;
  /** ISO date string, e.g. "2026-09-15" */
  date: string;
  institution: string;
  time: string;
  participants: string;
  topics: string[];
}

// ── Data ──────────────────────────────────────────────────────────────────────
// Add more events here — each one just needs an id, date (YYYY-MM-DD),
// institution, time, participants, and a list of topics. The calendar below
// picks these up automatically: any date with an event gets highlighted and
// becomes clickable.

const GIP_EVENTS: GipEvent[] = [
  {
    id: "sample-1",
    date: "2026-09-15",
    institution: "Roxas City Hall — Human Resource Management Office",
    time: "9:00 AM – 12:00 PM",
    participants: "15 GIP Interns",
    topics: [
      "Orientation on Government Office Protocols",
      "Data Privacy Act Overview",
      "Basic Office Systems Training",
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function dateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function buildEventsByDate(events: GipEvent[]): Record<string, GipEvent[]> {
  const map: Record<string, GipEvent[]> = {};
  for (const ev of events) {
    if (!map[ev.date]) map[ev.date] = [];
    map[ev.date].push(ev);
  }
  return map;
}

function formatFullDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
}

// ── Event detail modal (portal — escapes any overflow:hidden parent) ──────────

function EventDetailModal({
  events,
  dateIso,
  onClose,
}: {
  events: GipEvent[];
  dateIso: string;
  onClose: () => void;
}) {
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position:       "fixed",
        inset:          0,
        background:     "rgba(10,11,38,0.55)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        zIndex:         9999,
        padding:        "24px",
        animation:      "lbFadeIn 0.18s ease both",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:    "white",
          borderRadius:  16,
          maxWidth:      520,
          width:         "100%",
          maxHeight:     "85vh",
          overflowY:     "auto",
          boxShadow:     "0 24px 80px rgba(0,0,0,0.35)",
          animation:     "lbPopIn 0.2s ease both",
          fontFamily:    "'Source Sans 3', sans-serif",
        }}
      >
        <div style={{
          background: COLORS.navy,
          padding:    "20px 24px",
          display:    "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}>
          <div>
            <p style={{
              color: COLORS.gold, fontWeight: 800, fontSize: "0.7rem",
              letterSpacing: 3, textTransform: "uppercase", margin: 0,
            }}>
              GIP Activity
            </p>
            <p style={{ color: "white", fontWeight: 700, fontSize: "1rem", margin: "4px 0 0" }}>
              {formatFullDate(dateIso)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 34, height: 34, borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.08)",
              color: "white", fontSize: "1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {events.map((ev, i) => (
            <div
              key={ev.id}
              style={{
                paddingBottom: i === events.length - 1 ? 0 : 20,
                marginBottom:  i === events.length - 1 ? 0 : 20,
                borderBottom:  i === events.length - 1 ? "none" : "1.5px solid rgba(26,29,94,0.08)",
              }}
            >
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                color: COLORS.navy, fontSize: "1.15rem", margin: "0 0 14px", lineHeight: 1.3,
              }}>
                {ev.institution}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1rem" }}>🕐</span>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.red }}>Time</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.9rem", color: COLORS.bodyText }}>{ev.time}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1rem" }}>👥</span>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.red }}>Participants</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.9rem", color: COLORS.bodyText }}>{ev.participants}</p>
                  </div>
                </div>
              </div>

              <p style={{ margin: "0 0 8px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.red }}>
                Topics Discussed
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                {ev.topics.map((topic, idx) => (
                  <li key={idx} style={{ fontSize: "0.9rem", color: COLORS.bodyText, lineHeight: 1.5 }}>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Calendar grid ─────────────────────────────────────────────────────────────

function EventCalendar({
  isMobile,
  eventsByDate,
  onSelectDate,
}: {
  isMobile: boolean;
  eventsByDate: Record<string, GipEvent[]>;
  onSelectDate: (dateIso: string) => void;
}) {
  const today = new Date();
  const firstEventDate = GIP_EVENTS.length > 0 ? new Date(GIP_EVENTS[0].date + "T00:00:00") : today;

  const [viewYear, setViewYear]   = useState(firstEventDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(firstEventDate.getMonth()); // 0-based

  const firstOfMonth   = new Date(viewYear, viewMonth, 1);
  const startWeekday   = firstOfMonth.getDay();
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else { setViewMonth(m => m - 1); }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else { setViewMonth(m => m + 1); }
  };

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div style={{
      background:   "white",
      borderRadius: 16,
      border:       "1.5px solid rgba(26,29,94,0.10)",
      boxShadow:    "0 4px 24px rgba(26,29,94,0.06)",
      overflow:     "hidden",
      animation:    "fadeUp 0.3s ease both",
    }}>
      {/* Month nav header */}
      <div style={{
        background: COLORS.navy,
        padding:    isMobile ? "16px 16px" : "18px 24px",
        display:    "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <button
          onClick={goPrevMonth}
          aria-label="Previous month"
          style={{
            background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)",
            color: "white", borderRadius: 8, width: 34, height: 34,
            cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ←
        </button>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          color: "white", fontSize: isMobile ? "1.1rem" : "1.3rem", margin: 0,
        }}>
          {MONTH_LABELS[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={goNextMonth}
          aria-label="Next month"
          style={{
            background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)",
            color: "white", borderRadius: 8, width: 34, height: 34,
            cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          →
        </button>
      </div>

      {/* Weekday labels */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        background: COLORS.cream,
        borderBottom: "1.5px solid rgba(26,29,94,0.08)",
      }}>
        {WEEKDAY_LABELS.map(label => (
          <div key={label} style={{
            textAlign: "center", padding: isMobile ? "8px 0" : "10px 0",
            fontSize: "0.7rem", fontWeight: 800, letterSpacing: 1,
            textTransform: "uppercase", color: COLORS.mutedText,
            fontFamily: "'Source Sans 3', sans-serif",
          }}>
            {isMobile ? label.slice(0, 1) : label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`blank-${i}`} style={{ aspectRatio: "1", borderRight: "1px solid rgba(26,29,94,0.04)", borderBottom: "1px solid rgba(26,29,94,0.04)" }} />;
          }

          const iso = dateKey(viewYear, viewMonth, day);
          const dayEvents = eventsByDate[iso];
          const hasEvents = !!dayEvents && dayEvents.length > 0;

          return (
            <button
              key={iso}
              onClick={() => hasEvents && onSelectDate(iso)}
              disabled={!hasEvents}
              style={{
                aspectRatio:  "1",
                border:       "none",
                borderRight:  "1px solid rgba(26,29,94,0.04)",
                borderBottom: "1px solid rgba(26,29,94,0.04)",
                background:   hasEvents ? "rgba(192,21,26,0.06)" : "transparent",
                cursor:       hasEvents ? "pointer" : "default",
                display:      "flex",
                flexDirection: "column",
                alignItems:   "center",
                justifyContent: "center",
                gap:          4,
                position:     "relative",
                padding:      0,
                fontFamily:   "'Source Sans 3', sans-serif",
                transition:   "background 0.15s",
              }}
              onMouseEnter={e => { if (hasEvents) e.currentTarget.style.background = "rgba(192,21,26,0.14)"; }}
              onMouseLeave={e => { if (hasEvents) e.currentTarget.style.background = "rgba(192,21,26,0.06)"; }}
            >
              <span style={{
                fontSize:   isMobile ? "0.8rem" : "0.9rem",
                fontWeight: hasEvents || isToday(day) ? 800 : 500,
                color:      hasEvents ? COLORS.red : isToday(day) ? COLORS.navy : COLORS.bodyText,
                width:      isToday(day) && !hasEvents ? 24 : undefined,
                height:     isToday(day) && !hasEvents ? 24 : undefined,
                borderRadius: isToday(day) && !hasEvents ? "50%" : undefined,
                border:     isToday(day) && !hasEvents ? `1.5px solid ${COLORS.navy}` : undefined,
                display:    "flex", alignItems: "center", justifyContent: "center",
              }}>
                {day}
              </span>
              {hasEvents && (
                <span style={{
                  width: 5, height: 5, borderRadius: "50%", background: COLORS.red,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Root page component ───────────────────────────────────────────────────────

export default function GipPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useState(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  });

  const eventsByDate = buildEventsByDate(GIP_EVENTS);
  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lbPopIn  { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        * { box-sizing: border-box; }
        body { font-family: 'Source Sans 3', sans-serif; background: ${COLORS.cream}; margin: 0; }
      `}</style>

      <div style={{ minHeight: "100vh", background: COLORS.cream }}>

        {/* ── Header ── */}
        <header style={{ background: COLORS.red, padding: "0 24px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", height: 58, display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("/")}
              style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 0 }}
            >
              <img src={pesoLogo} alt="PESO" style={{ width: 36, height: 36, objectFit: "contain" }} />
              <span style={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: 1 }}>P.E.S.O. Capiz</span>
            </button>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", fontWeight: 600 }}>GIP Program</span>
          </div>
        </header>

        {/* ── Hero ── */}
        <section style={{
          background: `linear-gradient(135deg, ${COLORS.navy} 0%, #23276e 55%, #1a1d5e 100%)`,
          padding:    isMobile ? "52px 24px 56px" : "72px 24px 80px",
          position:   "relative",
          overflow:   "hidden",
        }}>
          <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", border: "1px solid rgba(245,200,66,0.08)", top: -160, right: -120, pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(245,200,66,0.06)", bottom: -80, left: -60, pointerEvents: "none" }} />

          <div style={{
            maxWidth:      1180,
            margin:        "0 auto",
            display:       "flex",
            gap:           isMobile ? 32 : 64,
            alignItems:    "center",
            flexDirection: isMobile ? "column" : "row",
            flexWrap:      "wrap",
          }}>
            <div style={{ flex: "1 1 400px", animation: "slideIn 0.4s ease both" }}>
              <div style={{
                display:      "inline-flex",
                alignItems:   "center",
                gap:          8,
                background:   "rgba(245,200,66,0.12)",
                border:       "1px solid rgba(245,200,66,0.25)",
                borderRadius: 99,
                padding:      "5px 14px",
                marginBottom: 20,
              }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: COLORS.gold }}>
                  DOLE Program
                </span>
              </div>

              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize:   isMobile ? "2rem" : "clamp(2.2rem, 4vw, 3rem)",
                color:      "white",
                lineHeight: 1.15,
                margin:     "0 0 10px",
              }}>
                Government Internship<br />Program
              </h1>

              <p style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: COLORS.gold, margin: "0 0 20px" }}>
                GIP — P.E.S.O. Capiz
              </p>

              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.75, maxWidth: 520, margin: "0 0 32px" }}>
                A DOLE program that places <strong style={{ color: "white" }}>qualified beneficiaries in
                government offices and agencies</strong>, giving them hands-on work experience while
                providing much-needed support to local government units and national agencies.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a
                  href="https://www.dole.gov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: COLORS.red, color: "white", border: "none", padding: "13px 28px",
                    borderRadius: 8, fontWeight: 700, fontSize: "0.92rem", cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(192,21,26,0.4)", textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: 8, letterSpacing: 0.3,
                    transition: "background 0.18s", fontFamily: "'Source Sans 3', sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = COLORS.redHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = COLORS.red; }}
                >
                  Learn More at DOLE →
                </a>
                <button
                  onClick={() => navigate("/")}
                  style={{
                    background: "rgba(255,255,255,0.08)", color: "white",
                    border: "1.5px solid rgba(255,255,255,0.2)", padding: "13px 24px",
                    borderRadius: 8, fontWeight: 700, fontSize: "0.92rem", cursor: "pointer",
                    letterSpacing: 0.3, transition: "background 0.18s", fontFamily: "'Source Sans 3', sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                >
                  🏠 Back to Home
                </button>
              </div>
            </div>

            <div style={{
              flex: isMobile ? "none" : "0 0 260px", display: "flex", justifyContent: "center",
              animation: "slideIn 0.5s ease 0.1s both", opacity: 0, animationFillMode: "forwards",
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <img src={gipLogo} alt="GIP" style={{ width: isMobile ? 260 : 340, height: isMobile ? 260 : 340, objectFit: "contain" }} />
                <span style={{ color: COLORS.gold, fontSize: "0.7rem", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", textAlign: "center" }}>
                  A DOLE Government Internship Program
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Objective strip ── */}
        <section style={{ background: COLORS.red, padding: isMobile ? "28px 24px" : "32px 24px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <p style={{
              color: "white", fontSize: isMobile ? "0.95rem" : "1.05rem", lineHeight: 1.7,
              margin: 0, textAlign: "center", maxWidth: 780, marginLeft: "auto", marginRight: "auto",
            }}>
              <strong>Program Objective:</strong> To provide qualified beneficiaries with temporary
              government work exposure, develop their skills and work values, and support the
              operations of partner government offices and agencies.
            </p>
          </div>
        </section>

        {/* ── Activity calendar ── */}
        <section style={{ padding: isMobile ? "52px 24px 64px" : "72px 24px 88px" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>

            <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 36 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", color: COLORS.red, display: "block", marginBottom: 10 }}>
                GIP Capiz
              </span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.7rem" : "2.2rem", color: COLORS.navy, margin: "0 0 12px" }}>
                Activity Calendar
              </h2>
              <p style={{ color: COLORS.bodyText, fontSize: "0.95rem", maxWidth: 480, margin: "0 auto" }}>
                Dates with a red marker have a scheduled GIP activity. Click on one to see the
                institution, time, participants, and topics covered.
              </p>
            </div>

            <EventCalendar
              isMobile={isMobile}
              eventsByDate={eventsByDate}
              onSelectDate={setSelectedDate}
            />

          </div>
        </section>

        {/* ── CTA footer ── */}
        <section style={{
          background: `linear-gradient(135deg, ${COLORS.navy} 0%, #23276e 100%)`,
          padding:    isMobile ? "44px 24px" : "60px 24px",
          textAlign:  "center",
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <img src={pesoLogo} alt="PESO Capiz" style={{ width: 56, height: 56, objectFit: "contain", marginBottom: 18, opacity: 0.9 }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.5rem" : "1.9rem", color: "white", margin: "0 0 12px", lineHeight: 1.2 }}>
              Interested in the GIP Program?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", lineHeight: 1.7, margin: "0 0 28px" }}>
              Visit the PESO Capiz office or contact us for more information on application
              schedules and requirements for the next GIP cycle.
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                background: COLORS.red, color: "white", border: "none", padding: "13px 28px",
                borderRadius: 8, fontWeight: 700, fontSize: "0.92rem", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(192,21,26,0.35)", letterSpacing: 0.3,
                transition: "background 0.18s", fontFamily: "'Source Sans 3', sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = COLORS.redHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = COLORS.red; }}
            >
              🏠 Back to Home
            </button>
          </div>
        </section>

      </div>

      {selectedDate && selectedEvents.length > 0 && (
        <EventDetailModal
          events={selectedEvents}
          dateIso={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}