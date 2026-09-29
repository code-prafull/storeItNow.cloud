import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

/**
 * Compact sun/moon toggle. `size` = "sm" (header/sidebar) | "lg".
 */
export default function ThemeToggle({ size = "sm", className = "" }) {
  const { theme, toggle } = useTheme();

  const isDark = theme === "dark";

  const box =
    size === "lg"
      ? "w-11 h-11 rounded-xl"
      : "w-8 h-8 rounded-lg";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`${box} ${className} flex items-center justify-center border transition-all duration-200
        border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-900
        text-slate-500 dark:text-slate-400
        hover:text-slate-900 dark:hover:text-slate-100
        hover:border-slate-300 dark:hover:border-slate-600
        hover:bg-slate-50 dark:hover:bg-slate-800`}
    >
      {isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
