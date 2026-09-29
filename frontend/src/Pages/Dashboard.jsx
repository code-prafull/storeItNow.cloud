import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  HardDrive,
  Image,
  Video,
  FileText,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  Cloud,
  MoreVertical,
  LayoutGrid,
  List,
  Home,
  ArrowUpDown,
  CheckCircle2,
  File,
  Download,
  Trash2,
  Shield,
  Menu,
  Plus,
  Upload,
  ArrowLeft,
  X,
  Loader2,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";

import { getProfile } from "../api/userApi";
import { getFolders, createFolder } from "../api/folderApi";
import {
  uploadFile,
  getMyFiles,
  deleteFile,
  searchFiles,
} from "../api/fileApi";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../components/ThemeToggle";
import {
  formatBytes,
  formatDate,
  getStoragePercent,
  getStorageTone,
  errorMessage,
  timeAgo,
} from "../utils/format";

const SORT_OPTIONS = [
  { id: "recent", label: "Newest" },
  { id: "name", label: "Name" },
  { id: "size", label: "Size" },
];

function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  // ── Data ──
  const [user, setUser] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);

  // ── Load states ──
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");

  // ── Workspace UI ──
  const [folderName, setFolderName] = useState("");
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // file | "selected"

  // ── Upload ──
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState(null); // { name, index, total, percent }
  const dragDepth = useRef(0);
  const searchInputRef = useRef(null);

  // ── Notifications (real activity, session based) ──
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const notify = useCallback((title, body) => {
    setNotifications((list) => [
      { id: `${Date.now()}-${Math.random()}`, title, body, unread: true, at: new Date() },
      ...list,
    ].slice(0, 20));
  }, []);

  // ── Data loading ──
  const loadFiles = useCallback(async () => {
    const data = await getMyFiles();
    setFiles(data.files || []);
    return data.files || [];
  }, []);

  const loadAll = useCallback(async (options = {}) => {
    try {
      const profileData = await getProfile();
      setUser(profileData.user);
    } catch (error) {
      if (!options.partial) {
        setLoadError(errorMessage(error, "Could not load your account"));
        setStatus("error");
        return;
      }
    }

    try {
      const folderData = await getFolders();
      setFolders(folderData.folders || []);
    } catch (error) {
      if (!options.partial) {
        setLoadError(errorMessage(error, "Could not load folders"));
        setStatus("error");
        return;
      }
    }

    try {
      await loadFiles();
      setStatus("ready");
    } catch (error) {
      setLoadError(errorMessage(error, "Could not load files"));
      setStatus("error");
    }
  }, [loadFiles]);

  useEffect(() => {
    // initial data fetch — setState fetch ke baad hota hai
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, [loadAll]);

  const refreshStorage = useCallback(async () => {
    try {
      const profileData = await getProfile();
      setUser(profileData.user);
    } catch {
      // storage refresh best-effort hai
    }
  }, []);

  // ── Storage ──
  const used = Number(user?.storageUsed) || 0;
  const total = Number(user?.maxStorage) || 0;
  const storagePercent = getStoragePercent(used, total);
  const storageTone = getStorageTone(storagePercent);
  const isFull = total > 0 && used >= total;

  // ── Folder create ──
  const handleCreateFolder = async () => {
    const name = folderName.trim();
    if (!name) return;

    try {
      const data = await createFolder(name);
      setFolders((prev) => [...prev, data.folder]);
      setFolderName("");
      toast.success(`Folder "${name}" created`);
      notify("Folder created", name);
    } catch (error) {
      toast.error(errorMessage(error, "Could not create folder"));
    }
  };

  // ── Upload (button + drag & drop dono) ──
  const handleUpload = useCallback(
    async (fileList) => {
      const queue = Array.from(fileList || []);

      if (queue.length === 0) return;

      if (isFull) {
        toast.error("Storage is full — delete some files or upgrade your plan.");
        return;
      }

      let uploadedCount = 0;

      for (let index = 0; index < queue.length; index += 1) {
        const file = queue[index];

        setUploadState({
          name: file.name,
          index: index + 1,
          total: queue.length,
          percent: 0,
        });

        try {
          const data = await uploadFile(file, currentFolder?._id, (percent) =>
            setUploadState((prev) => (prev ? { ...prev, percent } : prev)),
          );

          if (data?.file) {
            setFiles((prev) => [data.file, ...prev]);
            uploadedCount += 1;
            notify("Upload complete", file.name);
          }
        } catch (error) {
          toast.error(
            `${file.name}: ${errorMessage(error, "Upload failed")}`,
          );
        }
      }

      setUploadState(null);

      if (uploadedCount > 0) {
        toast.success(
          uploadedCount === 1
            ? "1 file uploaded"
            : `${uploadedCount} files uploaded`,
        );
        refreshStorage();
      }
    },
    [currentFolder, isFull, notify, refreshStorage, toast],
  );

  // ── Drag & drop ──
  const handleDragEnter = (event) => {
    if (!event.dataTransfer?.types?.includes("Files")) return;
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    handleUpload(event.dataTransfer?.files);
  };

  // ── Delete (single + bulk) ──
  const performDelete = async () => {
    const target = confirmTarget;
    setConfirmTarget(null);

    if (!target) return;

    const ids =
      target === "selected" ? selectedFiles : [target._id];

    if (ids.length === 0) return;

    try {
      await Promise.all(ids.map((id) => deleteFile(id)));

      setFiles((prev) => prev.filter((file) => !ids.includes(file._id)));
      setSelectedFiles((prev) => prev.filter((id) => !ids.includes(id)));
      setActiveMenuId(null);

      toast.success(
        ids.length === 1 ? "File deleted" : `${ids.length} files deleted`,
      );
      notify(
        ids.length === 1 ? "File deleted" : "Files deleted",
        ids.length === 1 ? target.fileName : `${ids.length} files removed`,
      );

      refreshStorage();
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete"));
    }
  };

  // ── Search (debounced, event driven) ──
  const searchTimer = useRef(null);

  const runSearch = useCallback(
    async (value) => {
      const query = value.trim();

      if (!query) {
        setActiveQuery("");
        try {
          await loadFiles();
        } catch {
          // files refresh best-effort hai
        }
        return;
      }

      try {
        const data = await searchFiles(query);
        setFiles(data.files || []);
        setActiveQuery(query);
      } catch (error) {
        toast.error(errorMessage(error, "Search failed"));
      }
    },
    [loadFiles, toast],
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);

    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => runSearch(value), 350);
  };

  const clearSearch = useCallback(() => {
    window.clearTimeout(searchTimer.current);
    setSearch("");
    runSearch("");
    searchInputRef.current?.focus();
  }, [runSearch]);

  useEffect(
    () => () => window.clearTimeout(searchTimer.current),
    [],
  );

  // ── Derived lists ──
  const imagesCount = files.filter((f) =>
    f.fileType?.toLowerCase().includes("image"),
  ).length;
  const videosCount = files.filter((f) =>
    f.fileType?.toLowerCase().includes("video"),
  ).length;
  const documentsCount = files.filter(
    (f) =>
      f.fileType?.toLowerCase().includes("pdf") ||
      f.fileType?.toLowerCase().includes("sheet") ||
      f.fileType?.toLowerCase().includes("excel") ||
      f.fileType?.toLowerCase().includes("document") ||
      f.fileType?.toLowerCase().includes("word"),
  ).length;

  const displayedFiles = useMemo(() => {
    const isSearch = activeQuery.length > 0;

    const inScope = isSearch
      ? files
      : files.filter((file) =>
          currentFolder
            ? String(file.folder || file.folderId) === String(currentFolder._id)
            : !(file.folder || file.folderId),
        );

    const sorted = [...inScope];

    if (sortBy === "name") {
      sorted.sort((a, b) =>
        (a.fileName || "").localeCompare(b.fileName || "", undefined, {
          sensitivity: "base",
        }),
      );
    } else if (sortBy === "size") {
      sorted.sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0));
    } else {
      sorted.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    }

    return sorted;
  }, [files, currentFolder, activeQuery, sortBy]);

  // ── Selection ──
  const toggleSelect = (id) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id],
    );
  };

  const allVisibleSelected =
    displayedFiles.length > 0 &&
    displayedFiles.every((file) => selectedFiles.includes(file._id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(displayedFiles.map((file) => file._id));
      setSelectedFiles((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      setSelectedFiles((prev) => [
        ...new Set([...prev, ...displayedFiles.map((file) => file._id)]),
      ]);
    }
  };

  // ── Notifications UI ──
  const unreadCount = notifications.filter((n) => n.unread).length;
  const markAllRead = () =>
    setNotifications((list) => list.map((n) => ({ ...n, unread: false })));

  // ── Logout ──
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKeyDown = (event) => {
      const isInput =
        ["INPUT", "TEXTAREA"].includes(event.target?.tagName) || false;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }

      if (event.key === "Escape") {
        setActiveMenuId(null);
        setShowNotifications(false);
        setSidebarOpen(false);
        setConfirmTarget(null);
        if (isInput && document.activeElement === searchInputRef.current) {
          clearSearch();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSearch]);

  // ── Small render helpers ──
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const getFileIcon = (type) => {
    const lowerType = type?.toLowerCase() || "";
    if (
      lowerType.includes("excel") ||
      lowerType.includes("sheet") ||
      lowerType.includes("xlsx")
    )
      return <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (lowerType.includes("pdf") || lowerType.includes("document"))
      return <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    if (lowerType.includes("video") || lowerType.includes("mp4"))
      return <Video className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    if (
      lowerType.includes("image") ||
      lowerType.includes("png") ||
      lowerType.includes("jpg") ||
      lowerType.includes("jpeg")
    )
      return <Image className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    return <File className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
  };

  const renderSkeleton = () => (
    <div className="space-y-8 animate-pulse">
      <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 skeleton" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 skeleton"
          />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800 skeleton"
          />
        ))}
      </div>
    </div>
  );

  const renderEmptyState = () => {
    if (activeQuery) {
      return (
        <div className="p-16 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 max-w-md mx-auto space-y-2">
          <Search className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-600 dark:text-slate-300 text-xs">
            No files match “{activeQuery}”
          </p>
          <button
            onClick={clearSearch}
            className="text-[11px] font-bold text-slate-900 dark:text-slate-100 hover:underline"
          >
            Clear search
          </button>
        </div>
      );
    }

    return (
      <div className="p-16 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-900/40 flex flex-col items-center justify-center max-w-md mx-auto space-y-2">
        <Cloud className="w-6 h-6 text-slate-300 dark:text-slate-600" />
        <p className="font-semibold text-slate-600 dark:text-slate-300 text-xs">
          {currentFolder ? `“${currentFolder.name}” is empty` : "No files yet"}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal leading-relaxed text-center">
          Drag &amp; drop files anywhere on this panel, or use the Upload
          button.
        </p>
      </div>
    );
  };

  // ── Error state ──
  if (status === "error") {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#0b0d12] px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Couldn’t load your workspace
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
          {loadError}
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => {
              setStatus("loading");
              setLoadError("");
              loadAll();
            }}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (status === "loading" || !user) {
    return (
      <div className="h-screen w-screen flex flex-col bg-[#fafafa] dark:bg-[#0b0d12] font-sans overflow-hidden">
        {/* top bar */}
        <div className="h-14 border-b border-slate-200/70 dark:border-slate-800 flex items-center px-6 gap-4">
          <div className="w-52 h-8 rounded-lg bg-slate-200/70 dark:bg-slate-800 skeleton" />
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-slate-800 skeleton" />
        </div>

        <div className="flex-1 overflow-hidden p-6 sm:p-8 space-y-8">
          {renderSkeleton()}
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium animate-pulse text-center">
            Loading your files…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#fafafa] dark:bg-[#0b0d12] text-slate-900 dark:text-slate-100 font-sans antialiased overflow-hidden select-none">
      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-overlay-in"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`${sidebarOpen ? "flex" : "hidden"} md:flex fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#10131a] border-r border-slate-200/80 dark:border-slate-800 flex-col justify-between p-6 flex-shrink-0 transition-transform`}
      >
        <div className="space-y-7">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                setCurrentFolder(null);
                setSidebarOpen(false);
              }}
            >
              <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-white flex items-center justify-center">
                <Cloud className="w-3.5 h-3.5 text-white dark:text-slate-900" />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                storeItNow
              </span>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => {
                setCurrentFolder(null);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                !currentFolder
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> My Storage
            </button>

            <button
              onClick={() => {
                setCurrentFolder(null);
                setSidebarOpen(false);
                clearSearch();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            >
              <FolderOpen className="w-4 h-4" /> All files
            </button>

            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
              onClick={() => navigate("/profile")}
            >
              <Shield className="w-4 h-4" /> Account Settings
            </button>
          </nav>

          {/* Storage widget */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <HardDrive className="w-3 h-3" /> Storage
              </span>
              <span
                className={`text-[10px] font-bold ${storageTone.text}`}
              >
                {storagePercent}%
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${storageTone.bar} transition-all duration-500`}
                style={{ width: `${storagePercent}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {formatBytes(used)} of {formatBytes(total)}
            </p>
          </div>
        </div>

        {/* User + logout */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/70 rounded-xl cursor-pointer transition-all border border-transparent flex-1 min-w-0"
            >
              <div className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center bg-slate-800 dark:bg-slate-700 overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user.name}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <ThemeToggle className="ml-2 shrink-0" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main
        className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#10131a] md:my-2 md:mr-2 md:rounded-2xl md:border md:border-slate-200/80 dark:md:border-slate-800 relative"
        onDragEnter={handleDragEnter}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag & drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-40 m-3 rounded-2xl border-2 border-dashed border-slate-900 dark:border-white bg-slate-900/5 dark:bg-white/5 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 pointer-events-none animate-overlay-in">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg">
              <Upload className="w-6 h-6 text-slate-900 dark:text-slate-100" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Drop files to upload
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {currentFolder
                ? `Goes into “${currentFolder.name}”`
                : "Goes into your root storage"}
            </p>
          </div>
        )}

        {/* Upload progress bar */}
        {uploadState && (
          <div className="absolute top-0 inset-x-0 z-30 px-6 py-3 bg-white/95 dark:bg-[#10131a]/95 border-b border-slate-100 dark:border-slate-800 backdrop-blur">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-2 truncate">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading {uploadState.name}
                {uploadState.total > 1 && (
                  <span className="text-slate-400">
                    ({uploadState.index}/{uploadState.total})
                  </span>
                )}
              </span>
              <span className="font-mono">{uploadState.percent}%</span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 dark:bg-white transition-all duration-200"
                style={{ width: `${uploadState.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* TOP BAR */}
        <header className="h-14 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative w-44 sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search files…   Ctrl K"
                value={search}
                onChange={handleSearchChange}
                className="w-full bg-slate-50 dark:bg-slate-900 text-xs px-3 py-2 rounded-lg outline-none focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-slate-200 dark:focus:border-slate-700 transition-all font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 pl-8 pr-8"
              />
              {search && (
                <button
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            <ThemeToggle className="md:hidden" />

            <button
              onClick={() => setShowNotifications((s) => !s)}
              aria-label="Notifications"
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-rose-600 rounded-full border-2 border-white dark:border-[#10131a] text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-11 w-80 bg-white dark:bg-[#161a23] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Activity
                  </div>
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-5 text-center">
                      <Bell className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Uploads, deletes and folder activity show up here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 flex items-start gap-3 border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            n.unread ? "bg-rose-500" : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {n.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {n.body}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {timeAgo(n.at)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* HERO */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-50 to-white/60 dark:from-slate-900/70 dark:to-slate-900/20 p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Welcome back, {user?.name || "User"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isFull
                  ? "Storage is full — free up space to keep uploading."
                  : "Quick glance at your storage and recent activity"}
              </p>

              <div className="mt-3 w-full max-w-md">
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${storageTone.bar} transition-all duration-500`}
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex flex-wrap items-center gap-x-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {formatBytes(used)}
                  </span>
                  <span>used of {formatBytes(total)}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className={storageTone.text}>{storagePercent}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                className={`flex items-center gap-2 transition-all duration-200 text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm cursor-pointer ${
                  isFull
                    ? "bg-slate-100 text-slate-400 dark:bg-slate-800 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
                title={isFull ? "Storage is full" : "Upload files"}
              >
                {uploadState ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploadState ? "Uploading…" : "Upload"}
                <input
                  type="file"
                  multiple
                  disabled={isFull}
                  onChange={(e) => {
                    handleUpload(e.target.files);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* METRICS */}
          {!currentFolder && !activeQuery && (
            <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between h-28">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" />{" "}
                  Storage Capacity
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {formatBytes(used)} / {formatBytes(total)}
                  </h3>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${storageTone.bar} transition-all duration-500`}
                      style={{ width: `${storagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between h-28 bg-white dark:bg-slate-900/60">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Images
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {imagesCount}
                  </h3>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                  <Image className="w-4 h-4" />
                </div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between h-28 bg-white dark:bg-slate-900/60">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Videos
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {videosCount}
                  </h3>
                </div>
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Video className="w-4 h-4" />
                </div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between h-28 bg-white dark:bg-slate-900/60">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Documents
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {documentsCount}
                  </h3>
                </div>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
            </section>
          )}

          {/* BREADCRUMB + CONTROLS */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <button
                onClick={() => {
                  setCurrentFolder(null);
                  clearSearch();
                }}
                className="text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" /> root
              </button>

              {activeQuery && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                  <span className="text-slate-900 dark:text-slate-100 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                    Search: {activeQuery}
                  </span>
                </>
              )}

              {!activeQuery && currentFolder && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                  <span className="text-slate-900 dark:text-slate-100 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                    {currentFolder.name}
                  </span>
                  <button
                    onClick={() => setCurrentFolder(null)}
                    className="ml-3 text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-0.5 uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-3 h-3" /> Exit
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <ArrowUpDown className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort files"
                  className="appearance-none bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 pl-7 pr-6 py-1.5 rounded-lg border border-transparent hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer outline-none transition-all"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-transparent">
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* FOLDERS */}
          {!currentFolder && !activeQuery && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-800 pb-1.5">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  Folders
                </span>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Create new folder…"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                    className="rounded-lg px-3 py-1.5 text-xs outline-none border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-1 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all w-44 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleCreateFolder}
                    disabled={!folderName.trim()}
                    className="text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create
                  </button>
                </div>
              </div>

              {folders.length === 0 ? (
                <div className="p-5 text-center border border-dashed dark:border-slate-700 rounded-xl text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/40">
                  No folders yet — create one to group your files.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5">
                  {folders.map((folder) => (
                    <div
                      key={folder._id}
                      onClick={() => {
                        setCurrentFolder({
                          _id: folder._id,
                          name: folder.name,
                        });
                        setActiveMenuId(null);
                        setSidebarOpen(false);
                      }}
                      className="border border-slate-100 dark:border-slate-800 p-3 rounded-xl bg-slate-50/30 dark:bg-slate-900/50 flex items-center gap-3 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer group shadow-sm"
                    >
                      <Folder className="w-4 h-4 text-amber-500 fill-amber-500/10 flex-shrink-0 group-hover:scale-105 transition-transform" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-slate-100">
                        {folder.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FILES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-1.5 gap-3">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {activeQuery
                  ? `${displayedFiles.length} result${displayedFiles.length === 1 ? "" : "s"}`
                  : `Files · ${displayedFiles.length}`}
              </span>

              {displayedFiles.length > 0 && (
                <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded accent-slate-900 dark:accent-white cursor-pointer"
                  />
                  Select all
                </label>
              )}
            </div>

            {displayedFiles.length === 0 ? (
              renderEmptyState()
            ) : viewMode === "list" ? (
              <div className="w-full border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/60 overflow-x-auto shadow-sm">
                <div className="min-w-[680px]">
                  <div className="grid grid-cols-12 pb-2.5 pt-3.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase px-4 border-b bg-slate-50 dark:bg-slate-800/50">
                    <div className="col-span-6">Name</div>
                    <div className="col-span-2 text-right">Size</div>
                    <div className="col-span-2 text-right">Added</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>

                  <div className="divide-y divide-slate-50 dark:divide-slate-800/70">
                    {displayedFiles.map((file) => {
                      const isSelected = selectedFiles.includes(file._id);
                      const isMenuOpen = activeMenuId === file._id;

                      return (
                        <div
                          key={file._id}
                          className={`grid grid-cols-12 items-center py-3 px-4 text-xs font-semibold transition-all cursor-pointer group relative ${
                            isSelected
                              ? "bg-slate-50 dark:bg-slate-800/60"
                              : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                          }`}
                          style={{
                            borderLeft: isSelected
                              ? "2px solid #0f172a"
                              : "2px solid transparent",
                          }}
                          onClick={() => toggleSelect(file._id)}
                        >
                          <div className="col-span-6 flex items-center gap-4 min-w-0 pr-4">
                            <div
                              className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                                isSelected
                                  ? "bg-slate-900 border-slate-900 dark:bg-white dark:border-white"
                                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              {isSelected && (
                                <CheckCircle2 className="w-2.5 h-2.5 text-white dark:text-slate-900 fill-white dark:fill-slate-900" />
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 min-w-0">
                              {file.fileType?.toLowerCase().includes("image") &&
                              file.url ? (
                                <img
                                  src={file.url}
                                  alt=""
                                  loading="lazy"
                                  className="w-6 h-6 object-cover rounded"
                                />
                              ) : (
                                getFileIcon(file.fileType)
                              )}
                              <span className="text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-slate-100 font-bold">
                                {file.fileName}
                              </span>
                            </div>
                          </div>

                          <div className="col-span-2 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {formatBytes(file.fileSize)}
                          </div>

                          <div className="col-span-2 text-right text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                            {formatDate(file.createdAt)}
                          </div>

                          <div
                            className="col-span-2 flex items-center justify-end gap-1.5 relative z-20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              title="Open / download"
                              className="p-1.5 border rounded-lg bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors border-slate-200 dark:border-slate-700"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() =>
                                setActiveMenuId(isMenuOpen ? null : file._id)
                              }
                              aria-label="More actions"
                              className={`p-1.5 border rounded-lg transition-colors ${
                                isMenuOpen
                                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                                  : "bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#161a23] border border-slate-200/60 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 flex flex-col text-left animate-rise">
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => setActiveMenuId(null)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs"
                                >
                                  <Download className="w-3.5 h-3.5" /> Open
                                </a>
                                <button
                                  onClick={() => setConfirmTarget(file)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold text-xs border-t border-slate-100 dark:border-slate-800"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {displayedFiles.map((file) => {
                  const isSelected = selectedFiles.includes(file._id);

                  return (
                    <div
                      key={file._id}
                      onClick={() => toggleSelect(file._id)}
                      className={`border rounded-xl p-4 flex flex-col justify-between bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 cursor-pointer relative transition-all h-40 shadow-sm group ${
                        isSelected
                          ? "bg-slate-50 dark:bg-slate-800/60 border-slate-900 dark:border-white ring-1 ring-slate-900/10 dark:ring-white/20"
                          : "hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center absolute top-3.5 left-3.5 transition-all ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 dark:bg-white dark:border-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 className="w-2.5 h-2.5 text-white dark:text-slate-900 fill-white dark:fill-slate-900" />
                        )}
                      </div>

                      <div className="flex justify-center items-center h-16 pt-1 group-hover:scale-105 transition-transform duration-200">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                          {file.fileType?.toLowerCase().includes("image") &&
                          file.url ? (
                            <img
                              src={file.url}
                              alt=""
                              loading="lazy"
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            getFileIcon(file.fileType)
                          )}
                        </div>
                      </div>

                      <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                        <p
                          className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate text-center group-hover:text-slate-900 dark:group-hover:text-slate-100 px-0.5"
                          title={file.fileName}
                        >
                          {file.fileName}
                        </p>

                        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-mono mt-0.5">
                          {formatBytes(file.fileSize)}
                        </p>

                        <div className="flex items-center justify-between text-[11px] mt-2 border-t pt-2 border-slate-100 dark:border-slate-800 px-0.5 font-semibold">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-900 dark:text-slate-100 hover:underline"
                          >
                            Open
                          </a>
                          <button
                            onClick={() => setConfirmTarget(file)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BULK ACTION BAR */}
        {selectedFiles.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl animate-rise">
            <span className="text-xs font-bold whitespace-nowrap">
              {selectedFiles.length} selected
            </span>

            <span className="w-px h-4 bg-white/20 dark:bg-slate-900/20" />

            <button
              onClick={() => setConfirmTarget("selected")}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-300 dark:text-rose-600 hover:text-white dark:hover:text-rose-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>

            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs font-semibold opacity-70 hover:opacity-100 transition-opacity"
            >
              Clear
            </button>
          </div>
        )}
      </main>

      {/* DELETE CONFIRMATION */}
      {confirmTarget && (
        <div className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-overlay-in">
          <div className="bg-white dark:bg-[#161a23] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-rise">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {confirmTarget === "selected"
                  ? `Delete ${selectedFiles.length} files?`
                  : "Delete this file?"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {confirmTarget === "selected"
                  ? "All selected files are removed permanently from cloud storage."
                  : `“${confirmTarget.fileName}” will be removed permanently from cloud storage.`}
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 text-xs font-bold px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={performDelete}
                className="flex-1 text-xs font-bold px-4 py-2.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
