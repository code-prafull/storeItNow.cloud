import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await registerUser(formData);

      console.log(data);

      // OTP mail chali gayi
      alert("OTP Sent Successfully");

      // Verify OTP page pe bhejo
      navigate("/verify-otp", {
        state: {
          email: formData.email,
        },
      });
    } catch (error) {
      console.log("ERROR =>", error);
      console.log("DATA =>", error.response?.data);

      alert(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f3f2f1" }}>
      {/* ── Left Branding Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[420px] flex-shrink-0 animate-fadeIn"
        style={{ background: "#0078d4" }}
      >
        {/* Brand Core Identity System */}
        <div className="flex items-center gap-2.5 select-none">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="white"
            className="drop-shadow-sm"
          >
            <path d="M10.5 18.5H6.5C4 18.5 2 16.5 2 14c0-2.1 1.4-3.9 3.4-4.4C5.8 7.6 7.5 6.5 9.5 6.5c.3 0 .6 0 .9.1C11.2 4.9 12.9 4 15 4c3.3 0 6 2.7 6 6 0 .2 0 .4 0 .6 1.7.5 3 2.1 3 4 0 2.2-1.8 4-4 4h-9.5z" />
          </svg>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">
              storeIt
            </span>
            <span
              style={{ color: "rgba(255,255,255,0.75)" }}
              className="text-lg font-normal"
            >
              Now
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "0.75rem",
                marginLeft: 2,
              }}
              className="font-mono"
            >
              .cloud
            </span>
          </div>
        </div>

        {/* Mid Panel Feature Directory */}
        <div className="my-auto space-y-6">
          <h2 className="text-white text-3xl font-bold leading-tight tracking-tight">
            Store and share files anywhere, anytime.
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Access your documents, photos, and files from any device, securely
            and instantly.
          </p>

          <div className="mt-10 flex flex-col gap-5">
            {[
              {
                icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
                text: "5 GB free encrypted cloud storage allocation",
              },
              {
                icon: "M5 12h14M12 5l7 7-7 7",
                text: "Real-time deployment sync across all modules",
              },
              {
                icon: "M18 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98",
                text: "Enterprise distribution pipelines & sync locks",
              },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={icon} />
                  </svg>
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Footer Statement */}
        <p
          className="text-xs font-medium tracking-wide"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          © 2026 storeItNow.cloud — All rights reserved.
        </p>
      </div>

      {/* ── Right Registration Form Box ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div
          className="bg-white rounded-xl p-8 sm:p-10 w-full max-w-[440px] border border-[#edebe9] transition-all duration-300 hover:shadow-xl"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.04)" }}
        >
          {/* Heading Meta Descriptor */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 select-none">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="#0078d4"
                className="drop-shadow-sm"
              >
                <path d="M10.5 18.5H6.5C4 18.5 2 16.5 2 14c0-2.1 1.4-3.9 3.4-4.4C5.8 7.6 7.5 6.5 9.5 6.5c.3 0 .6 0 .9.1C11.2 4.9 12.9 4 15 4c3.3 0 6 2.7 6 6 0 .2 0 .4 0 .6 1.7.5 3 2.1 3 4 0 2.2-1.8 4-4 4h-9.5z" />
              </svg>
              <span className="text-xs font-bold tracking-wider uppercase text-[#0078d4]">
                storeItNow.cloud
              </span>
            </div>
            <h1
              className="text-2xl font-bold tracking-tight mb-1.5"
              style={{ color: "#201f1e" }}
            >
              Create account
            </h1>
            <p className="text-sm font-medium" style={{ color: "#605e5c" }}>
              Get started with your free cloud storage space.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "#323130" }}
              >
                Full name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-md px-3.5 py-2.5 text-sm outline-none transition-all duration-200 font-medium placeholder-[#a19f9d]"
                style={{
                  border: "1px solid #8a8886",
                  color: "#201f1e",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0078d4";
                  e.target.style.boxShadow = "0 0 0 1px #0078d4";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#8a8886";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "#323130" }}
              >
                Email address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@storeitnow.cloud"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-md px-3.5 py-2.5 text-sm outline-none transition-all duration-200 font-medium placeholder-[#a19f9d]"
                style={{
                  border: "1px solid #8a8886",
                  color: "#201f1e",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0078d4";
                  e.target.style.boxShadow = "0 0 0 1px #0078d4";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#8a8886";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password Node with Absolute Eye Switcher */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "#323130" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md pl-3.5 pr-12 py-2.5 text-sm outline-none transition-all duration-200 font-medium placeholder-[#a19f9d]"
                  style={{
                    border: "1px solid #8a8886",
                    color: "#201f1e",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0078d4";
                    e.target.style.boxShadow = "0 0 0 1px #0078d4";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#8a8886";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base select-none p-1 text-[#8a8886] hover:text-[#323130] transition-colors"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Compliance Matrix T&C Links */}
            <p
              className="text-[11px] font-medium leading-relaxed"
              style={{ color: "#605e5c" }}
            >
              By creating an account, you accept the{" "}
              <a
                href="#"
                className="font-semibold hover:underline"
                style={{ color: "#0078d4" }}
              >
                Terms of Service
              </a>{" "}
              and the{" "}
              <a
                href="#"
                className="font-semibold hover:underline"
                style={{ color: "#0078d4" }}
              >
                Privacy Policy
              </a>
              .
            </p>

            {/* Form Validation Submission Pipeline */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold text-white rounded-md transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              style={{
                background: "#0078d4",
                border: "none",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.target.style.background = "#106ebe")}
              onMouseOut={(e) => (e.target.style.background = "#0078d4")}
            >
              {loading ?
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Provisioning cloud pool...</span>
                </>
              : "Create account"}
            </button>
          </form>

          {/* Graphical Divider Element */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px" style={{ background: "#edebe9" }} />
            <span
              className="text-[10px] font-bold tracking-widest text-[#a19f9d]"
              style={{ fontFamily: "monospace" }}
            >
              OR
            </span>
            <div className="flex-1 h-px" style={{ background: "#edebe9" }} />
          </div>

          {/* ✅ Google Single Sign On Node (Microsoft Removed) */}
          <button
            type="button"
            className="w-full py-2.5 text-sm font-semibold rounded-md flex items-center justify-center gap-3 transition-all duration-150 border active:bg-[#f3f2f1]"
            style={{
              background: "white",
              borderColor: "#bab8b6",
              color: "#201f1e",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f3f2f1")}
            onMouseOut={(e) => (e.currentTarget.style.background = "white")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-slate-700">Sign up with Google</span>
          </button>

          {/* ✅ Dedicated "Back to Login" Button */}
          <div
            className="mt-6 border-t pt-4"
            style={{ borderColor: "#edebe9" }}
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-2 text-xs font-semibold rounded-md transition-all border text-slate-600 hover:text-[#0078d4]"
              style={{
                background: "#faf9f8",
                borderColor: "#bab8b6",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#f3f2f1";
                e.target.style.borderColor = "#0078d4";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#faf9f8";
                e.target.style.borderColor = "#bab8b6";
              }}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe Injector */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

export default Register;
