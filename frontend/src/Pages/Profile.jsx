import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Cloud,
  ArrowLeft,
  Camera,
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  CreditCard,
  Check,
  Loader2,
  RefreshCw,
  Key,
} from "lucide-react";

import {
  createOrder,
  verifyPayment,
} from "../api/paymentApi";

import { getProfile, updateProfile } from "../api/userApi";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../components/ThemeToggle";
import {
  formatBytes,
  formatDate,
  errorMessage,
  getStoragePercent,
  getStorageTone,
} from "../utils/format";

const planLabel = (plan) => {
  const value = (plan || "free").toLowerCase();

  if (value === "pro") return "PRO PLAN";
  if (value === "business") return "BUSINESS PLAN";

  return "FREE PLAN";
};

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

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();

  // ── Load state ──
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    joinDate: "—",
    plan: "FREE PLAN",
    storageUsed: 0,
    maxStorage: 0,
    twoFactorEnabled: false,
    avatar: null,
  });

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(userProfile);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // ── Subscription states ──
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      const u = data.user || {};

      const next = {
        name: u.name || "",
        email: u.email || "",
        joinDate: u.createdAt ? formatDate(u.createdAt) : "—",
        plan: planLabel(u.plan),
        storageUsed: Number(u.storageUsed) || 0,
        maxStorage: Number(u.maxStorage) || 0,
        twoFactorEnabled: false,
        avatar: u.avatar || null,
      };

      setUserProfile(next);
      setForm(next);
      setLoadError("");

      return next;
    } catch (error) {
      setLoadError(errorMessage(error, "Could not load your profile"));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial data fetch — setState fetch ke baad hota hai
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile().catch(() => {
      // loadError state already set
    });
  }, [loadProfile]);

  // Razorpay checkout script — sirf ek baar
  useEffect(() => {
    if (window.Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const storagePercentage = getStoragePercent(
    userProfile.storageUsed,
    userProfile.maxStorage,
  );
  const storageTone = getStorageTone(storagePercentage);

  // Core Payment Pipeline Trigger (Real Backend Razorpay Version Connected)
  const handleUpgradePayment = async (targetPlan) => {
    if (targetPlan.id === userProfile.plan) return;

    // Direct fallback handling for free tier
    if (targetPlan.price === 0) {
      try {
        await loadProfile();
        toast.info("Switched to the free plan");
      } catch {
        setUserProfile((prev) => ({
          ...prev,
          plan: "FREE PLAN",
        }));
      }
      return;
    }

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
              // Server par jo quota actually set hua wahi dikhao
              await loadProfile().catch(() => {});
              setShowSuccessModal(true);
              toast.success("Payment verified — plan upgraded");
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            console.log(error);
            toast.error(errorMessage(error, "Verification failed"));
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
            toast.info("Payment cancelled");
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {

      console.log("FULL ERROR =>", error);
      console.log("RESPONSE =>", error?.response?.data);

      toast.error(
        errorMessage(error, "Could not start the payment")
      );

      setIsProcessing(false);
    }
  };

  const startEdit = () => {
    setForm(userProfile);
    setAvatarPreview(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setForm(userProfile);
    setAvatarPreview(null);
    setEditMode(false);
  };

  const saveEdit = async () => {
    const name = (form.name || "").trim();

    if (!name) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      const data = await updateProfile(name);

      setUserProfile((prev) => ({
        ...prev,
        name: data.user?.name || name,
      }));
      setEditMode(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(errorMessage(error, "Could not update profile"));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    toast.info("Profile photo preview only — it isn't saved yet");
  };

  const initials = userProfile.name
    ? userProfile.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f2f1] dark:bg-[#0b0d12] p-6 sm:p-10">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-8 w-40 rounded bg-slate-200 dark:bg-slate-800 skeleton" />
            <div className="h-8 w-24 rounded bg-slate-200 dark:bg-slate-800 skeleton" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-72 rounded-xl bg-slate-200 dark:bg-slate-800 skeleton" />
            <div className="md:col-span-2 h-72 rounded-xl bg-slate-200 dark:bg-slate-800 skeleton" />
          </div>
          <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800 skeleton" />
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (loadError) {
    return (
      <div className="min-h-screen bg-[#f3f2f1] dark:bg-[#0b0d12] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-[#161a23] border border-[#edebe9] dark:border-slate-700 rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#201f1e] dark:text-slate-100">
              Couldn’t load your profile
            </h3>
            <p className="text-xs text-[#605e5c] dark:text-slate-400 mt-1.5">
              {loadError}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 text-xs font-semibold px-4 py-2.5 rounded-lg border border-[#bab8b6] dark:border-slate-600 text-[#323130] dark:text-slate-300 hover:bg-[#f3f2f1] dark:hover:bg-slate-800 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => {
                setLoading(true);
                setLoadError("");
                loadProfile().catch(() => {});
              }}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-[#0078d4] text-white hover:bg-[#106ebe] transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#323130] dark:text-slate-200 p-4 sm:p-6 lg:p-10 select-none relative bg-[#f3f2f1] dark:bg-[#0b0d12]">
      {/* ── TRANSIENT PAYMENT PROCESSING OVERLAY SCREEN ── */}
      {isProcessing && (
        <div className="fixed inset-0 bg-[#201f1e]/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#161a23] border border-[#edebe9] dark:border-slate-700 p-8 rounded-xl shadow-2xl flex flex-col items-center max-w-sm text-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#0078d4] animate-spin" />
            <h3 className="text-base font-bold text-[#201f1e] dark:text-slate-100">
              Contacting payment gateway…
            </h3>
            <p className="text-xs text-[#605e5c] dark:text-slate-400">
              Secure Razorpay checkout is opening. Please don’t close or reload
              this tab.
            </p>
          </div>
        </div>
      )}

      {/* ── TRANSACTION SUCCESS FEEDBACK SCREEN DIALOG MODAL ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#201f1e]/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161a23] border border-[#edebe9] dark:border-slate-700 max-w-md w-full rounded-2xl shadow-2xl p-6 text-center transform transition-all space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#201f1e] dark:text-slate-100 tracking-tight">
                Payment successful!
              </h3>
              <p className="text-xs text-[#605e5c] dark:text-slate-400 mt-1">
                Your subscription is active and the new storage quota is
                already applied to your account.
              </p>
            </div>

            <div className="bg-[#f3f2f1] dark:bg-slate-900 border border-[#edebe9] dark:border-slate-700 p-4 rounded-xl text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#605e5c] dark:text-slate-400 font-medium">
                  Active plan:
                </span>
                <span className="font-bold text-[#0078d4] font-mono">
                  {userProfile.plan}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#605e5c] dark:text-slate-400 font-medium">
                  Storage quota:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">
                  {formatBytes(userProfile.maxStorage)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Back to my profile
            </button>
          </div>
        </div>
      )}

      {/* ── TOP UTILITY HEADER ── */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0078d4] bg-white dark:bg-[#161a23] dark:hover:text-blue-400 border border-[#edebe9] dark:border-slate-700 px-3 py-2 rounded shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h2 className="text-lg font-extrabold text-[#201f1e] dark:text-slate-100">
            Profile
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!editMode ? (
            <button
              onClick={startEdit}
              className="flex items-center gap-2 text-xs bg-white dark:bg-[#161a23] dark:text-slate-200 border border-[#edebe9] dark:border-slate-700 hover:border-[#bab8b6] dark:hover:border-slate-500 px-3 py-2 rounded shadow-sm transition-all"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={saveEdit}
                className="flex items-center gap-2 text-xs bg-emerald-600 text-white px-3 py-2 rounded shadow-sm hover:bg-emerald-700 transition-all"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button
                onClick={cancelEdit}
                className="text-xs bg-white dark:bg-[#161a23] dark:text-slate-200 border border-[#edebe9] dark:border-slate-700 px-3 py-2 rounded shadow-sm transition-all"
              >
                Cancel
              </button>
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* LEFT COLUMN: IDENTITY CARD */}
        <div className="bg-white dark:bg-[#161a23] border border-[#edebe9] dark:border-slate-700 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
          {/* Avatar Area */}
          <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-full text-white font-bold text-4xl flex items-center justify-center border-4 border-[#f3f2f1] dark:border-slate-800 shadow-md bg-gradient-to-br from-[#0078d4] to-[#106ebe] overflow-hidden">
              {avatarPreview || userProfile.avatar ? (
                <img
                  src={avatarPreview || userProfile.avatar}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full border border-[#edebe9] dark:border-slate-600 shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Update profile picture"
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
              <h2 className="text-xl font-bold tracking-tight text-[#201f1e] dark:text-slate-100">
                {userProfile.name}
              </h2>
              <p className="text-xs font-semibold text-[#0078d4] dark:text-blue-400 bg-[#eff6fc] dark:bg-blue-500/10 px-2.5 py-1 rounded-full mt-1.5 border border-[#deecf9] dark:border-blue-500/20">
                {userProfile.plan}
              </p>
            </>
          ) : (
            <div className="w-full space-y-2">
              <input
                className="w-full border border-[#edebe9] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 rounded text-sm focus:border-[#0078d4] outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
              <input
                className="w-full border border-[#edebe9] dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400 px-3 py-2 rounded text-sm opacity-70 cursor-not-allowed"
                value={form.email}
                readOnly
                title="Email change needs verification — not editable yet"
              />
              <p className="text-[10px] text-[#a19f9d] dark:text-slate-500">
                Email is locked. Contact support to change it.
              </p>
            </div>
          )}

          <div className="w-full h-px bg-[#edebe9] dark:bg-slate-700 my-5" />

          {/* Mini Storage Indicator */}
          <div className="w-full text-left space-y-2">
            <div className="flex justify-between text-xs font-semibold text-[#605e5c] dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-[#0078d4]" /> Personal Vault
              </span>
              <span className={storageTone.text}>{storagePercentage}%</span>
            </div>
            <div className="w-full h-2 bg-[#edebe9] dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${storageTone.bar} transition-all duration-500`}
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-[#a19f9d] dark:text-slate-500 font-mono tracking-wide text-center">
              {formatBytes(userProfile.storageUsed)} of{" "}
              {formatBytes(userProfile.maxStorage)}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNT & SECURITY PARAMS */}
        <div className="md:col-span-2 space-y-6">
          {/* Section A: Account Information */}
          <div className="bg-white dark:bg-[#161a23] border border-[#edebe9] dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#605e5c] dark:text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0078d4]" /> Account
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Plan:{" "}
                <span className="font-semibold text-[#0078d4] dark:text-blue-400">
                  {userProfile.plan}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-[#faf9f8] dark:bg-slate-900/60 rounded border border-[#f3f2f1] dark:border-slate-700">
                <label className="block text-[11px] font-bold text-[#a19f9d] dark:text-slate-500 uppercase tracking-wider mb-0.5">
                  Primary Identifier
                </label>
                {!editMode ? (
                  <span className="text-sm font-semibold text-[#201f1e] dark:text-slate-100">
                    {userProfile.name}
                  </span>
                ) : (
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-[#edebe9] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 px-3 py-2 rounded text-sm focus:border-[#0078d4] outline-none"
                  />
                )}
              </div>

              <div className="p-3 bg-[#faf9f8] dark:bg-slate-900/60 rounded border border-[#f3f2f1] dark:border-slate-700">
                <label className="block text-[11px] font-bold text-[#a19f9d] dark:text-slate-500 uppercase tracking-wider mb-0.5">
                  Email
                </label>
                <span className="text-sm font-semibold text-[#201f1e] dark:text-slate-100 truncate block">
                  {userProfile.email}
                </span>
              </div>

              <div className="p-3 bg-[#faf9f8] dark:bg-slate-900/60 rounded border border-[#f3f2f1] dark:border-slate-700">
                <label className="block text-[11px] font-bold text-[#a19f9d] dark:text-slate-500 uppercase tracking-wider mb-0.5">
                  Member since
                </label>
                <span className="text-sm font-semibold text-[#201f1e] dark:text-slate-100">
                  {userProfile.joinDate}
                </span>
              </div>

              <div className="p-3 bg-[#faf9f8] dark:bg-slate-900/60 rounded border border-[#f3f2f1] dark:border-slate-700">
                <label className="block text-[11px] font-bold text-[#a19f9d] dark:text-slate-500 uppercase tracking-wider mb-0.5">
                  Storage quota
                </label>
                <span className="text-sm font-semibold text-[#201f1e] dark:text-slate-100 font-mono">
                  {formatBytes(userProfile.maxStorage)}
                </span>
              </div>
            </div>
          </div>

          {/* Section B: Security Framework */}
          <div className="bg-white dark:bg-[#161a23] border border-[#edebe9] dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#605e5c] dark:text-slate-400 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0078d4]" /> Security
            </h3>

            <div className="divide-y divide-[#f3f2f1] dark:divide-slate-700/70">
              <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-4">
                <div className="flex gap-3 items-start pr-4">
                  <div className="p-2 bg-[#eff6fc] dark:bg-blue-500/10 text-[#0078d4] dark:text-blue-400 rounded-lg mt-0.5">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#201f1e] dark:text-slate-100">
                      Two-Factor Authentication (2FA)
                    </h4>
                    <p className="text-xs text-[#605e5c] dark:text-slate-400 mt-0.5">
                      Requires a second factor on unfamiliar devices.
                    </p>
                  </div>
                </div>
                <div>
                  {userProfile.twoFactorEnabled ? (
                    <span className="text-xs font-semibold text-[#107c41] dark:text-emerald-400 bg-[#e1f1e9] dark:bg-emerald-500/10 border border-[#107c41]/20 dark:border-emerald-500/20 px-3 py-1 rounded flex items-center gap-1 whitespace-nowrap">
                      <CheckCircle className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-[#a80000] dark:text-rose-400 bg-[#fde7e9] dark:bg-rose-500/10 border border-[#a80000]/20 dark:border-rose-500/20 px-3 py-1 rounded flex items-center gap-1 whitespace-nowrap">
                      <AlertCircle className="w-3.5 h-3.5" /> Not enabled
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-3.5 last:pb-0 gap-4">
                <div className="flex gap-3 items-start pr-4">
                  <div className="p-2 bg-[#eff6fc] dark:bg-blue-500/10 text-[#0078d4] dark:text-blue-400 rounded-lg mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#201f1e] dark:text-slate-100">
                      Password
                    </h4>
                    <p className="text-xs text-[#605e5c] dark:text-slate-400 mt-0.5">
                      Change it regularly to keep your files safe.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-semibold text-[#0078d4] hover:text-[#106ebe] border border-[#bab8b6] dark:border-slate-600 hover:border-[#0078d4] bg-white dark:bg-slate-800 px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer"
                >
                  Change password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION C: SUBSCRIPTION MATRIX ── */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#161a23] border border-[#edebe9] dark:border-slate-700 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-[#f3f2f1] dark:border-slate-700 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#605e5c] dark:text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0078d4]" /> Storage plans
            </h3>
            <p className="text-xs text-[#a19f9d] dark:text-slate-500 mt-0.5">
              Upgrade instantly — the new quota is applied right after payment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plansData.map((planOption) => {
              const isCurrent = userProfile.plan === planOption.id;
              return (
                <div
                  key={planOption.id}
                  className={`border rounded-xl p-5 relative flex flex-col justify-between transition-all ${
                    isCurrent
                      ? "border-[#0078d4] dark:border-blue-500 bg-[#eff6fc]/30 dark:bg-blue-500/5 ring-1 ring-[#0078d4]"
                      : "border-[#edebe9] dark:border-slate-700 bg-white dark:bg-slate-900/40 hover:border-[#b4a4a4]/40 dark:hover:border-slate-500 hover:shadow-md"
                  }`}
                >
                  <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {planOption.badge}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-wide uppercase pr-16">
                        {planOption.name}
                      </h4>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-2xl font-black text-slate-900 dark:text-slate-50 font-mono">
                          {planOption.price === 0 ? "Free" : `₹${planOption.price}`}
                        </span>
                        {planOption.price > 0 && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium ml-1">
                            / lifetime
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-bold text-[#0078d4] dark:text-blue-400 font-mono bg-[#eff6fc] dark:bg-blue-500/10 px-2.5 py-1 rounded w-max">
                      {planOption.storage >= 1000
                        ? `${planOption.storage / 1000} TB`
                        : `${planOption.storage} GB`}{" "}
                      Capacity
                    </div>

                    <ul className="space-y-2 pt-2 border-t border-dashed border-[#edebe9] dark:border-slate-700">
                      {planOption.features.map((feature, fIdx) => (
                        <li
                          key={fIdx}
                          className="flex items-start gap-2 text-xs text-[#605e5c] dark:text-slate-400"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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
                      className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all border ${
                        isCurrent
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 font-semibold cursor-default"
                          : "bg-[#0078d4] text-white border-transparent hover:bg-[#106ebe] shadow-sm shadow-blue-500/10 cursor-pointer"
                      }`}
                    >
                      {isCurrent ? "Current plan" : "Upgrade"}
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
