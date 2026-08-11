import { useLocation, Link } from "react-router-dom";

const colors = {
  navy: "#1a1d5e",
  navyDark: "#0f1240",
  red: "#c0151a",
  gold: "#e8a800",
  goldLight: "#f5c842",
  muted: "#5a5a7a",
  border: "rgba(26,29,94,0.15)",
};

const VerifyEmail = () => {
  const path = useLocation().pathname;
  const isSuccess = path.includes("success");
  const isAlready = path.includes("already-verified");
  const isError = path.includes("error");

  const config = {
    icon: isSuccess ? "✅" : isAlready ? "🔓" : "❌",
    title: isSuccess ? "Email Verified!" : isAlready ? "Already Verified" : "Verification Failed",
    message: isSuccess
      ? "Your account is now active. You can log in and start using PESO."
      : isAlready
      ? "Your email was already verified. Go ahead and sign in."
      : "The verification link is invalid or has expired. Please register again or request a new link.",
    accentColor: isSuccess || isAlready ? colors.gold : colors.red,
  };

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
        @keyframes pop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
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
          position: "absolute", top: -140, right: -140, width: 420, height: 420,
          borderRadius: "50%", background: "rgba(232,168,0,0.07)", pointerEvents: "none",
        }} />

        <div style={{
          background: "#f4f4f6", borderRadius: 20, width: "100%", maxWidth: 440,
          overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.45s ease both", position: "relative", zIndex: 1,
        }}>
          {/* Header */}
          <div style={{
            background: colors.navy, padding: "40px 32px 32px",
            textAlign: "center", position: "relative",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg, ${config.accentColor}, ${isError ? "#ff6b6b" : colors.goldLight})`,
            }} />
            <div style={{ fontSize: "4rem", animation: "pop 0.5s ease both", display: "block" }}>
              {config.icon}
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif", color: "white",
              fontSize: "1.8rem", fontWeight: 700, marginTop: 16, lineHeight: 1.2,
            }}>
              {config.title}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", marginTop: 6 }}>
              P.E.S.O. — Roxas City
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "32px", textAlign: "center" }}>
            <p style={{ color: colors.muted, fontSize: "0.92rem", lineHeight: 1.7, marginBottom: 28 }}>
              {config.message}
            </p>

            <Link
              to="/login"
              style={{
                display: "inline-block", background: colors.navy, color: "white",
                padding: "12px 32px", borderRadius: 8, fontWeight: 700,
                fontSize: "0.92rem", textDecoration: "none",
                fontFamily: "'Source Sans 3', sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.navyDark; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(26,29,94,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = colors.navy; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              Go to Login →
            </Link>

            {isError && (
              <div style={{ marginTop: 16 }}>
                <Link
                  to="/register"
                  style={{ color: colors.muted, fontSize: "0.83rem", fontWeight: 600, textDecoration: "none" }}
                >
                  ← Back to Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;