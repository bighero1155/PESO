import { useState, useEffect, useRef, useCallback } from "react";
import pesoLogo from "/assets/peso-logo.png";
import heroBg from "/assets/bg.jpg";
import PesoNavbar from "../pesolanding/PesoNavbar";

// ── Types ────────────────────────────────────────────────────────────────────

interface ServiceCard {
  icon: string;
  title: string;
  description: string;
}

interface Program {
  num: string;
  title: string;
  description: string;
}

interface MVMCard {
  icon: string;
  label: string;
  text: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const SERVICES: ServiceCard[] = [
  { icon: "💼", title: "Job Placement", description: "Matching qualified applicants with local and national employers through our extensive job referral network." },
  { icon: "✈️", title: "Overseas Employment", description: "Facilitation and pre-departure orientation for Filipinos seeking opportunities abroad through legal channels." },
  { icon: "📋", title: "Job Fairs", description: "Regular job fair events bringing together hundreds of employers and thousands of job seekers in one venue." },
  { icon: "🎓", title: "Skills Training", description: "Coordination with TESDA and other agencies to provide vocational and technical training for improved employability." },
  { icon: "🤝", title: "Career Counseling", description: "One-on-one guidance for job seekers on career choices, resume writing, and interview preparation." },
  { icon: "📊", title: "Labor Market Info", description: "Providing up-to-date labor market information to help job seekers make informed career decisions." },
];

const SERVICE_IMAGES: Record<string, string> = {
  "Job Placement":       "/assets/Job_Placement.png",
  "Overseas Employment": "/assets/Overseas_Employment.png",
  "Job Fairs":           "/assets/Job_Fairs.png",
  "Skills Training":     "/assets/Skills_Training.png",
  "Career Counseling":   "/assets/Career_Counseling.png",
  "Labor Market Info":   "/assets/Labor_Market_Info.png",
};

const PROGRAMS: Program[] = [
  { num: "01", title: "TUPAD – Tulong Panghanapbuhay sa Ating Disadvantaged/Displaced Workers", description: "Community-based package of assistance for informal economy workers, displaced or underemployed individuals." },
  { num: "02", title: "SPES – Special Program for Employment of Students", description: "Helping poor but deserving students by providing temporary employment during summer or Christmas break." },
  { num: "03", title: "Government Internship Program (GIP)", description: "Providing college students with government internship experience and exposure to public service." },
  { num: "04", title: "Livelihood and Self-Employment Assistance", description: "Supporting displaced workers and underprivileged community members with livelihood kits and financial assistance." },
];

const MARQUEE_ITEMS = [
  "Job Placement Assistance", "Livelihood Programs", "Overseas Employment",
  "Skills Training", "Job Fairs", "Makakahanap Ng Trabaho",
  "Special Hiring", "Career Counseling",
];

const LOGO_ELEMENTS = [
  { icon: "⚙️", color: "#c0151a", title: "THE GEAR (RED)", desc: "Represents industry, labor, and economic activity. It signifies that employment is the engine that drives progress." },
  { icon: "🤲", color: "#1a1d5e", title: "THE HANDS", desc: "Symbolizes support, care, and guidance. It shows that PESO is here to help and protect every worker." },
  { icon: "☀️", color: "#e8a800", title: "THE SUN (YELLOW)", desc: "From the Philippine flag, it symbolizes hope, optimism, and new opportunities for a brighter future." },
  { icon: "⭕", color: "#1a1d5e", title: "THE CIRCLE", desc: "Signifies unity, cooperation, and continuous service. PESO's commitment to employment is ongoing." },
  { icon: "👥", color: "#1a1d5e", title: "THE PEOPLE", desc: "Represents job seekers, workers, and the community. PESO is for everyone — inclusive and people-centered." },
  { icon: "🏷️", color: "#c0151a", title: "P.E.S.O.", desc: "Stands for Public Employment Service Office — your partner in finding opportunities and building better lives." },
];

const FEATURED_VIDEOS = [
  {
    embedSrc: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F4299528403639822%2F&show_text=false&width=267&t=0",
    url: "https://www.facebook.com/reel/4299528403639822/",
    title: "PESO Capiz Reel",
    description: "Employment services and community programs.",
  },
  {
    embedSrc: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F908486105525091%2F&show_text=false&width=267&t=0",
    url: "https://www.facebook.com/reel/908486105525091/",
    title: "Employment Highlights",
    description: "Connecting job seekers with opportunities across Capiz.",
  },
  {
    embedSrc: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F844936451407285%2F&show_text=false&width=267&t=0",
    url: "https://www.facebook.com/reel/844936451407285/",
    title: "Community Programs",
    description: "DOLE programs supporting displaced and disadvantaged workers.",
  },
];

const MVM_CARDS: MVMCard[] = [
  { icon: "📜", label: "Mandate", text: "Public Employment Service Office provides full and productive employment and decent work for all, and for this purpose, strengthens and expands existing employment facilitation service machinery of the government particularly at the local levels." },
  { icon: "🌅", label: "Vision", text: "Poverty alleviation through full, decent and gainful employment." },
  { icon: "🎯", label: "Mission", text: "We are committed to ensure prompt, timely and efficient delivery of employment services and provision of employment related information that will contribute to the poverty alleviation program of the Capiz Provincial Government." },
];

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{ marginTop: 58, minHeight: "calc(100vh - 56px)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
      <img src={heroBg} alt="PESO Office" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 2 }} />
      <div style={{ position: "relative", zIndex: 3, maxWidth: 1100, margin: "0 auto", padding: "60px 32px", display: "flex", alignItems: "center", gap: 60, width: "100%", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ flexShrink: 0, animation: "fadeIn 0.8s ease both" }}>
          <img src={pesoLogo} alt="PESO Official Seal" style={{ width: 450, height: 450, objectFit: "contain", display: "block", filter: "drop-shadow(0 0 30px rgba(255,255,255,0.3)) drop-shadow(0 4px 20px rgba(0,0,0,0.6))", animation: "pulseGlow 4s ease-in-out infinite" }} />
        </div>
        <div style={{ flex: 1, minWidth: 280, maxWidth: 620, textAlign: "center", animation: "fadeUp 0.9s ease 0.2s both" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 7vw, 5.5rem)", color: "white", lineHeight: 1, marginBottom: 28, textShadow: "0 2px 20px rgba(0,0,0,0.5)", letterSpacing: 2 }}>PESO</h1>
          <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "clamp(0.92rem, 1.5vw, 1.08rem)", lineHeight: 1.85, fontWeight: 300, margin: "0 auto", maxWidth: 560, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
            The Public Employment Service Office (PESO) is a non-fee charging multi-employment service facility or entity established or accredited pursuant to Republic Act No. 8759, otherwise known as the PESO Act of 1999. The Act provides that in order to carry out full employment and equality of employment opportunities for all, and to strengthen and expand the existing employment facilitation service machinery of the government particularly at the local levels, there shall be established in all capital towns of provinces, key cities, and other strategic areas a Public Employment Service Office.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────────────

function MarqueeBar() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{ background: "#e8a800", padding: "12px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ display: "inline-block", animation: "marquee 30s linear infinite" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a1d5e", letterSpacing: 1, textTransform: "uppercase", padding: "0 32px" }}>★&nbsp;&nbsp;{item}</span>
        ))}
      </div>
    </div>
  );
}

// ── Mandate / Vision / Mission ─────────────────────────────────────────────────

function MandateVisionMission() {
  return (
    <section style={{ padding: "70px 24px 0", background: "white" }}>
      <div style={container}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {MVM_CARDS.map((c) => (
            <div key={c.label} style={{ background: "white", borderRadius: 12, padding: "26px 24px", border: "1px solid rgba(26,29,94,0.08)", borderTop: "4px solid #c0151a", boxShadow: "0 4px 20px rgba(26,29,94,0.06)", textAlign: "left" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(192,21,26,0.08)", border: "2px solid rgba(192,21,26,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", marginBottom: 14 }}>{c.icon}</div>
              <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", color: "#1a1d5e", marginBottom: 8, letterSpacing: 0.3 }}>{c.label}</h4>
              <p style={{ fontSize: "0.86rem", color: "#5a5a7a", lineHeight: 1.65, margin: 0 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Services (Full-image Carousel) ────────────────────────────────────────────

function Services() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState<"visible" | "fading">("visible");
  const [isMobile, setIsMobile] = useState(false);
  const total = SERVICES.length;
  const pendingIndex = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const goTo = useCallback((index: number) => {
    if (index === current) return;
    pendingIndex.current = index;
    setFade("fading");
  }, [current]);

  const handleTransitionEnd = () => {
    if (fade === "fading" && pendingIndex.current !== null) {
      setCurrent(pendingIndex.current);
      pendingIndex.current = null;
      setFade("visible");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % total);
    }, 7000);
    return () => clearInterval(timer);
  }, [current, total, goTo]);

  const prev = () => goTo((current - 1 + total) % total);
  const next = () => goTo((current + 1) % total);

  const service = SERVICES[current];
  const imgSrc = SERVICE_IMAGES[service.title];

  return (
    <section id="services" style={{ padding: "90px 24px", background: "white" }}>
      <div style={container}>
        <span style={sectionLabel}>What We Offer</span>
        <h2 style={sectionTitle}>Our Core Services</h2>
        <p style={sectionSub}>We provide a comprehensive range of employment facilitation services to help every Filipino find decent and productive work.</p>

        <div style={{ marginTop: 52, position: "relative" }}>
          <div
            onTransitionEnd={handleTransitionEnd}
            style={{
              position: "relative", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 8px 40px rgba(26,29,94,0.18)",
              maxWidth: isMobile ? "100%" : 800,
              margin: "0 auto", background: "#1a1d5e",
              opacity: fade === "visible" ? 1 : 0,
              transition: "opacity 0.45s ease",
            }}
          >
            <img
              src={imgSrc}
              alt={service.title}
              style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
            />
          </div>

          <button onClick={prev} aria-label="Previous service" style={{ position: "absolute", top: "50%", left: isMobile ? 4 : -20, transform: "translateY(-50%)", width: isMobile ? 36 : 48, height: isMobile ? 36 : 48, borderRadius: "50%", background: "#c0151a", border: "none", color: "white", fontSize: isMobile ? "1.2rem" : "1.6rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(192,21,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, transform 0.15s", zIndex: 10 }} onMouseEnter={e => { e.currentTarget.style.background = "#a01015"; e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#c0151a"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}>‹</button>

          <button onClick={next} aria-label="Next service" style={{ position: "absolute", top: "50%", right: isMobile ? 4 : -20, transform: "translateY(-50%)", width: isMobile ? 36 : 48, height: isMobile ? 36 : 48, borderRadius: "50%", background: "#c0151a", border: "none", color: "white", fontSize: isMobile ? "1.2rem" : "1.6rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(192,21,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, transform 0.15s", zIndex: 10 }} onMouseEnter={e => { e.currentTarget.style.background = "#a01015"; e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#c0151a"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}>›</button>

          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            {SERVICES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} style={{ width: i === current ? 28 : 10, height: 10, borderRadius: 5, border: "none", background: i === current ? "#c0151a" : "rgba(26,29,94,0.18)", cursor: "pointer", padding: 0, transition: "width 0.35s ease, background 0.25s" }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Trivia ────────────────────────────────────────────────────────────────────

function TriviaSection() {
  return (
    <section style={{ padding: "90px 24px", background: "linear-gradient(160deg, #0f1240 0%, #1a1d5e 60%, #0f1240 100%)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ ...container, position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40, alignItems: "flex-start", marginBottom: 52 }}>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif", color: "#f5c842", fontSize: "1.3rem", fontStyle: "italic", fontWeight: 400, marginBottom: 4 }}>Trivia about the</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 7vw, 5rem)", color: "white", lineHeight: 1, marginBottom: 20, letterSpacing: 1 }}>PESO</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem", lineHeight: 1.75, fontWeight: 300, maxWidth: 380 }}>Every element in the PESO logo represents the office's commitment to public service and employment for all.</p>
          </div>
          <div style={{ background: "#1a1d5e", border: "2px solid rgba(232,168,0,0.4)", borderRadius: 14, padding: "24px 28px", display: "flex", gap: 18, alignItems: "flex-start", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(232,168,0,0.15)", border: "2px solid rgba(232,168,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>💡</div>
            <div>
              <p style={{ color: "#f5c842", fontWeight: 700, fontSize: "0.9rem", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>TRIVIA!</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.92rem", lineHeight: 1.7, margin: 0 }}>The <strong style={{ color: "#f5c842" }}>"O"</strong> in PESO is intentionally emphasized — it resembles a <strong style={{ color: "#f5c842" }}>coin</strong>, symbolizing livelihood, value, and the goal of providing decent work and income.</p>
            </div>
          </div>
        </div>
        <div style={{ border: "2px solid rgba(255,255,255,0.12)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ background: "#1a1d5e", borderBottom: "2px solid rgba(232,168,0,0.4)", padding: "14px 24px", textAlign: "center" }}>
            <span style={{ color: "#f5c842", fontWeight: 700, fontSize: "0.85rem", letterSpacing: 3, textTransform: "uppercase" }}>WHAT EACH ELEMENT MEANS</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", background: "rgba(255,255,255,0.03)" }}>
            {LOGO_ELEMENTS.map((el, i) => (
              <div key={el.title} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "22px 24px", borderBottom: i < LOGO_ELEMENTS.length - 2 ? "1px solid rgba(255,255,255,0.07)" : "none", borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: `${el.color}22`, border: `2px solid ${el.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{el.icon}</div>
                <div>
                  <p style={{ color: el.color === "#e8a800" ? "#f5c842" : el.color === "#c0151a" ? "#e05560" : "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: 0.5, marginBottom: 5 }}>{el.title}</p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.88rem", lineHeight: 1.65, margin: 0 }}>{el.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 28, background: "#1a1d5e", border: "2px solid rgba(232,168,0,0.35)", borderRadius: 12, padding: "18px 28px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: "1.4rem" }}>⭐</span>
            <span style={{ fontFamily: "'Playfair Display', serif", color: "#f5c842", fontSize: "1.2rem", fontStyle: "italic" }}>In short:</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>The PESO logo represents a simple but powerful mission: <strong style={{ color: "#f5c842" }}>Connecting people to jobs, supporting their growth, and building a stronger community.</strong></p>
        </div>
      </div>
    </section>
  );
}

// ── Featured Videos ───────────────────────────────────────────────────────────

function FeaturedVideos() {
  return (
    <section id="videos" style={{ padding: "90px 24px", background: "#f4f4f6" }}>
      <div style={container}>
        <span style={sectionLabel}>On Social Media</span>
        <h2 style={sectionTitle}>Featured Videos</h2>
        <p style={sectionSub}>Watch our latest reels directly from our Facebook page — no redirect needed.</p>
        <div style={{ display: "flex", gap: 28, marginTop: 48, justifyContent: "center", flexWrap: "wrap", alignItems: "flex-start" }}>
          {FEATURED_VIDEOS.map((video, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(26,29,94,0.10)", width: 267, flexShrink: 0 }}>
              <iframe src={video.embedSrc} width="267" height="476" style={{ border: "none", overflow: "hidden", display: "block" }} scrolling="no" frameBorder={0} allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" />
              <div style={{ padding: "14px 16px 16px", width: "100%" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.98rem", color: "#1a1d5e", marginBottom: 4 }}>{video.title}</h3>
                <p style={{ color: "#5a5a7a", fontSize: "0.82rem", lineHeight: 1.55, margin: "0 0 10px" }}>{video.description}</p>
                <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#1877f2", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#1877f2", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", fontWeight: 900, flexShrink: 0 }}>f</span>
                  Open on Facebook ↗
                </a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <a href="https://www.facebook.com/PESOCapiz" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#1877f2", color: "white", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: "0.9rem", boxShadow: "0 4px 16px rgba(24,119,242,0.35)", transition: "background 0.2s" }} onMouseEnter={e => (e.currentTarget.style.background = "#1464d8")} onMouseLeave={e => (e.currentTarget.style.background = "#1877f2")}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.85rem" }}>f</span>
            Follow Us on Facebook
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Programs ──────────────────────────────────────────────────────────────────

function Programs() {
  return (
    <section id="programs" style={{ padding: "90px 24px", background: "#f4f4f6" }}>
      <div style={container}>
        <span style={sectionLabel}>Government Programs</span>
        <h2 style={sectionTitle}>Special Employment Programs</h2>
        <p style={sectionSub}>We implement various DOLE programs designed to address specific employment needs across different sectors.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginTop: 52 }}>
          {PROGRAMS.map((p) => (<ProgramItem key={p.num} {...p} />))}
        </div>
      </div>
    </section>
  );
}

function ProgramItem({ num, title, description }: Program) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ display: "flex", alignItems: "flex-start", gap: 18, background: "white", borderRadius: 10, padding: 24, borderLeft: "4px solid #c0151a", boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.08)" : "none", transition: "box-shadow 0.25s" }}>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 900, color: "rgba(192,21,26,0.15)", lineHeight: 1, minWidth: 42 }}>{num}</span>
      <div>
        <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "#1a1d5e", marginBottom: 6 }}>{title}</h4>
        <p style={{ fontSize: "0.88rem", color: "#5a5a7a", lineHeight: 1.6, margin: 0 }}>{description}</p>
      </div>
    </div>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function CTA({ onRegisterClick }: { onRegisterClick: () => void }) {
  return (
    <section id="contact" style={{ background: "#c0151a", textAlign: "center", padding: "80px 24px" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "white", marginBottom: 14 }}>Ready to Find Your Next Opportunity?</h2>
      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.05rem", marginBottom: 32, fontWeight: 300 }}>Visit your nearest PESO office or register online to access our full range of employment services — free of charge.</p>
      <button onClick={onRegisterClick} style={{ background: "white", color: "#c0151a", padding: "14px 32px", borderRadius: 6, border: "none", fontWeight: 700, fontSize: "0.95rem", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => (e.currentTarget.style.background = "#fdf8f0")} onMouseLeave={e => (e.currentTarget.style.background = "white")}>
        Register as Job Seeker
      </button>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer id="about" style={{ background: "#1a1d5e", color: "rgba(255,255,255,0.6)", padding: "48px 24px 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 40, marginBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
              <img src={pesoLogo} alt="PESO" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1rem", lineHeight: 1.3 }}>Public Employment<br />Service Office</div>
          </div>
          <p style={{ fontSize: "0.88rem", lineHeight: 1.75, maxWidth: 260 }}>Serving the Filipino workforce with integrity, dedication, and compassion. A service under the Department of Labor and Employment.</p>
        </div>
        <div>
          <h5 style={{ fontSize: "0.78rem", letterSpacing: 3, textTransform: "uppercase", color: "#f5c842", marginBottom: 14 }}>Quick Links</h5>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {["Job Search", "Register as Employer", "Upcoming Job Fairs", "DOLE Programs", "TESDA Courses"].map(link => (
              <li key={link}><a href="#" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: "0.9rem" }} onMouseEnter={e => (e.currentTarget.style.color = "white")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}>{link}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h5 style={{ fontSize: "0.78rem", letterSpacing: 3, textTransform: "uppercase", color: "#f5c842", marginBottom: 14 }}>Contact</h5>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
            Capiz, Capiz<br />Philippines 5800<br /><br />
            📞 (036) 620 3550<br />✉️ pesocapiz@gmail.com<br />🕐 Mon–Fri, 8:00 AM – 5:00 PM
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <p style={{ fontSize: "0.82rem" }}>© 2026 Public Employment Service Office Capiz. All rights reserved.</p>
        <p style={{ fontSize: "0.82rem" }}>Department of Labor and Employment</p>
      </div>
    </footer>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const container: React.CSSProperties = { maxWidth: 1100, margin: "0 auto" };
const sectionLabel: React.CSSProperties = { display: "inline-block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "#c0151a", marginBottom: 12 };
const sectionTitle: React.CSSProperties = { fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#1a1d5e", lineHeight: 1.2, marginBottom: 16 };
const sectionSub: React.CSSProperties = { color: "#5a5a7a", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 560, fontWeight: 300, margin: 0 };

// ── Root ──────────────────────────────────────────────────────────────────────

export default function PesoLanding() {

  // Login and Register are not wired up yet — routes/pages aren't ready.
  // Commented out the navigation so the buttons render but do nothing for now.
  // When ready, uncomment the navigate() calls below to re-enable.
  const handleLoginClick = () => {
    // navigate("/login");
  };
  const handleRegisterClick = () => {
    // navigate("/register");
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.3)) drop-shadow(0 4px 20px rgba(0,0,0,0.6)); }
          50%       { filter: drop-shadow(0 0 40px rgba(255,255,255,0.55)) drop-shadow(0 4px 20px rgba(0,0,0,0.6)); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Source Sans 3', sans-serif; background: #fdf8f0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #c0151a; border-radius: 3px; }
      `}</style>

      <PesoNavbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      <Hero />
      <MarqueeBar />
      <MandateVisionMission />
      <Services />
      <TriviaSection />
      <FeaturedVideos />
      <Programs />
      <CTA onRegisterClick={handleRegisterClick} />
      <Footer />
    </>
  );
}