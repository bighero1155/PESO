import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import pesoLogo from "/assets/peso-logo.png";
import spesLogo from "/assets/spes.png";

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

// ── Types ─────────────────────────────────────────────────────────────────────

interface SpesPhoto {
  src: string;
  alt: string;
}

interface SpesFolder {
  id: string;
  name: string;
  photos: SpesPhoto[];
  /** How many empty placeholder tiles to render when `photos` is still empty. */
  placeholderCount: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────
// Drop real photos into the `photos` array for each folder once you have them,
// e.g. { src: "/assets/spes-pre-app-1.jpg", alt: "Orientation briefing" }.
// Until then, `placeholderCount` controls how many empty slots show up so the 
// folder doesn't look broken.

const SPES_FOLDERS: SpesFolder[] = [
  {
    id: "pre-application-orientation",
    name: "SPES PRE-APPLICATION ORIENTATION - MAY 2, 2026",
    photos: [
      {src: "/assets/spes-preorientation-1.JPG", alt:""},
      {src: "/assets/spes-preorientation-2.JPG", alt:""},
      {src: "/assets/spes-preorientation-3.JPG", alt:""},
      {src: "/assets/spes-preorientation-4.JPG", alt:""},
      {src: "/assets/spes-preorientation-5.JPG", alt:""},
      {src: "/assets/spes-preorientation-6.JPG", alt:""},
      {src: "/assets/spes-preorientation-7.JPG", alt:""},
      {src: "/assets/spes-preorientation-8.JPG", alt:""},
      {src: "/assets/spes-preorientation-9.JPG", alt:""},
      {src: "/assets/spes-preorientation-10.JPG", alt:""},
      {src: "/assets/spes-preorientation-11.JPG", alt:""},
      {src: "/assets/spes-preorientation-12.JPG", alt:""},
      {src: "/assets/spes-preorientation-13.JPG", alt:""},
      {src: "/assets/spes-preorientation-14.JPG", alt:""},
      {src: "/assets/spes-preorientation-15.JPG", alt:""},
      {src: "/assets/spes-preorientation-16.JPG", alt:""},
      {src: "/assets/spes-preorientation-17.JPG", alt:""},
      {src: "/assets/spes-preorientation-18.JPG", alt:""},
      {src: "/assets/spes-preorientation-19.JPG", alt:""},
    ],
    placeholderCount: 6,
  },
  {
    id: "pre-employment-orientation",
    name: "SPES PRE-EMPLOYMENT ORIENTATION - MAY 30, 2026",
    photos: [
      {src: "/assets/spes2026 (6).jpg", alt:""},
      {src: "/assets/spes2026 (7).jpg", alt:""},
      {src: "/assets/spes2026 (8).jpg", alt:""},
      {src: "/assets/spes2026 (9).jpg", alt:""},
    ],
    placeholderCount: 6,
  },
  {
    id: "beneficiaries-in-action",
    name: "SPES BENEFICIARIES IN ACTION",
    photos: [
      {src: "/assets/speswork1.jpg", alt:""},
      {src: "/assets/speswork2.jpg", alt:""},
      {src: "/assets/speswork3.jpg", alt:""},
      {src: "/assets/speswork4.jpg", alt:""},
      {src: "/assets/speswork5.jpg", alt:""},
      {src: "/assets/speswork6.jpg", alt:""},
      {src: "/assets/speswork7.jpg", alt:""},
      {src: "/assets/speswork8.jpg", alt:""},
      {src: "/assets/speswork9.jpg", alt:""},
      {src: "/assets/speswork10.jpg", alt:""},
      {src: "/assets/speswork90.jpg", alt:""},
    ],
    placeholderCount: 8,
  },
  {
    id: "wellness-development-program",
    name: "SPES WELLNESS DEVELOPMENT PROGRAM - JUNE 26, 2026",
    photos: [
      {src: "/assets/spes2026 (1).jpg", alt:""},
      {src: "/assets/spes2026 (2).jpg", alt:""},
      {src: "/assets/spes2026 (3).jpg", alt:""},
      {src: "/assets/spes2026 (4).jpg", alt:""},
      {src: "/assets/spes2026 (5).jpg", alt:""},
      {src: "/assets/spes2026 (10).jpg", alt:""},
      {src: "/assets/spes2026 (11).jpg", alt:""},
      {src: "/assets/spes2026 (12).jpg", alt:""},
      {src: "/assets/spes2026 (13).jpg", alt:""},
    ],
    placeholderCount: 6,
  },
  {
    id: "payout",
    name: "SPES PAYOUT",
    photos: [
      {src: "/assets/spes-payout-1.JPG", alt:""},
      {src: "/assets/spes-payout-2.JPG", alt:""},
      {src: "/assets/spes-payout-3.JPG", alt:""},
      {src: "/assets/spes-payout-4.JPG", alt:""},
      {src: "/assets/spes-payout-5.JPG", alt:""},
      {src: "/assets/spes-payout-6.JPG", alt:""},
      {src: "/assets/spes-payout-7.JPG", alt:""},
      {src: "/assets/spes-payout-8.JPG", alt:""},
      {src: "/assets/spes-payout-9.JPG", alt:""},
      {src: "/assets/spes-payout-10.JPG", alt:""},
      {src: "/assets/spes-payout-11.JPG", alt:""},
      {src: "/assets/spes-payout-12.JPG", alt:""},
      {src: "/assets/spes-payout-13.JPG", alt:""},
      {src: "/assets/spes-payout-14.JPG", alt:""},
      {src: "/assets/spes-payout-15.JPG", alt:""},
      {src: "/assets/spes-payout-16.JPG", alt:""},
      {src: "/assets/spes-payout-17.JPG", alt:""},
      {src: "/assets/spes-payout-18.JPG", alt:""},
      {src: "/assets/spes-payout-19.JPG", alt:""},
    ],
    placeholderCount: 6,
  },
];

// ── Lightbox (portal — escapes any overflow:hidden parent) ────────────────────

function ImageLightbox({
  src,
  alt,
  folderName,
  onClose,
}: {
  src: string;
  alt: string;
  folderName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position:       "fixed",
        inset:          0,
        background:     "rgba(10,11,38,0.92)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        zIndex:         9999,
        padding:        "48px 24px",
        animation:      "lbFadeIn 0.18s ease both",
        cursor:         "zoom-out",
      }}
    >
      <button
        onClick={e => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
        style={{
          position:       "fixed",
          top:            20,
          right:          24,
          width:          42,
          height:         42,
          borderRadius:   "50%",
          border:         "1.5px solid rgba(255,255,255,0.3)",
          background:     "rgba(255,255,255,0.08)",
          color:          "white",
          fontSize:       "1.3rem",
          cursor:         "pointer",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          transition:     "background 0.15s",
          zIndex:         10000,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
      >
        ✕
      </button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <img
          src={src}
          alt={alt}
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth:     "90vw",
            maxHeight:    "82vh",
            objectFit:    "contain",
            borderRadius: 10,
            boxShadow:    "0 24px 80px rgba(0,0,0,0.5)",
            cursor:       "default",
            display:      "block",
            animation:    "lbPopIn 0.2s ease both",
          }}
        />
        <span style={{
          fontSize:      "0.7rem",
          fontWeight:    800,
          letterSpacing: 2,
          textTransform: "uppercase",
          color:         COLORS.gold,
          textAlign:     "center",
        }}>
          {folderName}
        </span>
      </div>
    </div>,
    document.body
  );
}

// ── Single photo cell ──────────────────────────────────────────────────────────

function PhotoCell({
  photo,
  onOpenLightbox,
}: {
  photo: SpesPhoto;
  onOpenLightbox: (photo: SpesPhoto) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpenLightbox(photo)}
      style={{
        borderRadius: 8,
        overflow:     "hidden",
        aspectRatio:  "4/3",
        position:     "relative",
        boxShadow:    hovered ? "0 6px 20px rgba(26,29,94,0.18)" : "0 2px 8px rgba(26,29,94,0.07)",
        transform:    hovered ? "scale(1.03)" : "scale(1)",
        transition:   "box-shadow 0.18s, transform 0.18s",
        cursor:       "zoom-in",
      }}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <div style={{
        position:       "absolute",
        top:            8,
        right:          8,
        width:          30,
        height:         30,
        borderRadius:   "50%",
        background:     "rgba(10,11,38,0.5)",
        color:          "white",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       "0.85rem",
        opacity:        hovered ? 1 : 0,
        transition:     "opacity 0.15s",
        pointerEvents:  "none",
      }}>
        🔍
      </div>
    </div>
  );
}

// ── Placeholder cell (shown until real photos are added) ──────────────────────

function PlaceholderCell() {
  return (
    <div style={{
      borderRadius:   8,
      overflow:       "hidden",
      aspectRatio:    "4/3",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      gap:            6,
      background:     "rgba(26,29,94,0.03)",
      border:         "1.5px dashed rgba(26,29,94,0.14)",
    }}>
      <span style={{ fontSize: "1.4rem", opacity: 0.3 }}>🖼️</span>
      <span style={{ fontSize: "0.62rem", fontWeight: 700, color: COLORS.mutedText, letterSpacing: 0.5, textAlign: "center", padding: "0 8px" }}>
        Photo coming soon
      </span>
    </div>
  );
}

// ── Folder card (shown in the main grid) ───────────────────────────────────────

function FolderCard({
  folder,
  onOpen,
}: {
  folder: SpesFolder;
  onOpen: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const count = folder.photos.length;

  return (
    <button
      onClick={() => onOpen(folder.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:       "flex",
        flexDirection: "column",
        alignItems:    "flex-start",
        gap:           14,
        textAlign:     "left",
        width:         "100%",
        background:    "white",
        border:        `1.5px solid ${hovered ? COLORS.navy : "rgba(26,29,94,0.10)"}`,
        borderRadius:  14,
        padding:       "22px 20px",
        cursor:        "pointer",
        boxShadow:     hovered ? "0 10px 28px rgba(26,29,94,0.14)" : "0 2px 10px rgba(26,29,94,0.06)",
        transform:     hovered ? "translateY(-3px)" : "translateY(0)",
        transition:    "box-shadow 0.18s, transform 0.18s, border-color 0.18s",
        fontFamily:    "'Source Sans 3', sans-serif",
      }}
    >
      <div style={{
        width:          48,
        height:         48,
        borderRadius:   10,
        background:     hovered ? COLORS.navy : "rgba(26,29,94,0.06)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       "1.4rem",
        transition:     "background 0.18s",
      }}>
        {hovered ? "📂" : "📁"}
      </div>

      <div>
        <h3 style={{
          margin:        0,
          fontSize:      "0.92rem",
          fontWeight:    800,
          color:         COLORS.navy,
          lineHeight:    1.4,
          letterSpacing: 0.2,
        }}>
          {folder.name}
        </h3>
        <span style={{
          display:    "inline-block",
          marginTop:  8,
          fontSize:   "0.72rem",
          fontWeight: 700,
          color:      count > 0 ? COLORS.greenText : COLORS.mutedText,
        }}>
          {count > 0 ? `${count} photo${count === 1 ? "" : "s"}` : "No photos yet"}
        </span>
      </div>
    </button>
  );
}

// ── Folder grid (top-level view) ────────────────────────────────────────────────

function FolderGrid({
  folders,
  isMobile,
  onOpen,
}: {
  folders: SpesFolder[];
  isMobile: boolean;
  onOpen: (id: string) => void;
}) {
  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
      gap:                 18,
      animation:           "fadeUp 0.3s ease both",
    }}>
      {folders.map(folder => (
        <FolderCard key={folder.id} folder={folder} onOpen={onOpen} />
      ))}
    </div>
  );
}

// ── Folder detail view (photos inside one folder) ───────────────────────────────

function FolderDetail({
  folder,
  isMobile,
  onBack,
  onOpenLightbox,
}: {
  folder: SpesFolder;
  isMobile: boolean;
  onBack: () => void;
  onOpenLightbox: (photo: SpesPhoto) => void;
}) {
  const hasPhotos = folder.photos.length > 0;
  const placeholders = Array.from({ length: folder.placeholderCount });

  return (
    <div style={{ animation: "fadeUp 0.3s ease both" }}>
      {/* Breadcrumb / back */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        <button
          onClick={onBack}
          style={{
            display:       "inline-flex",
            alignItems:    "center",
            gap:           6,
            background:    "white",
            border:        "1.5px solid rgba(26,29,94,0.14)",
            borderRadius:  8,
            padding:       "8px 14px",
            fontSize:      "0.8rem",
            fontWeight:    700,
            color:         COLORS.navy,
            cursor:        "pointer",
            fontFamily:    "'Source Sans 3', sans-serif",
            transition:    "background 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,29,94,0.04)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
        >
          ← All Folders
        </button>
        <span style={{ color: COLORS.mutedText, fontSize: "0.8rem" }}>/</span>
        <span style={{
          fontSize:      "0.78rem",
          fontWeight:    800,
          color:         COLORS.red,
          letterSpacing: 0.5,
        }}>
          {folder.name}
        </span>
      </div>

      {hasPhotos ? (
        <div style={{
          display:             "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap:                 14,
        }}>
          {folder.photos.map((photo, i) => (
            <PhotoCell key={i} photo={photo} onOpenLightbox={onOpenLightbox} />
          ))}
        </div>
      ) : (
        <>
          <div style={{
            display:        "flex",
            alignItems:     "center",
            gap:            10,
            padding:        "14px 18px",
            background:     "rgba(245,200,66,0.10)",
            border:         "1.5px solid rgba(245,200,66,0.3)",
            borderRadius:   10,
            marginBottom:   20,
          }}>
            <span style={{ fontSize: "1.1rem" }}>⏳</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: COLORS.navy }}>
              Photos for this folder haven't been posted yet — check back soon.
            </span>
          </div>
          <div style={{
            display:             "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap:                 14,
          }}>
            {placeholders.map((_, i) => (
              <PlaceholderCell key={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Root page component ───────────────────────────────────────────────────────

export default function SpesPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lightbox, setLightbox] = useState<SpesPhoto | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const selectedFolder = SPES_FOLDERS.find(f => f.id === selectedFolderId) ?? null;

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
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", fontWeight: 600 }}>SPES Program</span>
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
                Special Program for<br />Employment of Students
              </h1>

              <p style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: COLORS.gold, margin: "0 0 20px" }}>
                SPES — P.E.S.O. Capiz
              </p>

              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.75, maxWidth: 520, margin: "0 0 32px" }}>
                A youth employment-bridging program by the Department of Labor and Employment (DOLE)
                that provides <strong style={{ color: "white" }}>temporary employment to disadvantaged students</strong>,
                helping them augment family income and stay in school.
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
                <img src={spesLogo} alt="SPES" style={{ width: isMobile ? 260 : 340, height: isMobile ? 260 : 340, objectFit: "contain" }} />
                <span style={{ color: COLORS.gold, fontSize: "0.7rem", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", textAlign: "center" }}>
                  Est. Republic Act 7323
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
              <strong>Program Objective:</strong> To provide temporary employment to poor but deserving students,
              augment their family income, and ensure that financial constraints will not prevent them from
              pursuing or finishing their education.
            </p>
          </div>
        </section>

        {/* ── Photo folders ── */}
        <section style={{ padding: isMobile ? "52px 24px 64px" : "72px 24px 88px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>

            {!selectedFolder && (
              <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 36 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", color: COLORS.red, display: "block", marginBottom: 10 }}>
                  SPES Capiz
                </span>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.7rem" : "2.2rem", color: COLORS.navy, margin: "0 0 12px" }}>
                  Photo Gallery
                </h2>
                <p style={{ color: COLORS.bodyText, fontSize: "0.95rem", maxWidth: 480, margin: "0 auto" }}>
                  Browse SPES highlights by folder. Tap a folder to view its photos.
                </p>
              </div>
            )}

            {selectedFolder ? (
              <FolderDetail
                folder={selectedFolder}
                isMobile={isMobile}
                onBack={() => setSelectedFolderId(null)}
                onOpenLightbox={setLightbox}
              />
            ) : (
              <FolderGrid
                folders={SPES_FOLDERS}
                isMobile={isMobile}
                onOpen={setSelectedFolderId}
              />
            )}

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
              Interested in the SPES Program?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", lineHeight: 1.7, margin: "0 0 28px" }}>
              Visit the PESO Capiz office or contact us for more information on application
              schedules and requirements for the next SPES cycle.
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

      {lightbox && selectedFolder && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          folderName={selectedFolder.name}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}