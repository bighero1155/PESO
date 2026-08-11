import { useState, useRef, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type EmailVerificationStatus =
  | "idle"
  | "sending"
  | "sent"
  | "verifying"
  | "verified"
  | "error";

export interface UseEmailVerificationResult {
  status: EmailVerificationStatus;
  error: string | null;
  token: string | null;
  cooldown: number;
  sendCode: (email: string, formLabel: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<string | null>;
  reset: () => void;
}

// ── Hook ─────────────────────────────────────────────────────────────────────
// otpUrl: the Apps Script Web App URL that handles the sendOtp / verifyOtp
// actions for THIS form. Each form now runs its own self-contained OTP logic
// in its own .gs file (no shared OTP-Service.gs), so the endpoint is passed
// in rather than hardcoded — e.g. JOBFAIR_SCHEDULES_SUBMIT_URL for this form,
// LRA_SCHEDULES_SUBMIT_URL for LRA, etc. Each form's token is only valid
// against that form's own signing secret.

export function useEmailVerification(otpUrl: string): UseEmailVerificationResult {
  const [status, setStatus]     = useState<EmailVerificationStatus>("idle");
  const [error, setError]       = useState<string | null>(null);
  const [token, setToken]       = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimer           = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendCode = useCallback(async (email: string, formLabel: string) => {
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch(otpUrl, {
        method:  "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body:    JSON.stringify({ action: "sendOtp", email, formLabel }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("sent");
        startCooldown(45);
      } else {
        setStatus("error");
        setError(data.error || "Could not send verification code. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Network error — please check your connection and try again.");
    }
  }, [otpUrl, startCooldown]);

  const verifyCode = useCallback(async (email: string, code: string): Promise<string | null> => {
    setStatus("verifying");
    setError(null);
    try {
      const res = await fetch(otpUrl, {
        method:  "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body:    JSON.stringify({ action: "verifyOtp", email, code }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        setStatus("verified");
        setToken(data.token as string);
        return data.token as string;
      }

      setStatus("sent");
      setError(data.error || "Incorrect code. Please try again.");
      return null;
    } catch {
      setStatus("sent");
      setError("Network error — please check your connection and try again.");
      return null;
    }
  }, [otpUrl]);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setToken(null);
    setCooldown(0);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
  }, []);

  return { status, error, token, cooldown, sendCode, verifyCode, reset };
}