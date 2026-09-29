import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/format";

function Register() {
  const navigate = useNavigate();
  const toast = useToast();

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
      toast.success(data.message || `OTP sent to ${formData.email}`);

      // Verify OTP page pe bhejo (devOtp tabhi aata hai jab email configured na ho)
      navigate("/verify-otp", {
        state: {
          email: formData.email,
          devOtp: data.devOtp,
        },
      });
    } catch (error) {
      console.log("ERROR =>", error);
      console.log("DATA =>", error.response?.data);

      toast.error(errorMessage(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  // Google se account ban chuka hota hai (email already verified),
  // isliye OTP step skip karke seedha dashboard.
  const handleGoogleSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    toast.success("Signed up with Google — welcome!");

    if (data.user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
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
          <GoogleSignInButton
            mode="signup"
            onSuccess={handleGoogleSuccess}
            onError={(message) => toast.error(message)}
          />

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
