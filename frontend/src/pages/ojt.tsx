import { useState, useEffect } from "react";
import pesoLogo from "/assets/peso-logo.png";
import ojtHeroBg from "/assets/OJT/ojt.png";
import PesoNavbar from "../pesolanding/PesoNavbar";

// ── Types ────────────────────────────────────────────────────────────────────

interface GalleryItem {
  image: string;
  alt: string;
  caption: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────

/**
 * Documentation photos (the 5-image row directly under the hero).
 *
 * PLACEHOLDER: every entry currently points at doc1.jpg because the other
 * four images aren't available yet. To swap them in later, import each new
 * file at the top of this file (e.g. `import ojtDoc2 from "/assets/OJT/doc2.jpg"`)
 * and replace the `image` value on the matching entry below — nothing else
 * needs to change, the grid sizes itself from this array.
 */
const OJT_DOCUMENTATION: GalleryItem[] = [
  { image: "assets/OJT/doc1.jpg", alt: "OJT documentation photo 1", caption: "" },
  { image: "assets/OJT/doc2.jpg", alt: "OJT documentation photo 2", caption: "" },
  { image: "assets/OJT/doc3.jpg", alt: "OJT documentation photo 3", caption: "" },
  { image: "assets/OJT/doc4.jpg", alt: "OJT documentation photo 4", caption: "" },
  { image: "assets/OJT/doc5.jpg", alt: "OJT documentation photo 4", caption: "" },
];

/**
 * "OJT in Action" photos — trainees actually on the job.
 *
 * PLACEHOLDER: same situation as above, all pointing at doc1.jpg until the
 * real on-the-job photos are provided.
 */
const OJT_IN_ACTION: GalleryItem[] = [
  { image: "assets/OJT/1.jpg", alt: "OJT trainee at work 1", caption: "" },
  { image: "assets/OJT/2.jpg", alt: "OJT trainee at work 2", caption: "" },
  { image: "assets/OJT/3.jpg", alt: "OJT trainee at work 3", caption: "" },
  { image: "assets/OJT/4.jpg", alt: "OJT trainee at work 4", caption: "" },
  { image: "assets/OJT/5.jpg", alt: "OJT trainee at work 5", caption: "" },
  { image: "assets/OJT/6.jpg", alt: "OJT trainee at work 6", caption: "" },
  { image: "assets/OJT/7.jpg", alt: "OJT trainee at work 7", caption: "" },
  { image: "assets/OJT/8.jpg", alt: "OJT trainee at work 8", caption: "" },
  { image: "assets/OJT/9.jpg", alt: "OJT trainee at work 9", caption: "" },
];

const OJT_HIGHLIGHTS = [
  {
    icon: "🏢",
    title: "Host Establishment Matching",
    text: "PESO Capiz coordinates with partner offices, agencies, and private establishments to place students in host companies suited to their course and career track.",
  },
  {
    icon: "📝",
    title: "Facilitation & Documentation",
    text: "We assist with the endorsement letters, memoranda of agreement, and required documentation between the school, the trainee, and the host establishment.",
  },
  {
    icon: "🎓",
    title: "Skills & Work Readiness",
    text: "Immersion and apprenticeship give students real workplace exposure — building the practical skills, discipline, and confidence that classroom learning alone cannot provide.",
  },
  {
    icon: "🤝",
    title: "School & Industry Linkage",
    text: "The program strengthens the bridge between local schools and industry, helping align what students learn with what employers in Capiz actually need.",
  },
];

// ── Hero ──────────────────────────────────────────────────────────────────────

function OjtHero() {
  return (
    <section
      style={{
        marginTop: 58,
        minHeight: "calc(100vh - 58px)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={ojtHeroBg}
        alt="OJT/Immersion/Apprenticeship Facilitation"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 0,
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,12,50,0.62)", zIndex: 1 }} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1000,
          margin: "0 auto",
          padding: "90px 28px",
          textAlign: "center",
          animation: "fadeUp 0.9s ease both",
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.3rem, 6vw, 4.6rem)",
            color: "white",
            lineHeight: 1.12,
            letterSpacing: 1,
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            marginBottom: 26,
          }}
        >
          OJT Immersion and Apprenticeship Facilitation
        </h1>
        <div style={{ width: 100, height: 4, background: "#c0151a", borderRadius: 2, margin: "0 auto 28px" }} />
        <p
          style={{
            color: "rgba(255,255,255,0.88)",
            fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
            lineHeight: 1.85,
            fontWeight: 300,
            maxWidth: 700,
            margin: "0 auto",
            textShadow: "0 1px 6px rgba(0,0,0,0.4)",
          }}
        >
          Connecting students and trainees with host establishments across Capiz for
          on-the-job training, work immersion, and apprenticeship — turning classroom
          learning into real workplace experience.
        </p>
      </div>
    </section>
  );
}

// ── Highlights ────────────────────────────────────────────────────────────────

function OjtHighlights() {
  return (
    <section style={{ padding: "80px 24px 0", background: "white" }}>
      <div style={container}>
        <span style={sectionLabel}>About the Program</span>
        <h2 style={sectionTitle}>What We Facilitate</h2>
        <p style={sectionSub}>
          PESO Capiz serves as the bridge between schools, trainees, and host establishments —
          handling coordination, endorsement, and documentation from application to deployment.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            marginTop: 44,
          }}
        >
          {OJT_HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              style={{
                background: "white",
                borderRadius: 12,
                padding: "26px 24px",
                border: "1px solid rgba(26,29,94,0.08)",
                borderTop: "4px solid #c0151a",
                boxShadow: "0 4px 20px rgba(26,29,94,0.06)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(192,21,26,0.08)",
                  border: "2px solid rgba(192,21,26,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  marginBottom: 14,
                }}
              >
                {h.icon}
              </div>
              <h4
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.02rem",
                  color: "#1a1d5e",
                  marginBottom: 8,
                  letterSpacing: 0.3,
                }}
              >
                {h.title}
              </h4>
              <p style={{ fontSize: "0.86rem", color: "#5a5a7a", lineHeight: 1.65, margin: 0 }}>{h.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Photo card (shared by both galleries) ─────────────────────────────────────

function PhotoCard({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        width: "100%",
        padding: 0,
        border: "1px solid rgba(26,29,94,0.08)",
        borderRadius: 12,
        overflow: "hidden",
        background: "white",
        cursor: "pointer",
        textAlign: "left",
        boxShadow: hovered ? "0 10px 30px rgba(26,29,94,0.16)" : "0 4px 18px rgba(26,29,94,0.07)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        fontFamily: "'Source Sans 3', sans-serif",
      }}
    >
      <div style={{ width: "100%", aspectRatio: "4 / 3", overflow: "hidden", background: "#eef0f6" }}>
        <img
          src={item.image}
          alt={item.alt}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.4s ease",
          }}
        />
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1d5e", margin: 0, lineHeight: 1.45 }}>
          {item.caption}
        </p>
      </div>
    </button>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ item, onClose }: { item: GalleryItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(10,12,40,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 0.2s ease both",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close image"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "white",
          fontSize: "1.1rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ✕
      </button>

      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1000, width: "100%", textAlign: "center" }}>
        <img
          src={item.image}
          alt={item.alt}
          style={{
            maxWidth: "100%",
            maxHeight: "78vh",
            objectFit: "contain",
            borderRadius: 10,
            display: "block",
            margin: "0 auto",
            boxShadow: "0 12px 50px rgba(0,0,0,0.5)",
          }}
        />
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.92rem", marginTop: 16 }}>{item.caption}</p>
      </div>
    </div>
  );
}

// ── Documentation gallery (5 images) ──────────────────────────────────────────

function OjtDocumentation({ onOpen }: { onOpen: (item: GalleryItem) => void }) {
  return (
    <section style={{ padding: "80px 24px", background: "white" }}>
      <div style={container}>
        <span style={sectionLabel}>Documentation</span>
        <h2 style={sectionTitle}>Program Documentation</h2>
        <p style={sectionSub}>
          Photo documentation from the facilitation process — orientation, coordination with
          partner establishments, applicant processing, and deployment.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 18,
            marginTop: 44,
          }}
        >
          {OJT_DOCUMENTATION.map((item, i) => (
            <PhotoCard key={`doc-${i}`} item={item} onClick={() => onOpen(item)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── OJT in action gallery ─────────────────────────────────────────────────────

function OjtInAction({ onOpen }: { onOpen: (item: GalleryItem) => void }) {
  return (
    <section style={{ padding: "80px 24px", background: "#f4f4f6" }}>
      <div style={container}>
        <span style={sectionLabel}>OJT/Immersion/Apprenticeship Facilitation</span>
        <h2 style={sectionTitle}>Work in Action</h2>
        <p style={sectionSub}>
          Our trainees in their host establishments — gaining hands-on experience in real
          workplaces across the province.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginTop: 44,
          }}
        >
          {OJT_IN_ACTION.map((item, i) => (
            <PhotoCard key={`action-${i}`} item={item} onClick={() => onOpen(item)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Call to action ────────────────────────────────────────────────────────────

function OjtCallToAction() {
  return (
    <section style={{ padding: "70px 24px", background: "white" }}>
      <div style={container}>
        <div
          style={{
            background: "linear-gradient(160deg, #0f1240 0%, #1a1d5e 60%, #0f1240 100%)",
            borderRadius: 16,
            padding: "40px 32px",
            textAlign: "center",
            border: "2px solid rgba(232,168,0,0.35)",
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.3rem, 3vw, 1.9rem)",
              color: "white",
              marginBottom: 14,
              lineHeight: 1.3,
            }}
          >
            Interested in OJT, Immersion, or Apprenticeship?
          </h3>
          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "0.95rem",
              lineHeight: 1.75,
              maxWidth: 560,
              margin: "0 auto 26px",
              fontWeight: 300,
            }}
          >
            Students, schools, and establishments looking to partner with us can visit or
            contact the PESO Capiz office for requirements and coordination.
          </p>
          <a
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#f5c842",
              color: "#1a1d5e",
              padding: "12px 30px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 800,
              fontSize: "0.9rem",
              letterSpacing: 0.3,
              boxShadow: "0 4px 16px rgba(245,200,66,0.3)",
            }}
          >
            Contact PESO Capiz →
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: "#1a1d5e", color: "rgba(255,255,255,0.6)", padding: "48px 24px 28px" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 40,
          marginBottom: 40,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
              <img src={pesoLogo} alt="PESO" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1rem", lineHeight: 1.3 }}>
              Public Employment<br />Service Office
            </div>
          </div>
          <p style={{ fontSize: "0.88rem", lineHeight: 1.75, maxWidth: 260 }}>
            Serving the Filipino workforce with integrity, dedication, and compassion. A service
            under the Department of Labor and Employment.
          </p>
        </div>
        <div>
          <h5 style={{ fontSize: "0.78rem", letterSpacing: 3, textTransform: "uppercase", color: "#f5c842", marginBottom: 14 }}>
            Quick Links
          </h5>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {["Job Search", "DOLE Programs", "TESDA Courses"].map((link) => (
              <li key={link}>
                <a
                  href="https://dole.gov.ph/"
                  style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: "0.9rem" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 style={{ fontSize: "0.78rem", letterSpacing: 3, textTransform: "uppercase", color: "#f5c842", marginBottom: 14 }}>
            Contact
          </h5>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
            Room 208, 2nd Floor, Provincial Capitol, Taft St., Brgy. III, Roxas City, Capiz.
            <br />Philippines 5800<br /><br />
            📞 (036) 620 3550<br />✉️ pesocapiz@gmail.com<br />🕐 Mon–Fri, 8:00 AM – 5:00 PM
          </p>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p style={{ fontSize: "0.82rem" }}>© 2026 Public Employment Service Office Capiz. All rights reserved.</p>
        <p style={{ fontSize: "0.82rem" }}>Department of Labor and Employment</p>
      </div>
    </footer>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const container: React.CSSProperties = { maxWidth: 1100, margin: "0 auto" };
const sectionLabel: React.CSSProperties = {
  display: "inline-block",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: 4,
  textTransform: "uppercase",
  color: "#c0151a",
  marginBottom: 12,
};
const sectionTitle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
  color: "#1a1d5e",
  lineHeight: 1.2,
  marginBottom: 16,
};
const sectionSub: React.CSSProperties = {
  color: "#5a5a7a",
  fontSize: "1.05rem",
  lineHeight: 1.7,
  maxWidth: 560,
  fontWeight: 300,
  margin: 0,
};

// ── Root ──────────────────────────────────────────────────────────────────────

export default function OjtPage() {
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Login and Register aren't wired up yet — same as PesoLanding, these are
  // passed through so the navbar renders, but they intentionally do nothing.
  const handleLoginClick = () => {
    // navigate("/login");
  };
  const handleRegisterClick = () => {
    // navigate("/register");
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Source Sans 3', sans-serif; background: #fdf8f0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #c0151a; border-radius: 3px; }
      `}</style>

      <PesoNavbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      <OjtHero />
      <OjtHighlights />
      <OjtDocumentation onOpen={setLightboxItem} />
      <OjtInAction onOpen={setLightboxItem} />
      <OjtCallToAction />
      <Footer />

      <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </>
  );
}