import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AxiosInstance from "../auth/axiosInstance";
import { useEmailVerification } from "../../email/Emailverification";

// Same relay used by Register — sendOtp/verifyOtp are public actions, no secret needed.
const LOGIN_OTP_URL = "https://script.google.com/macros/s/AKfycbwy72F0BaqfAJIhshKY5EsvBnrwq9Rib-IJDnVVKVOeDMncQeTAYeml8PQn-Bl6ySNy/exec";

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

// ── Inline unverified-account OTP box ──────────────────────────────────────

function UnverifiedOtpBox({
  email,
  onVerifiedAndLoggedIn,
}: {
  email: string;
  password: string;
  onVerifiedAndLoggedIn: () => Promise<void>;
}) {
  const { status, error, token, cooldown, sendCode, verifyCode } = useEmailVerification(LOGIN_OTP_URL);
  const [code, setCode] = useState("");
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState("");
  const sentOnceRef = useState({ sent: false })[0];

  useEffect(() => {
    if (!sentOnceRef.sent && email) {
      sentOnceRef.sent = true;
      sendCode(email, "PESO Capiz Login Verification");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    const complete = async () => {
      if (status === "verified" && token) {
        setCompleting(true);
        setCompleteError("");
        try {
          await AxiosInstance.post("/email/verify-otp", {
            email,
            verificationToken: token,
          });
          await onVerifiedAndLoggedIn();
        } catch (err: any) {
          setCompleteError(
            err.response?.data?.message || "Could not complete verification. Please try again."
          );
        } finally {
          setCompleting(false);
        }
      }
    };
    complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, token]);

  const handleVerify = () => {
    if (code.length === 6 && status !== "verifying") verifyCode(email, code.trim());
  };

  return (
    <div style={{
      background: "#fffbeb", border: `1.5px solid ${colors.gold}`,
      borderRadius: 8, padding: "14px 16px", marginBottom: 20,
      marginTop: 8, fontSize: "0.83rem", color: "#92400e",
    }}>
      <p style={{ marginBottom: 10, fontWeight: 600 }}>
        {status === "sending"
          ? `Sending a verification code to ${email}…`
          : `We sent a 6-digit code to ${email}. Enter it below to verify and sign in.`}
      </p>

      {status !== "verified" && (
        <>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
            placeholder="6-digit code"
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 6,
              border: `1.5px solid ${colors.border}`, fontSize: "1.05rem",
              letterSpacing: 6, textAlign: "center", fontWeight: 700,
              marginBottom: 10, fontFamily: "'Source Sans 3', sans-serif",
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={handleVerify}
              disabled={code.length !== 6 || status === "verifying" || completing}
              style={{
                background: colors.gold, color: colors.navy,
                border: "none", borderRadius: 6, padding: "8px 16px",
                fontWeight: 700, fontSize: "0.82rem",
                cursor: code.length !== 6 ? "not-allowed" : "pointer",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              {status === "verifying" || completing ? "Verifying…" : "Verify & Sign In"}
            </button>

            <button
              onClick={() => sendCode(email, "PESO Capiz Login Verification")}
              disabled={cooldown > 0 || status === "sending"}
              style={{
                background: "none", border: "none",
                color: cooldown > 0 ? colors.muted : colors.red,
                fontWeight: 700, fontSize: "0.8rem",
                cursor: cooldown > 0 ? "default" : "pointer",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </>
      )}

      {status === "verified" && (
        <p style={{ color: "#16a34a", fontWeight: 700 }}>
          ✅ Verified! Signing you in…
        </p>
      )}

      {(error || completeError) && (
        <p style={{ color: colors.red, fontSize: "0.8rem", marginTop: 8, marginBottom: 0 }}>
          ⚠️ {error || completeError}
        </p>
      )}
    </div>
  );
}

// ── Login ────────────────────────────────────────────────────────────────────

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // For unverified user — show inline OTP verification
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const { login, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const redirectToDashboard = useCallback(
    (role: "applicant" | "employer" | "admin") => {
      switch (role) {
        case "admin":
        case "employer":
          navigate("/dashboard", { replace: true });
          break;
        case "applicant":
          navigate("/landing", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (isLoggedIn && user) redirectToDashboard(user.role);
  }, [isLoggedIn, user, redirectToDashboard]);

  const attemptLogin = async () => {
    try {
      await login(identifier, password);
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.unverified) {
        setUnverifiedEmail(err.response.data.email || null);
        setError("Please verify your email before logging in.");
      } else {
        setError("Invalid username/email or password.");
      }
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail(null);
    setIsLoading(true);
    try {
      await attemptLogin();
    } catch {
      // handled in attemptLogin
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifiedAndLoggedIn = async () => {
    // Account is now verified server-side — retry the original login.
    setError("");
    try {
      await login(identifier, password);
    } catch {
      setError("Verified, but sign-in failed — please try signing in again.");
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "12px 14px",
    border: `1.5px solid ${
      error && field === "identifier" ? colors.red
        : focusedField === field ? colors.navy
        : colors.border
    }`,
    borderRadius: 8,
    fontSize: "0.93rem",
    color: "#111",
    background: "white",
    outline: "none",
    fontFamily: "'Source Sans 3', sans-serif",
    boxShadow: focusedField === field ? `0 0 0 3px rgba(26,29,94,0.1)` : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  });

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
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .login-card { animation: fadeUp 0.4s ease both; }
        .login-btn {
          width: 100%; padding: 13px; border-radius: 8px; border: none;
          background: ${colors.navy}; color: white; font-size: 0.95rem;
          font-weight: 700; font-family: 'Source Sans 3', sans-serif;
          cursor: pointer; transition: all 0.22s ease;
          display: flex; align-items: center; justify-content: center;
          gap: 8px; letter-spacing: 0.3px;
        }
        .login-btn:hover:not(:disabled) {
          background: ${colors.navyDark}; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(26,29,94,0.3);
        }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .login-btn.loading {
          background: linear-gradient(90deg, ${colors.navy} 25%, #2a3080 50%, ${colors.navy} 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite linear;
        }
        .divider-line { flex: 1; height: 1px; background: ${colors.border}; }
        .register-link-card {
          display: flex; align-items: center; justify-content: space-between;
          background: white; border: 1.5px solid ${colors.border};
          border-radius: 10px; padding: 14px 18px; gap: 12px;
          flex-wrap: wrap; margin-top: 20px;
        }
        .role-hint {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 8px;
          font-size: 0.82rem; font-weight: 600; cursor: default;
        }
        .role-hint.applicant { background: rgba(26,29,94,0.06); color: ${colors.navy}; }
        .role-hint.employer  { background: rgba(192,21,26,0.06); color: ${colors.red}; }
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
          position: "absolute", top: -140, right: -140, width: 420, height: 420,
          borderRadius: "50%", background: "rgba(232,168,0,0.07)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80, width: 300, height: 300,
          borderRadius: "50%", background: "rgba(192,21,26,0.06)", pointerEvents: "none",
        }} />

        <div className="login-card" style={{
          background: colors.lightBg, borderRadius: 20, width: "100%", maxWidth: 460,
          position: "relative", zIndex: 1, overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
        }}>
          <div style={{ background: colors.navy, padding: "32px 32px 28px", position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg, ${colors.red}, ${colors.gold})`,
            }} />
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: colors.gold, fontSize: "0.68rem", fontWeight: 700, letterSpacing: 3.5, textTransform: "uppercase", marginBottom: 6 }}>
                P.E.S.O. — Roxas City
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "2rem", fontWeight: 700, lineHeight: 1.15 }}>
                Welcome Back
              </h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", marginTop: 6 }}>
                Sign in to your account to continue
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div className="role-hint applicant"><span>👤</span> Applicant</div>
              <div className="role-hint employer"><span>🏢</span> Employer</div>
              <div style={{
                display: "flex", alignItems: "center", padding: "10px 14px",
                borderRadius: 8, fontSize: "0.82rem", fontWeight: 600,
                background: "rgba(232,168,0,0.12)", color: colors.goldLight, gap: 6,
              }}>
                <span>🛡️</span> Admin
              </div>
            </div>
          </div>

          <div style={{ padding: "28px 32px 32px" }}>

            {error && (
              <div style={{
                background: "#fff1f2", color: colors.red,
                border: `1.5px solid ${colors.red}`, borderRadius: 8,
                padding: "11px 14px", marginBottom: unverifiedEmail ? 0 : 20,
                fontSize: "0.87rem", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8,
                animation: "fadeIn 0.2s ease",
              }}>
                ⚠️ {error}
              </div>
            )}

            {unverifiedEmail && (
              <UnverifiedOtpBox
                email={unverifiedEmail}
                password={password}
                onVerifiedAndLoggedIn={handleVerifiedAndLoggedIn}
              />
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="identifier" style={{
                  display: "block", fontSize: "0.72rem", fontWeight: 700,
                  color: colors.navy, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8,
                }}>
                  Username or Email
                </label>
                <input
                  id="identifier" type="text" value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); if (error) { setError(""); setUnverifiedEmail(null); } }}
                  onFocus={() => setFocusedField("identifier")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter username or email"
                  required style={inputStyle("identifier")}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label htmlFor="password" style={{
                  display: "block", fontSize: "0.72rem", fontWeight: 700,
                  color: colors.navy, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8,
                }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password" type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) { setError(""); setUnverifiedEmail(null); } }}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter password" required
                    style={{ ...inputStyle("password"), paddingRight: 44 }}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)", background: "none", border: "none",
                      cursor: "pointer", fontSize: "1rem", color: colors.muted, padding: 0, lineHeight: 1,
                    }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className={`login-btn${isLoading ? " loading" : ""}`}>
                {isLoading ? "Signing in..." : <><span>🔐</span> Sign In</>}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 0" }}>
              <div className="divider-line" />
              <span style={{ fontSize: "0.78rem", color: colors.muted, whiteSpace: "nowrap", fontWeight: 600 }}>
                New to PESO?
              </span>
              <div className="divider-line" />
            </div>

            <div className="register-link-card">
              <div>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: colors.navy, marginBottom: 2 }}>
                  Create a free account
                </p>
                <p style={{ fontSize: "0.8rem", color: colors.muted }}>
                  Applicants and employers can register
                </p>
              </div>
              <Link
                to="/register"
                style={{
                  background: colors.gold, color: colors.navy, padding: "9px 20px",
                  borderRadius: 7, fontWeight: 800, fontSize: "0.85rem",
                  textDecoration: "none", whiteSpace: "nowrap",
                  transition: "all 0.2s", display: "inline-block",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.goldLight; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(232,168,0,0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = colors.gold; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                Register →
              </Link>
            </div>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Link
                to="/"
                style={{ color: colors.muted, fontSize: "0.82rem", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = colors.navy)}
                onMouseLeave={(e) => (e.currentTarget.style.color = colors.muted)}
              >
                ← Back to PESO Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;