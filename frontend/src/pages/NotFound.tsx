import React from "react";
import { Link } from "react-router-dom";
import pesoLogo from "/assets/peso-logo.png";

// ── PESO design tokens (matches the rest of the site) ──────────────────────────

const COLORS = {
  red:       "#c0151a",
  redHover:  "#a01015",
  navy:      "#1a1d5e",
  gold:      "#f5c842",
  bodyText:  "rgba(255,255,255,0.75)",
};

const NotFound: React.FC = () => {
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
        * { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: `linear-gradient(135deg, ${COLORS.navy} 0%, #23276e 55%, ${COLORS.navy} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Source Sans 3', sans-serif",
          padding: "24px",
        }}
      >
        {/* Decorative rings, matching the GIP/JobStart hero style */}
        <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", border: "1px solid rgba(245,200,66,0.08)", top: -160, right: -120, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(245,200,66,0.06)", bottom: -80, left: -60, pointerEvents: "none" }} />

        <div style={{ textAlign: "center", position: "relative", zIndex: 1, animation: "fadeUp 0.4s ease both", maxWidth: 560 }}>
          <img
            src={pesoLogo}
            alt="PESO Capiz"
            style={{ width: 76, height: 76, objectFit: "contain", marginBottom: 22, opacity: 0.95 }}
          />

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.25)",
            borderRadius: 99, padding: "5px 14px", marginBottom: 22,
          }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: COLORS.gold }}>
              P.E.S.O. Capiz
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              color: "white",
              fontSize: "clamp(3.5rem, 12vw, 7rem)",
              lineHeight: 1,
              margin: "0 0 12px",
              textShadow: "0 4px 24px rgba(0,0,0,0.25)",
            }}
          >
            404
          </h1>

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: "white",
              fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
              margin: "0 0 14px",
            }}
          >
            Page Not Found
          </h2>

          <p
            style={{
              color: COLORS.bodyText,
              fontSize: "1rem",
              lineHeight: 1.75,
              margin: "0 auto 36px",
              maxWidth: 440,
            }}
          >
            The page you're looking for doesn't exist or may have been moved.
            Let's get you back to the PESO Capiz homepage.
          </p>

          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: COLORS.red,
              color: "white",
              border: "none",
              padding: "13px 32px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(192,21,26,0.4)",
              textDecoration: "none",
              letterSpacing: 0.3,
              transition: "background 0.18s",
              fontFamily: "'Source Sans 3', sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.redHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.red; }}
          >
            🏠 Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;