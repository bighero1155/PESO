import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AxiosInstance from "../../auth/axiosInstance";
import { mergeErrors, FieldErrors } from "../../Errors/UserFieldErrors";

type Role = "applicant" | "employer";

type FormField =
  | "username"
  | "first_name"
  | "middle_name"
  | "last_name"
  | "age"
  | "address"
  | "contact_number"
  | "email"
  | "password"
  | "confirm_password"
  | "role";

type FormDataType = Record<FormField, string>;

const colors = {
  navy: "#1a1d5e",
  navyDark: "#0f1240",
  red: "#c0151a",
  gold: "#e8a800",
  goldLight: "#f5c842",
  lightBg: "#f4f4f6",
  white: "#ffffff",
  muted: "#5a5a7a",
  border: "rgba(26,29,94,0.15)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 700,
  color: colors.navy,
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  fontFamily: "'Source Sans 3', sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: `1.5px solid ${colors.border}`,
  borderRadius: 8,
  fontSize: "0.93rem",
  color: "#111",
  background: "white",
  outline: "none",
  fontFamily: "'Source Sans 3', sans-serif",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const errorStyle: React.CSSProperties = {
  color: colors.red,
  fontSize: "0.75rem",
  marginTop: 4,
  fontWeight: 600,
};

// ── ResendButton ──────────────────────────────────────────────────────────────

const ResendButton: React.FC<{ email: string }> = ({ email }) => {
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setLoading(true);
    setResendError("");
    setSent(false);
    try {
      await AxiosInstance.post("/email/resend", { email });
      setSent(true);
      setCooldown(60);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setResendError("This email is already verified. You can log in.");
      } else if (err.response?.status === 429) {
        setResendError("Too many requests. Please wait a minute.");
        setCooldown(60);
      } else {
        setResendError("Failed to resend. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      {sent && (
        <p style={{ color: "#16a34a", fontSize: "0.82rem", marginBottom: 10, fontWeight: 600 }}>
          ✅ Resent! Check your inbox (and spam folder).
        </p>
      )}
      {resendError && (
        <p style={{ color: colors.red, fontSize: "0.82rem", marginBottom: 10, fontWeight: 600 }}>
          ⚠️ {resendError}
        </p>
      )}
      <button
        onClick={handleResend}
        disabled={loading || cooldown > 0}
        style={{
          background: cooldown > 0 ? "#e4e4ee" : colors.navy,
          color: cooldown > 0 ? colors.muted : "white",
          border: "none",
          borderRadius: 8,
          padding: "11px 24px",
          fontWeight: 700,
          fontSize: "0.87rem",
          cursor: cooldown > 0 ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          fontFamily: "'Source Sans 3', sans-serif",
        }}
      >
        {loading
          ? "Sending..."
          : cooldown > 0
          ? `Resend in ${cooldown}s`
          : "Resend Verification Email"}
      </button>
    </div>
  );
};

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({
  label, name, value, onChange, error, type = "text", placeholder, required,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; type?: string; placeholder?: string; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: colors.red }}> *</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder || label}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          borderColor: error ? colors.red : focused ? colors.navy : colors.border,
          boxShadow: focused ? `0 0 0 3px rgba(26,29,94,0.1)` : "none",
        }}
      />
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
}

// ── PasswordField ─────────────────────────────────────────────────────────────

function PasswordField({
  label, name, value, onChange, error, required,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: colors.red }}> *</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"} name={name} value={value}
          onChange={onChange} placeholder={label}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            ...inputStyle, paddingRight: 44,
            borderColor: error ? colors.red : focused ? colors.navy : colors.border,
            boxShadow: focused ? `0 0 0 3px rgba(26,29,94,0.1)` : "none",
          }}
        />
        <button
          type="button" onClick={() => setShow(!show)}
          style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)", background: "none", border: "none",
            cursor: "pointer", fontSize: "1rem", color: colors.muted, padding: 0, lineHeight: 1,
          }}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
}

// ── Main Register ─────────────────────────────────────────────────────────────

const Register: React.FC = () => {

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [formData, setFormData] = useState<FormDataType>({
    username: "", first_name: "", middle_name: "", last_name: "",
    age: "", address: "", contact_number: "", email: "",
    password: "", confirm_password: "", role: "applicant",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setFormData((prev) => ({ ...prev, role }));
    setCurrentStep(1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name as FormField;
    setFormData({ ...formData, [name]: e.target.value });
    if (errors[name]) setErrors({ ...errors, [name]: [] });
    setMessage(null);
  };

  const stepFields: Record<number, FormField[]> = {
    1: ["first_name", "middle_name", "last_name", "username"],
    2: ["email", "age", "contact_number", "address"],
    3: ["password", "confirm_password"],
  };

  const totalSteps = 3;

  const validateStep = (): boolean => {
    const fields = stepFields[currentStep];
    const newErrors: FieldErrors = {};
    const optional: FormField[] = ["middle_name", "contact_number", "address"];

    fields.forEach((field) => {
      if (optional.includes(field)) return;
      if (!formData[field].trim()) {
        newErrors[field] = ["This field is required"];
      }
    });

    if (currentStep === 3) {
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = ["Passwords do not match"];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setErrors({});
    setMessage(null);
    if (currentStep === 1) {
      setCurrentStep(0);
      setSelectedRole(null);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirm_password: _, ...payload } = formData;
      await AxiosInstance.post("/register", payload);

      // Show "check your email" screen instead of redirecting
      setRegisteredEmail(formData.email);
      setRegistered(true);
    } catch (error: any) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors;
        setErrors(mergeErrors({}, serverErrors));
        const fields = Object.keys(serverErrors);
        if (fields.includes("username"))
          setMessage({ type: "error", text: "Username is already taken." });
        else if (fields.includes("email"))
          setMessage({ type: "error", text: "Email is already registered." });
        else if (fields.includes("contact_number"))
          setMessage({ type: "error", text: "Contact number is already in use." });
        else
          setMessage({ type: "error", text: "Please fix the errors below." });
      } else if (error.response?.status === 500) {
        setMessage({ type: "error", text: "Server error. Please try again later." });
      } else {
        setMessage({ type: "error", text: "Registration failed. Check your connection." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isEmployer = selectedRole === "employer";
  const progress = currentStep === 0 ? 0 : (currentStep / totalSteps) * 100;
  const stepLabels: Record<number, string> = {
    1: "Personal Info",
    2: "Contact Details",
    3: "Set Password",
  };

  // ── Check Your Email Screen ───────────────────────────────────────────────

  if (registered) {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Source Sans 3', sans-serif; }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.08); }
          }
        `}</style>
        <div style={{
          minHeight: "100vh",
          background: `linear-gradient(160deg, ${colors.navyDark} 0%, ${colors.navy} 55%, #2a1a5e 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px 16px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px", pointerEvents: "none",
          }} />

          <div style={{
            background: colors.lightBg, borderRadius: 20, width: "100%", maxWidth: 480,
            position: "relative", zIndex: 1, overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
            animation: "fadeUp 0.45s ease both",
          }}>
            {/* Header */}
            <div style={{ background: colors.navy, padding: "36px 32px", textAlign: "center", position: "relative" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 4,
                background: `linear-gradient(90deg, ${colors.red}, ${colors.gold})`,
              }} />
              <div style={{ fontSize: "3.5rem", animation: "pulse 2s ease infinite" }}>📧</div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif", color: "white",
                fontSize: "1.6rem", fontWeight: 700, marginTop: 14, lineHeight: 1.2,
              }}>
                Check Your Email
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: 6 }}>
                Verification link sent to
              </p>
              <p style={{
                color: colors.goldLight, fontWeight: 700, fontSize: "0.95rem",
                marginTop: 6, wordBreak: "break-all",
              }}>
                {registeredEmail}
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: "28px 32px 32px", textAlign: "center" }}>
              <p style={{ color: colors.muted, fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 8 }}>
                We sent a verification link to your email. Click it to activate
                your account before logging in.
              </p>
              <p style={{ color: colors.muted, fontSize: "0.82rem", lineHeight: 1.6 }}>
                Don't see it? Check your <strong>spam or junk folder</strong>.
              </p>

              <ResendButton email={registeredEmail} />

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${colors.border}` }}>
                <Link
                  to="/login"
                  style={{
                    color: colors.navy, fontWeight: 700, fontSize: "0.87rem",
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
                  }}
                >
                  ← Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Main Registration Form ────────────────────────────────────────────────

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Source Sans 3', sans-serif; }
        input:-webkit-autofill {
          -webkit-text-fill-color: #111 !important;
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .step-animate { animation: stepIn 0.28s ease both; }
        .role-card {
          background: white; border: 2px solid rgba(26,29,94,0.14);
          border-radius: 16px; padding: 32px 20px; cursor: pointer;
          text-align: center; transition: all 0.22s ease;
          display: flex; flex-direction: column; align-items: center; gap: 12px; flex: 1;
        }
        .role-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,29,94,0.12); }
        .role-card.applicant:hover { border-color: #1a1d5e; background: #f0f1ff; }
        .role-card.employer:hover  { border-color: #c0151a; background: #fff1f2; }
        .reg-btn {
          padding: 12px 28px; border-radius: 8px; font-weight: 700;
          font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s;
          font-family: 'Source Sans 3', sans-serif; letter-spacing: 0.3px;
        }
        .reg-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .reg-btn-navy { background: #1a1d5e; color: white; }
        .reg-btn-navy:hover:not(:disabled) {
          background: #0f1240; transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(26,29,94,0.28);
        }
        .reg-btn-outline {
          background: white; color: #5a5a7a;
          border: 1.5px solid rgba(26,29,94,0.2);
        }
        .reg-btn-outline:hover { border-color: #1a1d5e; color: #1a1d5e; }
        .dot-step {
          width: 10px; height: 10px; border-radius: 50%;
          background: rgba(26,29,94,0.18); transition: all 0.3s ease; flex-shrink: 0;
        }
        .dot-step.done   { background: #e8a800; width: 22px; border-radius: 5px; }
        .dot-step.active { background: #1a1d5e; width: 22px; border-radius: 5px; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${colors.navyDark} 0%, ${colors.navy} 55%, #2a1a5e 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: -120, right: -120, width: 400, height: 400,
          borderRadius: "50%", background: "rgba(232,168,0,0.07)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80, width: 300, height: 300,
          borderRadius: "50%", background: "rgba(192,21,26,0.06)", pointerEvents: "none",
        }} />

        <div style={{
          background: colors.lightBg, borderRadius: 20, width: "100%", maxWidth: 620,
          position: "relative", zIndex: 1, animation: "fadeUp 0.45s ease both",
          overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
        }}>
          {/* Header */}
          <div style={{
            background: colors.navy, padding: "28px 32px",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg, ${colors.red}, ${colors.gold})`,
            }} />
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12,
            }}>
              <div>
                <p style={{
                  color: colors.gold, fontSize: "0.7rem", fontWeight: 700,
                  letterSpacing: 3, textTransform: "uppercase", marginBottom: 4,
                }}>
                  P.E.S.O. — Roxas City
                </p>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif", color: "white",
                  fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.2,
                }}>
                  Create Account
                </h1>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", marginTop: 4 }}>
                  {currentStep === 0
                    ? "Select your role to get started"
                    : `Step ${currentStep} of ${totalSteps} — ${stepLabels[currentStep]}`}
                </p>
              </div>
              <Link
                to="/login"
                style={{
                  color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", fontWeight: 600,
                  textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.25)",
                  padding: "7px 16px", borderRadius: 7, transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              >
                ← Back to Login
              </Link>
            </div>

            {currentStep > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${progress}%`,
                    background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldLight})`,
                    borderRadius: 4, transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "center" }}>
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`dot-step ${i + 1 < currentStep ? "done" : i + 1 === currentStep ? "active" : ""}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: "32px" }}>
            {message && (
              <div style={{
                background: message.type === "success" ? "#dcfce7" : "#fff1f2",
                color: message.type === "success" ? "#16a34a" : colors.red,
                border: `1.5px solid currentColor`, borderRadius: 8,
                padding: "12px 16px", marginBottom: 20, fontSize: "0.87rem",
                fontWeight: 600, animation: "fadeIn 0.25s ease",
              }}>
                {message.type === "success" ? "✅ " : "⚠️ "}
                {message.text}
              </div>
            )}

            {/* Step 0: Role Picker */}
            {currentStep === 0 && (
              <div className="step-animate">
                <p style={{ color: colors.muted, fontSize: "0.9rem", marginBottom: 20, lineHeight: 1.6 }}>
                  Choose the role that best describes you. This determines what features you'll have access to.
                </p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <button className="role-card applicant" onClick={() => handleRoleSelect("applicant")}>
                    <span style={{ fontSize: "2.8rem" }}>👤</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: colors.navy, marginBottom: 6 }}>Applicant</div>
                      <div style={{ fontSize: "0.83rem", color: colors.muted, lineHeight: 1.5 }}>
                        Looking for job opportunities and employment assistance
                      </div>
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: colors.navy, background: "rgba(26,29,94,0.08)", padding: "4px 12px", borderRadius: 20, letterSpacing: 0.5 }}>
                      JOB SEEKER
                    </span>
                  </button>
                  <button className="role-card employer" onClick={() => handleRoleSelect("employer")}>
                    <span style={{ fontSize: "2.8rem" }}>🏢</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: colors.red, marginBottom: 6 }}>Employer</div>
                      <div style={{ fontSize: "0.83rem", color: colors.muted, lineHeight: 1.5 }}>
                        Posting job listings and searching for qualified candidates
                      </div>
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: colors.red, background: "rgba(192,21,26,0.08)", padding: "4px 12px", borderRadius: 20, letterSpacing: 0.5 }}>
                      HIRING
                    </span>
                  </button>
                </div>
                <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.85rem", color: colors.muted }}>
                  Already have an account?{" "}
                  <Link to="/login" style={{ color: colors.navy, fontWeight: 700, textDecoration: "none" }}>
                    Log in here
                  </Link>
                </p>
              </div>
            )}

            {/* Steps 1–3: Form */}
            {currentStep > 0 && (
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && (
                  <div className="step-animate" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name?.[0]} required />
                    <Field label="Middle Name" name="middle_name" value={formData.middle_name} onChange={handleChange} placeholder="Optional" />
                    <Field label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} error={errors.last_name?.[0]} required />
                    <Field label="Username" name="username" value={formData.username} onChange={handleChange} error={errors.username?.[0]} required />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="step-animate" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email?.[0]} required />
                    <Field label="Age" name="age" type="number" value={formData.age} onChange={handleChange} error={errors.age?.[0]} required />
                    <Field label="Contact Number" name="contact_number" value={formData.contact_number} onChange={handleChange} error={errors.contact_number?.[0]} placeholder="e.g. 09XX-XXX-XXXX" />
                    <Field label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address?.[0]} placeholder="City / Municipality" />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="step-animate" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <PasswordField label="Password" name="password" value={formData.password} onChange={handleChange} error={errors.password?.[0]} required />
                    <PasswordField label="Confirm Password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} error={errors.confirm_password?.[0]} required />
                  </div>
                )}

                {/* Role badge */}
                <div style={{
                  marginTop: 20, padding: "10px 14px",
                  background: isEmployer ? "rgba(192,21,26,0.06)" : "rgba(26,29,94,0.06)",
                  borderRadius: 8, display: "flex", alignItems: "center", gap: 8,
                  fontSize: "0.82rem", color: isEmployer ? colors.red : colors.navy, fontWeight: 600,
                }}>
                  <span>{isEmployer ? "🏢" : "👤"}</span>
                  Registering as <strong>{isEmployer ? "Employer" : "Applicant"}</strong>
                  <button
                    type="button"
                    onClick={() => { setCurrentStep(0); setSelectedRole(null); setErrors({}); }}
                    style={{
                      marginLeft: "auto", background: "none", border: "none",
                      cursor: "pointer", fontSize: "0.78rem", color: colors.muted,
                      fontWeight: 600, textDecoration: "underline", padding: 0,
                    }}
                  >
                    Change
                  </button>
                </div>

                {/* Nav buttons */}
                <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
                  <button type="button" className="reg-btn reg-btn-outline" onClick={prevStep}>
                    ← Back
                  </button>
                  {currentStep < totalSteps ? (
                    <button type="button" className="reg-btn reg-btn-navy" onClick={nextStep}>
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="submit" className="reg-btn reg-btn-navy" disabled={isLoading}
                      style={{ background: isLoading ? colors.muted : colors.navy, minWidth: 140 }}
                    >
                      {isLoading ? "Creating..." : "Create Account"}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;