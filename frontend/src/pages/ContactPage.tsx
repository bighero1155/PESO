import { useState } from "react";
import pesoLogo from "/assets/peso-logo.png";
import { useNavigate } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ── Apps Script endpoint ──────────────────────────────────────────────────────
// Standalone Web App — see ContactPage.gs. Handles sheet write + confirmation
// email to sender + notification email to staff, all in one request.

const CONTACT_SUBMIT_URL =
  "https://script.google.com/macros/s/AKfycbz7sj_I98XjVgLuPuiJAJhnyuZt8lASGVpTAFZyM-I7xZYFPnrTLgXwQ2zZnS4YOIdY/exec";

async function submitContactForm(
  form: FormState
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(CONTACT_SUBMIT_URL, {
      method:  "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body:    JSON.stringify({
        name:    form.name.trim(),
        email:   form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      }),
    });
    const data = await res.json();

    if (data.success) return { success: true };
    return { success: false, error: data.error || "Something went wrong. Please try again." };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ── Data ──────────────────────────────────────────────────────────────────────

const INFO_CARDS = [
  {
    icon: "📍",
    label: "Office Address",
    lines: [
      "Room 208, 2nd Floor",
      "Provincial Capitol, Taft St.",
      "Brgy. III, Roxas City",
      "Capiz, Philippines 5800",
    ],
    href: "https://maps.google.com/?q=Provincial+Capitol+Roxas+City+Capiz+Philippines",
    cta: "Get Directions ↗",
  },
  {
    icon: "📞",
    label: "Phone",
    lines: ["(036) 620 3550"],
    href: "tel:+6336620 3550",
    cta: "Call Now ↗",
  },
  {
    icon: "🕐",
    label: "Office Hours",
    lines: ["Monday – Friday", "8:00 AM – 5:00 PM", "(Closed on Holidays)"],
    href: null,
    cta: null,
  },
  {
    icon: "👍",
    label: "Facebook Page",
    lines: ["PESO – CAPIZ Public", "Employment Service Office", "48K Followers"],
    href: "https://www.facebook.com/PESOCapiz",
    cta: "Visit Page ↗",
  },
  {
    icon: "⭐",
    label: "Reviews",
    lines: ["90% Recommend", "Based on 40 Reviews", "Open Now"],
    href: "https://www.facebook.com/PESOCapiz/reviews",
    cta: "Leave a Review ↗",
  },
];

const FAQ = [
  {
    q: "Is PESO's service free of charge?",
    a: "Yes. PESO is a non-fee charging multi-employment service facility. All services including job referrals, career counseling, and job fair registration are completely free.",
  },
  {
    q: "Who can avail of PESO services?",
    a: "Any Filipino job seeker, displaced worker, student, or employer can avail of PESO services. Programs like SPES are specifically for students, while TUPAD targets informal sector workers.",
  },
  {
    q: "How do I register as a job seeker?",
    a: "You can register online through this portal by clicking 'Register', or visit our office at Room 208, Provincial Capitol, Roxas City in person during office hours.",
  },
  {
    q: "Does PESO assist with overseas employment?",
    a: "Yes. PESO facilitates pre-departure orientations and coordinates with POEA for Filipinos seeking legal overseas employment opportunities.",
  },
  {
    q: "How can employers post job vacancies?",
    a: "Employers can register on this portal and post job listings, or visit our office directly. We will help match your vacancies with qualified applicants from our database.",
  },
];

// ── Navbar ────────────────────────────────────────────────────────────────────

function ContactNavbar() {
  const navigate = useNavigate();
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "#c0151a",
      boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      fontFamily: "'Source Sans 3', sans-serif",
    }}>
      <div style={{
        maxWidth: 1300, margin: "0 auto",
        display: "flex", alignItems: "center",
        height: 58, padding: "0 20px", gap: 16,
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.12)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            borderRadius: 7, padding: "6px 14px",
            color: "white", fontSize: "0.82rem", fontWeight: 600,
            cursor: "pointer", letterSpacing: 0.3,
          }}
        >
          ← Back
        </button>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src={pesoLogo} alt="PESO" style={{ width: 38, height: 38, objectFit: "contain" }} />
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: "0.9rem", letterSpacing: 1 }}>P.E.S.O.</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.52rem", letterSpacing: 0.8, textTransform: "uppercase" }}>Roxas City</div>
          </div>
        </a>
        <div style={{ flex: 1 }} />
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>Contact Us</span>
      </div>
    </nav>
  );
}

// ── Hero Banner ───────────────────────────────────────────────────────────────

function ContactHero() {
  return (
    <section style={{
      marginTop: 58,
      background: "linear-gradient(135deg, #c0151a 0%, #8b0d11 50%, #1a1d5e 100%)",
      padding: "72px 24px 80px",
      position: "relative", overflow: "hidden",
      textAlign: "center",
    }}>
      {/* dot grid texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px", pointerEvents: "none",
      }} />
      {/* diagonal accent */}
      <div style={{
        position: "absolute", bottom: -1, left: 0, right: 0,
        height: 60,
        background: "white",
        clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <span style={{
          display: "inline-block", background: "rgba(245,200,66,0.18)",
          border: "1px solid rgba(245,200,66,0.4)",
          color: "#f5c842", fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: 4, textTransform: "uppercase",
          padding: "6px 18px", borderRadius: 20, marginBottom: 20,
          fontFamily: "'Source Sans 3', sans-serif",
        }}>
          Get In Touch
        </span>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2.4rem, 5vw, 4rem)",
          color: "white", lineHeight: 1.1, marginBottom: 18,
          textShadow: "0 2px 20px rgba(0,0,0,0.3)",
        }}>
          Contact Us
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: "1.05rem", fontWeight: 300,
          maxWidth: 520, margin: "0 auto",
          fontFamily: "'Source Sans 3', sans-serif",
          lineHeight: 1.7,
        }}>
          We're here to help. Reach out to us through any of the channels below or visit our office during business hours.
        </p>
      </div>
    </section>
  );
}

// ── Info Cards ────────────────────────────────────────────────────────────────

function InfoCards() {
  return (
    <section style={{ background: "white", padding: "72px 24px 60px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}>
          {INFO_CARDS.map((card) => (
            <InfoCard key={card.label} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, lines, href, cta }: typeof INFO_CARDS[0]) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fdf8f0" : "white",
        border: `1.5px solid ${hovered ? "rgba(192,21,26,0.25)" : "rgba(26,29,94,0.08)"}`,
        borderRadius: 14,
        padding: "28px 24px",
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 12px 32px rgba(192,21,26,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
        position: "relative", overflow: "hidden",
        fontFamily: "'Source Sans 3', sans-serif",
      }}
    >
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #c0151a, #e8a800)",
        transform: hovered ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left", transition: "transform 0.3s ease",
      }} />
      <div style={{ fontSize: "2rem", marginBottom: 14 }}>{icon}</div>
      <p style={{
        fontSize: "0.7rem", fontWeight: 700, letterSpacing: 3,
        textTransform: "uppercase", color: "#c0151a", marginBottom: 10,
      }}>
        {label}
      </p>
      {lines.map((line, i) => (
        <p key={i} style={{
          color: "#1a1d5e", fontSize: "0.95rem", fontWeight: i === 0 ? 600 : 400,
          lineHeight: 1.5, margin: "2px 0",
        }}>
          {line}
        </p>
      ))}
      {href && cta && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block", marginTop: 14,
            color: "#c0151a", fontSize: "0.82rem", fontWeight: 700,
            textDecoration: "none", letterSpacing: 0.3,
          }}
        >
          {cta}
        </a>
      )}
    </div>
  );
}

// ── Map + Form ────────────────────────────────────────────────────────────────

function MapAndForm() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const result = await submitContactForm(form);
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error || "Something went wrong. Please try again.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px",
    border: "1.5px solid rgba(26,29,94,0.15)",
    borderRadius: 8, fontSize: "0.93rem",
    color: "#1a1d5e", background: "white",
    fontFamily: "'Source Sans 3', sans-serif",
    outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  return (
    <section style={{ background: "#f4f4f6", padding: "0 24px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

          {/* MAP */}
          <div>
            <div style={{
              background: "white", borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(26,29,94,0.08)",
              border: "1.5px solid rgba(26,29,94,0.08)",
            }}>
              <div style={{
                background: "#1a1d5e", padding: "16px 24px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: "1.2rem" }}>🗺️</span>
                <div>
                  <p style={{
                    color: "#f5c842", fontWeight: 700, fontSize: "0.72rem",
                    letterSpacing: 3, textTransform: "uppercase",
                    fontFamily: "'Source Sans 3', sans-serif", margin: 0,
                  }}>Our Location</p>
                  <p style={{
                    color: "rgba(255,255,255,0.7)", fontSize: "0.85rem",
                    fontFamily: "'Source Sans 3', sans-serif", margin: 0,
                  }}>
                    Provincial Capitol, Roxas City, Capiz
                  </p>
                </div>
              </div>
              {/* Google Maps embed — Provincial Capitol Roxas City */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4!2d122.7513!3d11.5858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a5f1c4f6b4a7b5%3A0x0!2sProvincial+Capitol%2C+Taft+St%2C+Roxas+City%2C+5800+Capiz!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                width="100%"
                height="320"
                style={{ border: "none", display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="PESO Capiz Location"
              />
              <div style={{ padding: "20px 24px" }}>
                <p style={{
                  fontFamily: "'Source Sans 3', sans-serif",
                  color: "#5a5a7a", fontSize: "0.88rem", lineHeight: 1.6, margin: "0 0 14px",
                }}>
                  📍 Room 208, 2nd Floor, Provincial Capitol Building,<br />
                  Taft St., Brgy. III, Roxas City, Capiz 5800
                </p>
                <a
                  href="https://maps.google.com/?q=Provincial+Capitol+Taft+St+Roxas+City+Capiz+Philippines"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#1a1d5e", color: "white",
                    padding: "10px 20px", borderRadius: 7,
                    textDecoration: "none", fontSize: "0.85rem", fontWeight: 700,
                    fontFamily: "'Source Sans 3', sans-serif",
                    boxShadow: "0 2px 10px rgba(26,29,94,0.2)",
                  }}
                >
                  📍 Open in Google Maps
                </a>
              </div>
            </div>

            {/* Social links */}
            <div style={{
              marginTop: 24, background: "white", borderRadius: 14,
              padding: "24px", border: "1.5px solid rgba(26,29,94,0.08)",
              boxShadow: "0 4px 24px rgba(26,29,94,0.06)",
            }}>
              <p style={{
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: "0.72rem", fontWeight: 700, letterSpacing: 3,
                textTransform: "uppercase", color: "#c0151a", marginBottom: 16,
              }}>
                Follow Us
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <a
                  href="https://www.facebook.com/PESOCapiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#1877f2", color: "white",
                    padding: "10px 18px", borderRadius: 8,
                    textDecoration: "none", fontSize: "0.85rem", fontWeight: 700,
                    fontFamily: "'Source Sans 3', sans-serif",
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: "0.75rem",
                  }}>f</span>
                  Facebook Page
                </a>
                <a
                  href="https://www.facebook.com/PESOCapiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#f4f4f6", color: "#1a1d5e",
                    border: "1.5px solid rgba(26,29,94,0.12)",
                    padding: "10px 18px", borderRadius: 8,
                    textDecoration: "none", fontSize: "0.85rem", fontWeight: 700,
                    fontFamily: "'Source Sans 3', sans-serif",
                  }}
                >
                  💬 Message Us
                </a>
              </div>
              <p style={{
                fontFamily: "'Source Sans 3', sans-serif",
                color: "#5a5a7a", fontSize: "0.82rem", marginTop: 12,
              }}>
                48K followers · 90% recommend (40 reviews)
              </p>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div style={{
            background: "white", borderRadius: 16,
            boxShadow: "0 4px 24px rgba(26,29,94,0.08)",
            border: "1.5px solid rgba(26,29,94,0.08)",
            overflow: "hidden",
          }}>
            <div style={{
              background: "#c0151a", padding: "20px 28px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: "1.3rem" }}>✉️</span>
              <div>
                <p style={{
                  color: "#f5c842", fontWeight: 700, fontSize: "0.72rem",
                  letterSpacing: 3, textTransform: "uppercase",
                  fontFamily: "'Source Sans 3', sans-serif", margin: 0,
                }}>Send a Message</p>
                <p style={{
                  color: "rgba(255,255,255,0.75)", fontSize: "0.85rem",
                  fontFamily: "'Source Sans 3', sans-serif", margin: 0,
                }}>We'll respond within 1–2 business days</p>
              </div>
            </div>

            <div style={{ padding: "32px 28px" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#1a1d5e", fontSize: "1.5rem", marginBottom: 10,
                  }}>Message Sent!</h3>
                  <p style={{
                    color: "#5a5a7a", fontSize: "0.95rem",
                    fontFamily: "'Source Sans 3', sans-serif", lineHeight: 1.6,
                  }}>
                    Thank you for reaching out. Our team will get back to you within 1–2 business days.
                    A confirmation has also been sent to your email.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    style={{
                      marginTop: 24, background: "#c0151a", color: "white",
                      border: "none", borderRadius: 8, padding: "10px 24px",
                      fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Source Sans 3', sans-serif",
                    }}
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {submitError && (
                    <div style={{
                      background: "rgba(192,21,26,0.08)",
                      border: "1.5px solid rgba(192,21,26,0.25)",
                      borderRadius: 8, padding: "12px 16px",
                      color: "#c0151a", fontSize: "0.85rem", fontWeight: 600,
                      fontFamily: "'Source Sans 3', sans-serif",
                    }}>
                      {submitError}
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1a1d5e", marginBottom: 6, fontFamily: "'Source Sans 3', sans-serif", letterSpacing: 0.5 }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Juan dela Cruz"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#c0151a")}
                        onBlur={e => (e.target.style.borderColor = "rgba(26,29,94,0.15)")}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1a1d5e", marginBottom: 6, fontFamily: "'Source Sans 3', sans-serif", letterSpacing: 0.5 }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="juan@example.com"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#c0151a")}
                        onBlur={e => (e.target.style.borderColor = "rgba(26,29,94,0.15)")}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1a1d5e", marginBottom: 6, fontFamily: "'Source Sans 3', sans-serif", letterSpacing: 0.5 }}>
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, appearance: "none" }}
                      onFocus={e => (e.target.style.borderColor = "#c0151a")}
                      onBlur={e => (e.target.style.borderColor = "rgba(26,29,94,0.15)")}
                    >
                      <option value="">Select a subject...</option>
                      <option>Job Placement Inquiry</option>
                      <option>TUPAD Program</option>
                      <option>SPES Program</option>
                      <option>Overseas Employment</option>
                      <option>Job Fair Schedule</option>
                      <option>Skills Training / TESDA</option>
                      <option>Employer Registration</option>
                      <option>General Inquiry</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1a1d5e", marginBottom: 6, fontFamily: "'Source Sans 3', sans-serif", letterSpacing: 0.5 }}>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="How can we help you? Please describe your concern in detail..."
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                      onFocus={e => (e.target.style.borderColor = "#c0151a")}
                      onBlur={e => (e.target.style.borderColor = "rgba(26,29,94,0.15)")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: submitting ? "#aaa" : "#c0151a",
                      color: "white", border: "none",
                      borderRadius: 8, padding: "14px 28px",
                      fontSize: "0.95rem", fontWeight: 700,
                      cursor: submitting ? "not-allowed" : "pointer",
                      fontFamily: "'Source Sans 3', sans-serif",
                      letterSpacing: 0.3,
                      transition: "background 0.2s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {submitting ? "Sending..." : "Send Message →"}
                  </button>

                  <p style={{
                    color: "#5a5a7a", fontSize: "0.78rem",
                    fontFamily: "'Source Sans 3', sans-serif",
                    textAlign: "center", margin: 0,
                  }}>
                    Or email us directly at{" "}
                    <a href="mailto:pesocapiz@gmail.com" style={{ color: "#c0151a", fontWeight: 700 }}>
                      pesocapiz@gmail.com
                    </a>
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section style={{
      padding: "80px 24px",
      background: "linear-gradient(160deg, #0f1240 0%, #1a1d5e 60%, #0f1240 100%)",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px", pointerEvents: "none",
      }} />
      <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{
            display: "inline-block", fontSize: "0.72rem", fontWeight: 700,
            letterSpacing: 4, textTransform: "uppercase", color: "#f5c842",
            marginBottom: 12, fontFamily: "'Source Sans 3', sans-serif",
          }}>
            Common Questions
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            color: "white", lineHeight: 1.2,
          }}>
            Frequently Asked Questions
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQ.map((item, i) => (
            <div
              key={i}
              style={{
                background: open === i ? "rgba(245,200,66,0.08)" : "rgba(255,255,255,0.05)",
                border: open === i ? "1.5px solid rgba(245,200,66,0.35)" : "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: 12, overflow: "hidden",
                transition: "all 0.25s ease",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "18px 24px",
                  background: "transparent", border: "none", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  gap: 16,
                }}
              >
                <span style={{
                  color: open === i ? "#f5c842" : "rgba(255,255,255,0.9)",
                  fontSize: "0.95rem", fontWeight: 600,
                  fontFamily: "'Source Sans 3', sans-serif",
                  lineHeight: 1.4,
                }}>
                  {item.q}
                </span>
                <span style={{
                  color: open === i ? "#f5c842" : "rgba(255,255,255,0.5)",
                  fontSize: "1.2rem", flexShrink: 0,
                  transform: open === i ? "rotate(45deg)" : "none",
                  transition: "transform 0.25s ease",
                }}>
                  +
                </span>
              </button>
              {open === i && (
                <div style={{ padding: "0 24px 20px" }}>
                  <p style={{
                    color: "rgba(255,255,255,0.7)", fontSize: "0.92rem",
                    lineHeight: 1.7, margin: 0,
                    fontFamily: "'Source Sans 3', sans-serif",
                  }}>
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function ContactFooter() {
  return (
    <footer style={{
      background: "#1a1d5e", color: "rgba(255,255,255,0.6)",
      padding: "32px 24px",
      fontFamily: "'Source Sans 3', sans-serif",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={pesoLogo} alt="PESO" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
            © 2026 PESO – Roxas City · Capiz
          </span>
        </div>
        <p style={{ fontSize: "0.82rem" }}>Department of Labor and Employment</p>
      </div>
    </footer>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Source Sans 3', sans-serif; background: #f4f4f6; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #c0151a; border-radius: 3px; }

        @media (max-width: 768px) {
          .map-form-grid { grid-template-columns: 1fr !important; }
          .name-email-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <ContactNavbar />
      <ContactHero />
      <InfoCards />
      <MapAndForm />
      <FAQSection />
      <ContactFooter />
    </>
  );
}