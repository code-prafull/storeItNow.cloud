import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  HardDrive,
  Key,
  Cloud,
  ArrowLeft,
  Camera,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  CreditCard,
  Check,
  Loader2
} from "lucide-react";

import {
  createOrder,
  verifyPayment
} from "../api/paymentApi";

import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  // Mock current user data
  const [userProfile, setUserProfile] = useState({
    name: "Prafull Singh",
    email: "prafull@storeitnow.cloud",
    joinDate: "June 2026",
    plan: "FREE PLAN", // Mutated plan initialization type state
    usedStorage: 4.5,
    totalStorage: 15, // Starting storage value configuration
    twoFactorEnabled: true,
  });

  const storagePercentage = Math.round(
    (userProfile.usedStorage / userProfile.totalStorage) * 100,
  );

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(userProfile);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // --- NEW STATES FOR SUBSCRIPTION INFRASTRUCTURE ---
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load Razorpay Checkout Script Dynamically on Runtime Mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Pricing Matrix Configurations
  const plansData = [
    {
      id: "FREE PLAN",
      name: "FREE PLAN",
      price: 0,
      storage: 15,
      features: ["15 GB Secure Storage", "Standard Transfer Speeds", "Single Device Active Session"],
      badge: "Basic"
    },
    {
      id: "PRO PLAN",
      name: "PRO PLAN",
      price: 99,
      storage: 100,
      features: ["100 GB Premium Storage", "High-Speed Concurrent Transfers", "Up to 5 Synchronized Sessions", "Priority Vault Encryption"],
      badge: "Popular"
    },
    {
      id: "BUSINESS PLAN",
      name: "BUSINESS PLAN",
      price: 299,
      storage: 1000,
      features: ["1 TB Enterprise Storage", "Uncapped Maximum File Speeds", "Unlimited Managed Devices", "Dedicated Support Ticket Line", "Advanced Team Matrix Portals"],
      badge: "Enterprise"
    }
  ];

  // Core Payment Pipeline Trigger (Real Backend Razorpay Version Connected)
  const handleUpgradePayment = async (targetPlan) => {
    if (targetPlan.id === userProfile.plan) return;

    // Direct fallback handling for free tier
    if (targetPlan.price === 0) {
      setUserProfile(prev => ({
        ...prev,
        plan: "FREE PLAN",
        totalStorage: 15
      }));
      return;
    }

    setSelectedPlan(targetPlan);
    setIsProcessing(true);

    try {
      // Backend se Razorpay Order Create
      const data = await createOrder(
        targetPlan.id === "PRO PLAN" ? "pro" : "business"
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.order.amount,
        currency: "INR",
        name: "StoreItNow",
        description: targetPlan.name,
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: targetPlan.id === "PRO PLAN" ? "pro" : "business"
            });

            if (verificationResult.success) {
              setUserProfile(prev => ({
                ...prev,
                plan: targetPlan.name,
                totalStorage: targetPlan.storage
              }));
              setShowSuccessModal(true);
            } else {
              alert("Payment Verification Failed");
            }
          } catch (error) {
            console.log(error);
            alert("Verification Error");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userProfile.name,
          email: userProfile.email,
        },
        theme: {
          color: "#0078d4"
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {

  console.log("FULL ERROR =>", error);

  console.log(
    "RESPONSE =>",
    error?.response?.data
  );

  alert(
    error?.response?.data?.message ||
    error.message
  );

  setIsProcessing(false);

}
  };

  const startEdit = () => {
    setForm(userProfile);
    setEditMode(true);
  };
  const cancelEdit = () => {
    setForm(userProfile);
    setAvatarPreview(null);
    setEditMode(false);
  };
  const saveEdit = () => {
    setUserProfile({ ...userProfile, ...form });
    setEditMode(false);
  };

  const handleAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarPreview(URL.createObjectURL(f));
  };

  return (
    <div
      className="min-h-screen text-[#323130] p-6 sm:p-10 select-none relative"
      style={{ background: "#f3f2f1" }}
    >
      
      {/* ── TRANSIENT PAYMENT PROCESSING OVERLAY SCREEN ── */}
      {isProcessing && (
        <div className="fixed inset-0 bg-[#201f1e]/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white border border-[#edebe9] p-8 rounded-xl shadow-2xl flex flex-col items-center max-w-sm text-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#0078d4] animate-spin" />
            <h3 className="text-base font-bold text-[#201f1e]">Contacting Gateway Bank...</h3>
            <p className="text-xs text-[#605e5c]">Secure Razorpay portal handshake initializing. Please do not close or reload this context window framework.</p>
          </div>
        </div>
      )}

      {/* ── TRANSACTION SUCCESS FEEDBACK SCREEN DIALOG MODAL ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#201f1e]/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#edebe9] max-w-md w-full rounded-2xl shadow-2xl p-6 text-center transform transition-all space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner border border-emerald-200">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#201f1e] tracking-tight">Provisioning Complete!</h3>
              <p className="text-xs text-[#605e5c] mt-1">
                Your payment instance token validated successfully. Account space configurations expanded.
              </p>
            </div>

            <div className="bg-[#f3f2f1] border border-[#edebe9] p-4 rounded-xl text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#605e5c] font-medium">Active Strategy tier:</span>
                <span className="font-bold text-[#0078d4] font-mono">{userProfile.plan}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#605e5c] font-medium">New Storage Limit:</span>
                <span className="font-bold text-slate-800 font-mono">{userProfile.totalStorage} GB</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Return to Control Panel Workspace
            </button>
          </div>
        </div>
      )}

      {/* ── TOP UTILITY HEADER ── */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0078d4] bg-white border border-[#edebe9] px-3 py-2 rounded shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h2 className="text-lg font-extrabold">Profile</h2>
        </div>

        <div className="flex items-center gap-3">
          {!editMode ? (
            <button
              onClick={startEdit}
              className="flex items-center gap-2 text-xs bg-white border px-3 py-2 rounded shadow-sm"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={saveEdit}
                className="flex items-center gap-2 text-xs bg-emerald-600 text-white px-3 py-2 rounded shadow-sm"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button
                onClick={cancelEdit}
                className="text-xs bg-white border px-3 py-2 rounded shadow-sm"
              >
                Cancel
              </button>
            </div>
          )}
          <span className="text-xs font-mono text-[#a19f9d]">
            storeitnow.cloud
          </span>
        </div>
      </div>

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* LEFT COLUMN: IDENTITY CARD */}
        <div className="bg-white border border-[#edebe9] rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
          {/* Avatar Area */}
          <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-full text-white font-bold text-4xl flex items-center justify-center border-4 border-[#f3f2f1] shadow-md bg-gradient-to-br from-[#0078d4] to-[#106ebe] overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {userProfile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 p-2 bg-white text-slate-700 rounded-full border shadow-sm transition-all cursor-pointer"
              title="Update Profile Picture"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {!editMode ? (
            <>
              <h2 className="text-xl font-bold tracking-tight text-[#201f1e]">
                {userProfile.name}
              </h2>
              <p className="text-xs font-semibold text-[#0078d4] bg-[#eff6fc] px-2.5 py-1 rounded-full mt-1.5 border border-[#deecf9]">
                {userProfile.plan}
              </p>
            </>
          ) : (
            <div className="w-full space-y-2">
              <input
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          )}

          <div className="w-full h-px bg-[#edebe9] my-5" />

          {/* Mini Storage Indicator */}
          <div className="w-full text-left space-y-2">
            <div className="flex justify-between text-xs font-semibold text-[#605e5c]">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-[#0078d4]" /> Personal Vault
              </span>
              <span>{storagePercentage}%</span>
            </div>
            <div className="w-full h-2 bg-[#edebe9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0078d4]"
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-[#a19f9d] font-mono tracking-wide text-center">
              {userProfile.usedStorage} GB utilized of{" "}
              {userProfile.totalStorage} GB
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNT & SECURITY PARAMS (Spans 2 columns) */}
        <div className="md:col-span-2 space-y-6">
          {/* Section A: Account Information */}
          <div className="bg-white border border-[#edebe9] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#605e5c] flex items-center gap-2">
                <User className="w-4 h-4 text-[#0078d4]" /> Account
              </h3>
              <div className="text-xs text-slate-500">
                Plan:{" "}
                <span className="font-semibold text-[#0078d4]">
                  {userProfile.plan}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-[#faf9f8] rounded border border-[#f3f2f1]">
                <label className="block text-[11px] font-bold text-[#a19f9d] uppercase tracking-wider mb-0.5">
                  Primary Identifier
                </label>
                {!editMode ? (
                  <span className="text-sm font-semibold text-[#201f1e]">
                    {userProfile.name}
                  </span>
                ) : (
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-sm"
                  />
                )}
              </div>

              <div className="p-3 bg-[#faf9f8] rounded border border-[#f3f2f1]">
                <label className="block text-[11px] font-bold text-[#a19f9d] uppercase tracking-wider mb-0.5">
                  Communications Node
                </label>
                {!editMode ? (
                  <span className="text-sm font-semibold text-[#201f1e] truncate block">
                    {userProfile.email}
                  </span>
                ) : (
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded text-sm"
                  />
                )}
              </div>

              <div className="p-3 bg-[#faf9f8] rounded border border-[#f3f2f1]">
                <label className="block text-[11px] font-bold text-[#a19f9d] uppercase tracking-wider mb-0.5">
                  Provisioned Stamp
                </label>
                <span className="text-sm font-semibold text-[#201f1e]">
                  {userProfile.joinDate}
                </span>
              </div>

              <div className="p-3 bg-[#faf9f8] rounded border border-[#f3f2f1]">
                <label className="block text-[11px] font-bold text-[#a19f9d] uppercase tracking-wider mb-0.5">
                  Network Allocation
                </label>
                <span className="text-sm font-semibold text-[#201f1e] font-mono">
                  {userProfile.totalStorage}.00 GB Pool
                </span>
              </div>
            </div>
          </div>

          {/* Section B: Security Framework */}
          <div className="bg-white border border-[#edebe9] rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#605e5c] mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0078d4]" /> Security Guard Rails
            </h3>

            <div className="divide-y divide-[#f3f2f1]">
              <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex gap-3 items-start pr-4">
                  <div className="p-2 bg-[#eff6fc] text-[#0078d4] rounded-lg mt-0.5">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#201f1e]">
                      Two-Factor Authentication (2FA)
                    </h4>
                    <p className="text-xs text-[#605e5c] mt-0.5">
                      Enforce mobile token requests on unrecognized network footprints.
                    </p>
                  </div>
                </div>
                <div>
                  {userProfile.twoFactorEnabled ? (
                    <span className="text-xs font-semibold text-[#107c41] bg-[#e1f1e9] border border-[#107c41]/20 px-3 py-1 rounded flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-[#a80000] bg-[#fde7e9] border border-[#a80000]/20 px-3 py-1 rounded flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Disabled
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-3.5 last:pb-0">
                <div className="flex gap-3 items-start pr-4">
                  <div className="p-2 bg-[#eff6fc] text-[#0078d4] rounded-lg mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#201f1e]">
                      Account Encryption Keys
                    </h4>
                    <p className="text-xs text-[#605e5c] mt-0.5">
                      Cycle encryption phrase sequences periodically to keep data secure.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#0078d4] hover:text-[#106ebe] border border-[#bab8b6] hover:border-[#0078d4] bg-white px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer"
                >
                  Modify Key
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION C: DYNAMIC SUBSCRIPTION MATRIX CENTRE (Full Width Row) ── */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-[#edebe9] rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-[#f3f2f1] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#605e5c] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0078d4]" /> Storage Tier Matrix
            </h3>
            <p className="text-xs text-[#a19f9d] mt-0.5">Select a node volume package layer below to upgrade deployment parameters instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plansData.map((planOption) => {
              const isCurrent = userProfile.plan === planOption.id;
              return (
                <div 
                  key={planOption.id} 
                  className={`border rounded-xl p-5 relative flex flex-col justify-between transition-all ${
                    isCurrent 
                      ? "border-[#0078d4] bg-[#eff6fc]/30 ring-1 ring-[#0078d4]" 
                      : "border-[#edebe9] bg-white hover:border-[#b4a4a4]/40 hover:shadow-md"
                  }`}
                >
                  <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono uppercase bg-slate-100 text-slate-500 border border-slate-200">
                    {planOption.badge}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 tracking-wide uppercase">{planOption.name}</h4>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          {planOption.price === 0 ? "Free" : `₹${planOption.price}`}
                        </span>
                        {planOption.price > 0 && <span className="text-[11px] text-slate-400 font-medium ml-1">/ lifetime</span>}
                      </div>
                    </div>

                    <div className="text-xs font-bold text-[#0078d4] font-mono bg-[#eff6fc] px-2.5 py-1 rounded w-max">
                      {planOption.storage} GB Capacity
                    </div>

                    <ul className="space-y-2 pt-2 border-t border-dashed border-[#edebe9]">
                      {planOption.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs text-[#605e5c]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => handleUpgradePayment(planOption)}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer border ${
                        isCurrent 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold cursor-default" 
                          : "bg-[#0078d4] text-white border-transparent hover:bg-[#106ebe] shadow-sm shadow-blue-500/10"
                      }`}
                    >
                      {isCurrent ? "Active Deployment Plan" : "Upgrade Instance"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}