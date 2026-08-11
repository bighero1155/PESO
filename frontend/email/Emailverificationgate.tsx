import { useState, useEffect } from "react";
import isEmail from "validator/lib/isEmail";
import { useEmailVerification } from './Emailverification';

// ── Types ────────────────────────────────────────────────────────────────────

export interface EmailVerificationGateColors {
  red: string;
  redHover: string;
  navy: string;
  bodyText: string;
  mutedText: string;
}

export interface EmailVerificationGateProps {
  /** Shown in the confirmation email subject/body and the gate's heading, e.g. "Hil-O-Hanay Job Fair" */
  formLabel: string;
  colors: EmailVerificationGateColors;
  isMobile?: boolean;
  /** This form's own Apps Script Web App URL — handles sendOtp/verifyOtp for THIS form only (self-contained, own .gs, own signing secret). */
  otpUrl: string;
  /** Called once the code is confirmed correct. email is trimmed; token is the signed OTP token to send along with the final form submission. */
  onVerified: (email: string, token: string) => void;
}

// ── Shared styles ────────────────────────────────────────────────────────────

const baseInput: React.CSSProperties = {
  width:        "100%",
  padding:      "12px 14px",
  borderRadius: 8,
  border:       "1.5px solid rgba(26,29,94,0.15)",
  fontSize:     "0.95rem",
  fontFamily:   "'Source Sans 3', sans-serif",
  outline:      "none",
  background:   "white",
  boxSizing:    "border-box",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function EmailVerificationGate({
  formLabel, colors, isMobile, otpUrl, onVerified,
}: EmailVerificationGateProps) {
  const [email, setEmail] = useState("");
  const [code, setCode]   = useState("");
  const { status, error, token, cooldown, sendCode, verifyCode } = useEmailVerification(otpUrl);

  const emailValid = isEmail(email.trim());
  const editingEmail = status === "idle" || status === "sending" || status === "error";

  useEffect(() => {
    if (status === "verified" && token) {
      onVerified(email.trim(), token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, token]);

  const handleSend = () => {
    if (emailValid && status !== "sending") sendCode(email.trim(), formLabel);
  };

  const handleVerify = () => {
    if (code.length === 6 && status !== "verifying") verifyCode(email.trim(), code.trim());
  };

  return (
    <div
      style={{
        background:    "white",
        borderRadius:  isMobile ? 12 : 14,
        boxShadow:     "0 8px 32px rgba(26,29,94,0.08)",
        padding:       isMobile ? "24px 20px" : "40px 44px",
        maxWidth:      480,
        width:         "100%",
        margin:        "0 auto",
        boxSizing:     "border-box",
      }}
    >
      <span
        style={{
          display:       "inline-block",
          fontSize:      "0.72rem",
          fontWeight:    700,
          letterSpacing: 4,
          textTransform: "uppercase",
          color:         colors.red,
          marginBottom:  10,
        }}
      >
        Verify Your Email
      </span>

      <h2
        style={{
          fontFamily:   "'Playfair Display', serif",
          fontSize:     isMobile ? "1.3rem" : "1.5rem",
          color:        colors.navy,
          marginBottom: 10,
        }}
      >
        Let's confirm it's really you
      </h2>

      <p style={{ color: colors.bodyText, fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 24 }}>
        We'll send a 6-digit code to your email. Enter it below to continue with the rest of the form.
      </p>

      {/* Email field */}
      <label style={{ display: "block", color: colors.navy, fontSize: "0.85rem", fontWeight: 700, marginBottom: 6 }}>
        Email Address
      </label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && editingEmail) handleSend(); }}
        placeholder="juandelacruz@gmail.com"
        disabled={!editingEmail}
        style={{ ...baseInput, marginBottom: 10, opacity: editingEmail ? 1 : 0.7 }}
      />

      {/* Send / resend button */}
      {editingEmail && (
        <button
          type="button"
          onClick={handleSend}
          disabled={!emailValid || status === "sending"}
          style={{
            width:       "100%",
            background:  !emailValid ? "#ccc" : colors.red,
            color:       "white",
            border:      "none",
            padding:     "13px 0",
            borderRadius: 8,
            fontWeight:  700,
            fontSize:    "0.95rem",
            cursor:      !emailValid ? "not-allowed" : "pointer",
            fontFamily:  "'Source Sans 3', sans-serif",
            transition:  "background 0.15s",
          }}
        >
          {status === "sending" ? "Sending…" : "Send Verification Code"}
        </button>
      )}

      {/* Code entry */}
      {(status === "sent" || status === "verifying") && (
        <>
          <p style={{ color: colors.mutedText, fontSize: "0.82rem", marginTop: 4, marginBottom: 16 }}>
            Code sent to <strong style={{ color: colors.navy }}>{email.trim()}</strong>. Check your inbox (and spam folder).
          </p>

          <label style={{ display: "block", color: colors.navy, fontSize: "0.85rem", fontWeight: 700, marginBottom: 6 }}>
            Enter Code
          </label>
          <input
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={e => { if (e.key === "Enter") handleVerify(); }}
            placeholder="6-digit code"
            autoFocus
            style={{
              ...baseInput,
              marginBottom: 10,
              letterSpacing: 6,
              fontSize:      "1.15rem",
              textAlign:     "center",
              fontWeight:    700,
            }}
          />

          <button
            type="button"
            onClick={handleVerify}
            disabled={code.length !== 6 || status === "verifying"}
            style={{
              width:        "100%",
              background:   code.length !== 6 ? "#ccc" : colors.navy,
              color:        "white",
              border:       "none",
              padding:      "13px 0",
              borderRadius: 8,
              fontWeight:   700,
              fontSize:     "0.95rem",
              cursor:       code.length !== 6 ? "not-allowed" : "pointer",
              fontFamily:   "'Source Sans 3', sans-serif",
              marginBottom: 10,
              transition:   "background 0.15s",
            }}
          >
            {status === "verifying" ? "Verifying…" : "Verify Code"}
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={cooldown > 0 || status === "verifying"}
            style={{
              width:      "100%",
              background: "transparent",
              border:     "none",
              color:      cooldown > 0 ? colors.mutedText : colors.red,
              fontSize:   "0.85rem",
              fontWeight: 700,
              cursor:     cooldown > 0 ? "default" : "pointer",
              fontFamily: "'Source Sans 3', sans-serif",
              padding:    "4px 0",
            }}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </>
      )}

      {error && (
        <p style={{ color: colors.red, fontSize: "0.82rem", marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}