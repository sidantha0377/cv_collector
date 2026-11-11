'use client';

import { useState } from "react";
import { sendOtp, verifyOtp } from "@/lib/actions/auth";

type Role = "candidate" | "admin";
type Step = "role" | "email" | "otp";

export default function Home() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (selected: Role) => {
    setRole(selected);
    setStep("email");
    setError("");
  };

  const handleSendOtp = async (): Promise<void> => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (!role) return;

    setLoading(true);
    setError("");

    try {
      await sendOtp(email, role);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (): Promise<void> => {
    if (!otp) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyOtp(email, otp, role);
      // redirect handled inside verifyOtp
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired OTP");
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === "otp") {
      setStep("email");
      setOTP("");
    } else if (step === "email") {
      setStep("role");
      setRole(null);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" >
      {/*style={{ background: "linear-gradient(135deg, #f0f4f0 0%, #e8f0e8 50%, #dce8dc 100%)" }}*/}
      {/* Background decorative blobs */}
      <div style={{
        position: "fixed", top: "-80px", left: "-80px", width: "320px", height: "320px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(5,46,2,0.07) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", bottom: "-60px", right: "-60px", width: "260px", height: "260px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(5,46,2,0.06) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 40px rgba(5,46,2,0.12), 0 2px 8px rgba(5,46,2,0.06)",
        borderRadius: "24px",
        padding: "48px 40px",
        maxWidth: "460px",
        width: "100%",
        border: "1px solid rgba(5,46,2,0.08)"
      }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "56px", height: "56px", borderRadius: "16px",
            background: "linear-gradient(135deg, #052e02 0%, #0a5c04 100%)",
            marginBottom: "16px", boxShadow: "0 4px 16px rgba(5,46,2,0.25)"
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6M9 16h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 8h6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#0f1f0e", margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>
            CV Collector
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7c6a", margin: 0 }}>
            {step === "role" && "Select your account type to continue"}
            {step === "email" && `Signing in as ${role === "admin" ? "Administrator" : "Candidate"}`}
            {step === "otp" && "Check your inbox for the code"}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px", justifyContent: "center" }}>
          {(["role", "email", "otp"] as Step[]).map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "600",
                background: step === s ? "#052e02" : (["role", "email", "otp"].indexOf(step) > i ? "#052e02" : "transparent"),
                color: step === s || (["role", "email", "otp"].indexOf(step) > i) ? "white" : "#9aaa99",
                border: `2px solid ${step === s || (["role", "email", "otp"].indexOf(step) > i) ? "#052e02" : "#d0dbd0"}`,
                transition: "all 0.3s ease"
              }}>
                {["role", "email", "otp"].indexOf(step) > i ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i + 1}
              </div>
              {i < 2 && (
                <div style={{
                  width: "32px", height: "2px",
                  background: ["role", "email", "otp"].indexOf(step) > i ? "#052e02" : "#d0dbd0",
                  borderRadius: "2px", transition: "background 0.3s ease"
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px",
            padding: "10px 14px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5"/>
              <path d="M8 5v3M8 11v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p style={{ color: "#dc2626", fontSize: "13px", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* STEP 1: Role Selection */}
        {step === "role" && (
          <div>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#4a5e49", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              I am a...
            </p>
            <div style={{ display: "grid", gap: "12px" }}>
              <button
                onClick={() => handleRoleSelect("candidate")}
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "18px 20px", borderRadius: "14px", border: "2px solid #d0dbd0",
                  background: "white", cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s ease", width: "100%"
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#052e02";
                  (e.currentTarget as HTMLButtonElement).style.background = "#f6fbf6";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(5,46,2,0.12)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#d0dbd0";
                  (e.currentTarget as HTMLButtonElement).style.background = "white";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: "46px", height: "46px", borderRadius: "12px", flexShrink: 0,
                  background: "linear-gradient(135deg, #e8f5e8 0%, #d0ebd0 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="#052e02" strokeWidth="1.8"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#052e02" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f1f0e", marginBottom: "2px" }}>Job Seeker</div>
                  <div style={{ fontSize: "13px", color: "#6b7c6a" }}>Upload CVs and apply for jobs</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: "#9aaa99" }}>
                  <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button
                onClick={() => handleRoleSelect("admin")}
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "18px 20px", borderRadius: "14px", border: "2px solid #d0dbd0",
                  background: "white", cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s ease", width: "100%"
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#052e02";
                  (e.currentTarget as HTMLButtonElement).style.background = "#f6fbf6";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(5,46,2,0.12)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#d0dbd0";
                  (e.currentTarget as HTMLButtonElement).style.background = "white";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: "46px", height: "46px", borderRadius: "12px", flexShrink: 0,
                  background: "linear-gradient(135deg, #e8f5e8 0%, #d0ebd0 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#052e02" strokeWidth="1.8" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f1f0e", marginBottom: "2px" }}>Administrator</div>
                  <div style={{ fontSize: "13px", color: "#6b7c6a" }}>Manage jobs, candidates & more</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: "#9aaa99" }}>
                  <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Email Input */}
        {step === "email" && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              {/* Role badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#f0f7f0", border: "1px solid #c8dcc8", borderRadius: "20px",
                padding: "4px 12px", marginBottom: "20px"
              }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%", background: "#052e02"
                }} />
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#052e02" }}>
                  {role === "admin" ? "Administrator" : "Job Seeker"}
                </span>
              </div>

              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5e49", marginBottom: "8px" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                autoFocus
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: "12px",
                  border: "2px solid #d0dbd0", fontSize: "15px", color: "#0f1f0e",
                  background: "white", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={e => (e.target.style.borderColor = "#052e02")}
                onBlur={e => (e.target.style.borderColor = "#d0dbd0")}
              />
              <p style={{ fontSize: "12px", color: "#8a9a88", marginTop: "8px", margin: "8px 0 0 0" }}>
                We&apos;ll send a one-time verification code to this address.
              </p>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              style={{
                width: "100%", padding: "13px", borderRadius: "12px",
                background: loading ? "#7a9878" : "linear-gradient(135deg, #052e02 0%, #0a5c04 100%)",
                color: "white", fontSize: "15px", fontWeight: "600",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 16px rgba(5,46,2,0.25)",
                transition: "all 0.2s ease", letterSpacing: "0.01em"
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={{
                    width: "16px", height: "16px", borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
                    display: "inline-block", animation: "spin 0.8s linear infinite"
                  }} />
                  Sending code...
                </span>
              ) : "Send Verification Code"}
            </button>

            <button
              onClick={handleBack}
              style={{
                width: "100%", padding: "10px", marginTop: "12px", borderRadius: "10px",
                background: "transparent", color: "#6b7c6a", fontSize: "14px",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "6px"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to role selection
            </button>
          </div>
        )}

        {/* STEP 3: OTP Verification */}
        {step === "otp" && (
          <div>
            <div style={{
              background: "#f0f7f0", borderRadius: "12px", padding: "16px",
              marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px"
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                background: "#d0ebd0", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="#052e02" strokeWidth="1.8"/>
                  <path d="M22 7l-10 7L2 7" stroke="#052e02" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f1f0e" }}>Code sent to</div>
                <div style={{ fontSize: "13px", color: "#4a5e49" }}>{email}</div>
              </div>
            </div>

            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5e49", marginBottom: "8px" }}>
              6-Digit Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOTP(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              autoFocus
              style={{
                width: "100%", padding: "16px", borderRadius: "12px",
                border: "2px solid #d0dbd0", fontSize: "28px", fontWeight: "700",
                color: "#0f1f0e", background: "white", outline: "none",
                textAlign: "center", letterSpacing: "12px", boxSizing: "border-box",
                transition: "border-color 0.2s ease", fontFamily: "monospace"
              }}
              onFocus={e => (e.target.style.borderColor = "#052e02")}
              onBlur={e => (e.target.style.borderColor = "#d0dbd0")}
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              style={{
                width: "100%", padding: "13px", borderRadius: "12px", marginTop: "20px",
                background: loading ? "#7a9878" : "linear-gradient(135deg, #052e02 0%, #0a5c04 100%)",
                color: "white", fontSize: "15px", fontWeight: "600",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 16px rgba(5,46,2,0.25)",
                transition: "all 0.2s ease"
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={{
                    width: "16px", height: "16px", borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
                    display: "inline-block", animation: "spin 0.8s linear infinite"
                  }} />
                  Verifying...
                </span>
              ) : "Verify & Sign In"}
            </button>

            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                onClick={handleBack}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  background: "transparent", color: "#6b7c6a", fontSize: "13px",
                  border: "1px solid #d0dbd0", cursor: "pointer"
                }}
              >
                Change email
              </button>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  background: "transparent", color: "#052e02", fontSize: "13px",
                  border: "1px solid #c8dcc8", cursor: "pointer", fontWeight: "600"
                }}
              >
                Resend code
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        button:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
}