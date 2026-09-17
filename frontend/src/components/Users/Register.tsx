import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AxiosInstance from "../../auth/axiosInstance";
import { mergeErrors, FieldErrors } from "../../Errors/UserFieldErrors";
import { useEmailVerification } from "../../../email/Emailverification";

// ← Point this at your relay's deployed /exec URL (same one used for
// RELAY_URL in Laravel's .env / Render env — sendOtp/verifyOtp are public
// actions on that same script, no secret needed for them).
const REGISTER_OTP_URL = "https://script.google.com/macros/s/AKfycbwy72F0BaqfAJIhshKY5EsvBnrwq9Rib-IJDnVVKVOeDMncQeTAYeml8PQn-Bl6ySNy/exec";

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

// ── EmailOtpStep (new) ─────────────────────────────────────────────────────────
// Reuses the same useEmailVerification hook Jobs.tsx uses, styled to match
// this wizard's own Field/button aesthetic instead of the standalone
// EmailVerificationGate card.

function EmailOtpStep({
  email,
  onVerified,
}: {
  email: string;
  onVerified: (token: string) => void;
}) {
  const { status, error, token, cooldown, sendCode, verifyCode } = useEmailVerification(REGISTER_OTP_URL);
  const [code, setCode] = useState("");
  const sentOnceRef = React.useRef(false);

  useEffect(() => {
    if (!sentOnceRef.current && email) {
      sentOnceRef.current = true;
      sendCode(email, "PESO Capiz Registration");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    if (status === "verified" && token) {
      onVerified(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, token]);

  const handleVerify = () => {
    if (code.length === 6 && status !== "verifying") verifyCode(email, code.trim());
  };

  if (status === "verified") {
    return (
      <div style={{
        background: "#dcfce7", color: "#16a34a", border: "1.5px solid currentColor",
        borderRadius: 8, padding: "14px 16px", fontSize: "0.9rem", fontWeight: 600,
      }}>
        ✅ Email verified — {email}
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: colors.muted, fontSize: "0.9rem", marginBottom: 16, lineHeight: 1.6 }}>
        {status === "sending"
          ? `Sending a code to ${email}…`
          : `We sent a 6-digit code to ${email}. Enter it below.`}
      </p>

      <label style={labelStyle}>Verification Code</label>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
        placeholder="6-digit code"
        style={{
          ...inputStyle,
          marginBottom: 12,
          letterSpacing: 6,
          fontSize: "1.15rem",
          textAlign: "center",
          fontWeight: 700,
        }}
      />

      <button
        type="button"
        className="reg-btn reg-btn-navy"
        onClick={handleVerify}
        disabled={code.length !== 6 || status === "verifying"}
        style={{ width: "100%", marginBottom: 10 }}
      >
        {status === "verifying" ? "Verifying…" : "Verify Code"}
      </button>

      <button
        type="button"
        onClick={() => sendCode(email, "PESO Capiz Registration")}
        disabled={cooldown > 0 || status === "sending" || status === "verifying"}
        style={{
          width: "100%", background: "transparent", border: "none",
          color: cooldown > 0 ? colors.muted : colors.red,
          fontSize: "0.85rem", fontWeight: 700,
          cursor: cooldown > 0 ? "default" : "pointer",
          fontFamily: "'Source Sans 3', sans-serif", padding: "4px 0",
        }}
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>

      {error && (
        <p style={{ color: colors.red, fontSize: "0.82rem", marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

// ── Main Register ─────────────────────────────────────────────────────────────

const Register: React.FC = () => {

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

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

  // Step 3 is the new email-OTP step — no direct input fields to validate,
  // it's gated on verificationToken instead (see nextStep).
  const stepFields: Record<number, FormField[]> = {
    1: ["first_name", "middle_name", "last_name", "username"],
    2: ["email", "age", "contact_number", "address"],
    4: ["password", "confirm_password"],
  };

  const totalSteps = 4;

  const validateStep = (): boolean => {
    const fields = stepFields[currentStep] || [];
    const newErrors: FieldErrors = {};
    const optional: FormField[] = ["middle_name", "contact_number", "address"];

    fields.forEach((field) => {
      if (optional.includes(field)) return;
      if (!formData[field].trim()) {
        newErrors[field] = ["This field is required"];
      }
    });

    if (currentStep === 4) {
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = ["Passwords do not match"];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 3) {
      // Email OTP step — only allowed through once verified
      if (verificationToken) setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      return;
    }
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

    if (!verificationToken) {
      setMessage({ type: "error", text: "Please verify your email before creating your account." });
      setCurrentStep(3);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirm_password: _, ...payload } = formData;
      await AxiosInstance.post("/register", {
        ...payload,
        verificationToken,
      });

      setRegisteredEmail(formData.email);
      setRegistered(true);
    } catch (error: any) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors;
        setErrors(mergeErrors({}, serverErrors));
        const fields = Object.keys(serverErrors || {});
        if (fields.includes("username"))
          setMessage({ type: "error", text: "Username is already taken." });
        else if (fields.includes("email"))
          setMessage({ type: "error", text: "Email is already registered, or verification expired — please verify again." });
        else if (fields.includes("contact_number"))
          setMessage({ type: "error", text: "Contact number is already in use." });
        else
          setMessage({ type: "error", text: "Please fix the errors below." });

        // If it was the OTP that failed server-side, send them back to re-verify
        if (fields.includes("email") && !serverErrors.email?.[0]?.includes("already registered")) {
          setVerificationToken(null);
          setCurrentStep(3);
        }
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
    3: "Verify Email",
    4: "Set Password",
  };

  // ── Check Your Email Screen (post-registration success) ───────────────────

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
            <div style={{ background: colors.navy, padding: "36px 32px", textAlign: "center", position: "relative" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 4,
                background: `linear-gradient(90deg, ${colors.red}, ${colors.gold})`,
              }} />
              <div style={{ fontSize: "3.5rem", animation: "pulse 2s ease infinite" }}>✅</div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif", color: "white",
                fontSize: "1.6rem", fontWeight: 700, marginTop: 14, lineHeight: 1.2,
              }}>
                Account Created
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: 6 }}>
                Verified as
              </p>
              <p style={{
                color: colors.goldLight, fontWeight: 700, fontSize: "0.95rem",
                marginTop: 6, wordBreak: "break-all",
              }}>
                {registeredEmail}
              </p>
            </div>

            <div style={{ padding: "28px 32px 32px", textAlign: "center" }}>
              <p style={{ color: colors.muted, fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 8 }}>
                Your email is already verified — you can log in right away.
              </p>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${colors.border}` }}>
                <Link
                  to="/login"
                  className="reg-btn reg-btn-navy"
                  style={{ textDecoration: "none", display: "inline-block" }}
                >
                  Go to Login →
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

            {currentStep > 0 && currentStep !== 3 && (
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

                {currentStep === 4 && (
                  <div className="step-animate" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <PasswordField label="Password" name="password" value={formData.password} onChange={handleChange} error={errors.password?.[0]} required />
                    <PasswordField label="Confirm Password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} error={errors.confirm_password?.[0]} required />
                  </div>
                )}

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

            {/* Step 3: Email OTP — separate from the <form>, since it has its
                own async send/verify flow rather than a submit button */}
            {currentStep === 3 && (
              <div className="step-animate">
                <EmailOtpStep
                  email={formData.email}
                  onVerified={(token) => setVerificationToken(token)}
                />

                <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
                  <button type="button" className="reg-btn reg-btn-outline" onClick={prevStep}>
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="reg-btn reg-btn-navy"
                    onClick={nextStep}
                    disabled={!verificationToken}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;