import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { ToastContext } from "../context/ToastContext";

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONES = {
  success:
    "border-emerald-200 dark:border-emerald-500/40 bg-white dark:bg-slate-900",
  error:
    "border-rose-200 dark:border-rose-500/40 bg-white dark:bg-slate-900",
  info: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
};

const ICON_TONES = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-rose-600 dark:text-rose-400",
  info: "text-slate-500 dark:text-slate-400",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) =>
      list.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
    );

    window.setTimeout(() => {
      setToasts((list) => list.filter((toast) => toast.id !== id));
    }, 200);
  }, []);

  const push = useCallback(
    (type, message, options = {}) => {
      if (!message) return;

      const id = ++counter.current;
      const duration = options.duration ?? (type === "error" ? 6000 : 3500);

      setToasts((list) => [
        ...list.slice(-3), // max 4 toast ek saath
        { id, type, message, title: options.title, leaving: false },
      ]);

      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (message, options) => push("success", message, options),
      error: (message, options) => push("error", message, options),
      info: (message, options) => push("info", message, options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Viewport — bottom right, responsive */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-80 pointer-events-none"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || ICONS.info;

          return (
            <div
              key={toast.id}
              className={`${TONES[toast.type] || TONES.info} ${
                toast.leaving ? "animate-toast-out" : "animate-toast-in"
              } pointer-events-auto border rounded-xl shadow-lg shadow-slate-900/5 dark:shadow-black/40 px-3.5 py-3 flex items-start gap-3`}
            >
              <Icon
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  ICON_TONES[toast.type] || ICON_TONES.info
                }`}
              />

              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {toast.title}
                  </p>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug break-words">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="p-1 -m-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
