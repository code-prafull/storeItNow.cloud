import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ArrowLeft, ArrowRight, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/auth/forgot-password", { email });
      
      setMessage({ 
        type: "success", 
        text: response.data.message || "Verification OTP sent successfully to your email." 
      });
      
      // Verification text padhne ke liye chhota sa delay
      setTimeout(() => {
        navigate("/reset-password", {
          state: { email }
        });
      }, 1500);

    } catch (error) {
      console.log(error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to send OTP. Please verify your email and try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#f3f2f1] font-sans antialiased text-[#323130] p-4 select-none">
      
      {/* Centered OneDrive Style Card Layout */}
      <div className="w-full max-w-[420px] bg-white p-10 rounded-lg border border-[#edebe9]" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        
        {/* Branding & App Logo Descriptor */}
        <div className="flex items-center gap-2 mb-6 select-none">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#0078d4">
            <path d="M10.5 18.5H6.5C4 18.5 2 16.5 2 14c0-2.1 1.4-3.9 3.4-4.4C5.8 7.6 7.5 6.5 9.5 6.5c.3 0 .6 0 .9.1C11.2 4.9 12.9 4 15 4c3.3 0 6 2.7 6 6 0 .2 0 .4 0 .6 1.7.5 3 2.1 3 4 0 2.2-1.8 4-4 4h-9.5z" />
          </svg>
          <span className="text-xs font-bold tracking-wider uppercase text-[#0078d4]">storeItNow.cloud</span>
        </div>

        {/* Headings & User Instructions */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#201f1e" }}>
            Forgot Password
          </h1>
          <p className="text-xs mt-1.5 leading-relaxed text-[#605e5c]">
            Enter your registered email address below to receive a secure verification OTP code on your device.
          </p>
        </div>

        {/* Dynamic Success / Error Alert Banners */}
        {message.text && (
          <div className={`p-3 rounded-md border text-xs font-medium mb-5 flex items-start gap-2.5 animate-fadeIn ${
            message.type === "success" 
              ? "bg-[#f3f9f4] border-[#dff6dd] text-[#107c41]" 
              : "bg-[#fde7e9] border-[#fde7e9] text-[#a80000]"
          }`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#107c41] flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#a80000] flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-normal">{message.text}</span>
          </div>
        )}

        {/* Request Pipeline Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#605e5c] mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              disabled={isLoading}
              placeholder="someone@storeitnow.cloud"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#faf9f8] text-[#201f1e] placeholder-[#a19f9d] border border-[#bab8b6] rounded px-3.5 py-2.5 text-xs outline-none focus:border-[#0078d4] focus:bg-white transition-all disabled:opacity-60 font-medium"
              onFocus={(e) => { e.target.style.borderColor = "#0078d4"; e.target.style.boxShadow = "0 0 0 1px #0078d4"; }}
              onBlur={(e) => { e.target.style.borderColor = "#bab8b6"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Submit Trigger with Loading State */}
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full text-white text-xs font-semibold h-10 rounded bg-[#0078d4] hover:bg-[#106ebe] active:scale-[0.99] disabled:bg-[#f3f2f1] disabled:text-[#a19f9d] disabled:border-[#edebe9] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer select-none"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Sending OTP...</span>
              </div>
            ) : (
              <>
                <span>Send OTP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* ✅ Dedicated Back to Login Control Section */}
        <div className="mt-6 pt-4 border-t border-[#edebe9]">
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={isLoading}
            className="w-full py-2 text-xs font-semibold rounded border text-slate-600 hover:text-[#0078d4] transition-all duration-150 flex items-center justify-center gap-1.5"
            style={{ background: "#faf9f8", borderColor: "#bab8b6", cursor: "pointer" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#f3f2f1"; e.currentTarget.style.borderColor = "#0078d4"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "#faf9f8"; e.currentTarget.style.borderColor = "#bab8b6"; }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </button>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default ForgotPassword;