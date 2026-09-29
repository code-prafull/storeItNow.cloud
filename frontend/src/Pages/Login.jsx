import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/authApi";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/format";

function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Token save + role ke hisaab se redirect (email login aur Google dono)
  const enterApp = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    if (data.user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(formData);

      toast.success("Login successful — welcome back!");
      enterApp(data);
    } catch (error) {
      console.log(error);
      toast.error(errorMessage(error, "Login failed — check your credentials"));
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
        {/* Logo — storeItNow.cloud */}
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

        {/* Branding Slogan & Bullet Points */}
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
                text: "Bank-level encryption for all your files",
              },
              {
                icon: "M18 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98",
                text: "Share and collaborate in real time",
              },
              {
                icon: "M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01",
                text: "Access from any device, anytime",
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

        {/* Footer */}
        <p
          className="text-xs font-medium tracking-wide"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          © 2026 storeItNow.cloud — All rights reserved.
        </p>
      </div>

      {/* ── Right Login Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div
          className="bg-white rounded-xl p-8 sm:p-10 w-full max-w-[440px] border border-[#edebe9] transition-all duration-300 hover:shadow-xl"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.04)" }}
        >
          {/* Card Heading Container */}
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
              Sign in
            </h1>
            <p className="text-sm font-medium" style={{ color: "#605e5c" }}>
              to continue to your cloud dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input Node */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "#323130" }}
              >
                Email or phone
              </label>
              <input
                type="email"
                name="email"
                placeholder="someone@storeitnow.cloud"
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

            {/* Password Input Node */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#323130" }}
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold hover:underline"
                  style={{ color: "#0078d4" }}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
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

            {/* Keep Signed In Checkbox Wrapper */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="keepSignedIn"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-4 h-4 cursor-pointer rounded transition-all"
                style={{ accentColor: "#0078d4" }}
              />
              <label
                htmlFor="keepSignedIn"
                className="text-sm font-medium cursor-pointer select-none"
                style={{ color: "#323130" }}
              >
                Keep me signed in
              </label>
            </div>

            {/* Core Action Submit Trigger */}
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
                  <span>Verifying credentials...</span>
                </>
              : "Sign in"}
            </button>
          </form>

          {/* Separation Boundary */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: "#edebe9" }} />
            <span
              className="text-[10px] font-bold tracking-widest text-[#a19f9d]"
              style={{ fontFamily: "monospace" }}
            >
              OR
            </span>
            <div className="flex-1 h-px" style={{ background: "#edebe9" }} />
          </div>

          {/* Google Federated Identity Provider */}
          <GoogleSignInButton
            mode="signin"
            onSuccess={(data) => {
              toast.success("Signed in with Google");
              enterApp(data);
            }}
            onError={(message) => toast.error(message)}
          />

          {/* External Navigation Link */}
          <p className="text-center text-sm mt-8" style={{ color: "#605e5c" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold hover:underline"
              style={{ color: "#0078d4" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Embedded Modern Smooth Layout Injection */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

export default Login;
