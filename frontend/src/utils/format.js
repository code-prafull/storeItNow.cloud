/**
 * Storage / date formatting helpers.
 *
 * Backend me storageUsed = bytes (upload size se $inc hota hai) aur
 * maxStorage = bytes. Isliye display hamesha formatBytes se karna chahiye,
 * warna "50000000 GB" jaisa galat label ban jata hai.
 */

export const formatBytes = (value, decimals = 1) => {
  const bytes = Number(value);

  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const num = bytes / 1024 ** i;

  return `${i === 0 ? num.toFixed(0) : num.toFixed(decimals)} ${units[i]}`;
};

export const getStoragePercent = (used, total) => {
  const u = Number(used) || 0;
  const t = Number(total) || 0;

  if (t <= 0) return 0;

  return Math.min(Math.round((u / t) * 100), 100);
};

// 0-69 → emerald, 70-89 → amber, 90+ → rose
export const getStorageTone = (percent) => {
  if (percent >= 90) return { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" };
  if (percent >= 70) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
};

export const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const timeAgo = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return formatDate(date);
};

export const errorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;
