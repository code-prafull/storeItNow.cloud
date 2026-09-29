import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, RefreshCw } from "lucide-react";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // UI enhancement states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Email configured nahi hai to backend devOtp bhejta hai (dev only)
  const [devOtp, setDevOtp] = useState(location.state?.devOtp || null);

  // Naya reset code bhejne ke liye
  const handleResend = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/auth/forgot-password", { email });

      setDevOtp(response.data.devOtp || null);
      setOtp("");
      setMessage({
        type: "success",
        text: response.data.message || "A new code is on its way.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Could not resend the code. Try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim()) return;

    // Page refresh ke baad email state chala jata hai
    if (!email) {
      setMessage({
        type: "error",
        text: "We lost the email for this session — start Forgot Password again.",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword
      });

      setMessage({ type: "success", text: response.data.message || "Password updated successfully." });

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      console.log(error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Verification failed. Please check your OTP and try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#f3f2f1] font-sans antialiased text-[#323130] p-4 select-none">
      
      {/* Centered OneDrive Clean Flat Card Layout */}
      <div className="w-full max-w-[440px] bg-white p-11 rounded-sm border border-[#d2d0ce]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        
        {/* Microsoft OneDrive Style Minimal Logo Branding */}
        <div className="flex items-center gap-2 mb-6 select-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#0078d4">
            <path d="M10.5 18.5H6.5C4 18.5 2 16.5 2 14c0-2.1 1.4-3.9 3.4-4.4C5.8 7.6 7.5 6.5 9.5 6.5c.3 0 .6 0 .9.1C11.2 4.9 12.9 4 15 4c3.3 0 6 2.7 6 6 0 .2 0 .4 0 .6 1.7.5 3 2.1 3 4 0 2.2-1.8 4-4 4h-9.5z" />
          </svg>
          <span className="text-sm font-semibold tracking-wide text-[#0078d4]">storeItNow.cloud</span>
        </div>

        {/* Headings */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "#201f1e" }}>
            Set new password
          </h1>
          {email && (
            <p className="text-xs font-semibold text-[#0078d4] mt-2 bg-[#eff6fc] px-2.5 py-1 rounded-sm border border-[#deecf9] truncate w-fit max-w-full font-mono">
              {email}
            </p>
          )}
        </div>

        {/* Dynamic Alert Messages Banner */}
        {message.text && (
          <div className={`p-3 rounded-sm text-xs font-medium mb-5 flex items-start gap-2 border ${
            message.type === "success" 
              ? "bg-[#f3f9f4] border-[#dff6dd] text-[#107c41]" 
              : "bg-[#fde7e9] border-[#fde7e9] text-[#a80000]"
          }`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#107c41] flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#a80000] flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{message.text}</span>
          </div>
        )}

        {/* Dev only — email configured na ho to wahi code yahan dikh jata hai */}
        {devOtp && (
          <div className="mb-5 p-3 rounded-sm border bg-[#fff4ce] border-[#f7d154] text-[#6b5a00] text-xs">
            <span className="font-semibold block mb-1.5 leading-snug">
              Mail abhi send nahi ho raha (EMAIL_USER / EMAIL_PASS khaale hain) —
              aapka reset code:
            </span>
            <span className="font-mono font-bold text-lg tracking-[0.3em] text-[#201f1e] block">
              {devOtp}
            </span>
          </div>
        )}

        {/* Page refresh ke baad email state chala jata hai */}
        {!email && (
          <div className="mb-5 p-3 rounded-sm border bg-[#fde7e9] border-[#fde7e9] text-[#a80000] text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">
              We lost the email for this session. Go back and start Forgot Password again.
            </span>
          </div>
        )}

        {/* Form Submission Layout */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* OTP Input Field */}
          <div className="relative border-b border-[#8a8886] focus-within:border-[#0078d4] transition-all">
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="Verification Code (OTP)"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              aria-label="Verification code"
              className="w-full bg-transparent text-sm py-2 outline-none font-normal text-[#201f1e] placeholder-[#605e5c] disabled:opacity-50 tracking-widest font-mono font-bold"
            />
          </div>

          {/* New Password Input Field */}
          <div className="relative border-b border-[#8a8886] focus-within:border-[#0078d4] transition-all flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              required
              disabled={isLoading}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-transparent text-sm py-2 pr-8 outline-none font-normal text-[#201f1e] placeholder-[#605e5c] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 text-[#8a8886] hover:text-[#323130] transition-colors p-1"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between pt-2">
             
            <div className="flex items-center gap-4">
              {/* Cancel Trigger */}
              <button
                type="button"
                onClick={() => navigate("/")}
                disabled={isLoading}
                className="text-xs font-semibold text-[#605e5c] hover:text-[#201f1e] hover:underline transition-all cursor-pointer bg-transparent border-none outline-none"
              >
                Cancel
              </button>

              {/* Naya reset code bhejo */}
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading || isResending || !email}
                className="text-xs font-semibold text-[#0078d4] hover:text-[#106ebe] hover:underline transition-all cursor-pointer bg-transparent border-none outline-none disabled:text-[#a19f9d] disabled:no-underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                {isResending ? "Sending…" : "Resend code"}
              </button>
            </div>

            {/* Flat Microsoft Blue Button */}
            <button
              type="submit"
              disabled={isLoading || !otp.trim() || !newPassword.trim()}
              className="min-w-[120px] text-white text-xs font-semibold px-5 py-2.5 bg-[#0078d4] hover:bg-[#106ebe] active:bg-[#005a9e] disabled:bg-[#f3f2f1] disabled:text-[#a19f9d] disabled:border-[#edebe9] transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer rounded-none"
              style={{ minHeight: "36px" }}
            >
              {isLoading ? (
                <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <div className="flex items-center gap-0.5">
                  <span>Reset password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}

export default ResetPassword;