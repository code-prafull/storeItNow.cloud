import { useEffect, useState } from "react";
import { getProfile } from "../api/userApi";
import { getFolders, createFolder } from "../api/folderApi";
import {
  uploadFile,
  getMyFiles,
  deleteFile,
  searchFiles,
} from "../api/fileApi";
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
  FolderPlus,
  Upload,
  ArrowLeft,
  Plus,
} from "lucide-react";

function Dashboard() {
  // ── TERA ORIGINAL STATE MANAGEMENT ──
  const [user, setUser] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Modern UI supporting states (from previous steps)
  const [viewMode, setViewMode] = useState("grid");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // ── TERA ORIGINAL CREATE FOLDER LOGIC ──
  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    try {
      const data = await createFolder(folderName);
      setFolders([...folders, data.folder]);
      setFolderName("");
    } catch (error) {
      console.log(error);
    }
  };

  // ── TERA ORIGINAL FILE UPLOAD LOGIC ──
  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const data = await uploadFile(file, currentFolder?._id);
      // If API returned the stored file, append it; otherwise refetch list
      if (data?.file) {
        setFiles((prev) => [data.file, ...prev]);
      } else {
        const fileData = await getMyFiles();
        setFiles(fileData.files);
      }

      // refresh user profile (storage used) after upload
      try {
        const profileData = await getProfile();
        setUser(profileData.user);
      } catch (err) {
        // ignore
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ── TERA ORIGINAL DELETE LOGIC ──
  const handleDelete = async (id) => {
    try {
      await deleteFile(id);
      setFiles(files.filter((file) => file._id !== id));
      setSelectedFiles(selectedFiles.filter((fileId) => fileId !== id));
      setActiveMenuId(null);
    } catch (error) {
      console.log(error);
    }
  };

  // ── TERA ORIGINAL SEARCH LOGIC ──
  const handleSearch = async () => {
    try {
      const data = await searchFiles(search);
      setFiles(data.files);
    } catch (error) {
      console.log(error);
    }
  };

  // ── TERA ORIGINAL LOGOUT LOGIC ──
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ── TERA ORIGINAL EFFECT DATA FETCH LOGIC ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getProfile();
        setUser(profileData.user);

        const folderData = await getFolders();
        setFolders(folderData.folders);
      } catch (error) {
        console.log(error);
      }

      const fileData = await getMyFiles();
      setFiles(fileData.files);
    };

    fetchData();
  }, []);

  // Dev preview fallback: show a demo user and sample folders/files when backend auth isn't present
  // This helps visual design during local development only.
  useEffect(() => {
    const hasToken = !!localStorage.getItem("token");
    if (import.meta.env.DEV && !hasToken && !user) {
      setUser({
        name: "Aftab Khan",
        email: "aftab@demo.local",
        storageUsed: "1.2",
        maxStorage: "5",
      });
      if (folders.length === 0) {
        setFolders([
          { _id: "f1", name: "Projects" },
          { _id: "f2", name: "Receipts" },
          { _id: "f3", name: "Photos" },
        ]);
      }
      if (files.length === 0) {
        setFiles([
          {
            _id: "file1",
            fileName: "proposal.pdf",
            fileType: "application/pdf",
            url: "#",
          },
          {
            _id: "file2",
            fileName: "screenshot.png",
            fileType: "image/png",
            url: "#",
          },
        ]);
      }
    }
  }, []);

  // sample notifications for dev/preview
  useEffect(() => {
    if (import.meta.env.DEV) {
      setNotifications([
        {
          id: "n1",
          title: "Upload complete",
          body: "screenshot.png uploaded",
          unread: true,
          time: "2m",
        },
        {
          id: "n2",
          title: "Folder created",
          body: "Projects folder created",
          unread: true,
          time: "1h",
        },
        {
          id: "n3",
          title: "Password changed",
          body: "Your password was updated",
          unread: false,
          time: "1d",
        },
      ]);
    }
  }, []);

  const toggleNotifications = () => setShowNotifications((s) => !s);
  const markAsRead = (id) =>
    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  const markAllRead = () =>
    setNotifications((ns) => ns.map((n) => ({ ...n, unread: false })));

  const handleSelectFile = (id) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter((fileId) => fileId !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
    }
  };

  const getFileIcon = (type) => {
    const lowerType = type?.toLowerCase() || "";
    if (
      lowerType.includes("excel") ||
      lowerType.includes("sheet") ||
      lowerType.includes("xlsx")
    )
      return <FileText className="w-4 h-4 text-emerald-600" />;
    if (lowerType.includes("pdf"))
      return <FileText className="w-4 h-4 text-rose-600" />;
    if (lowerType.includes("video") || lowerType.includes("mp4"))
      return <Video className="w-4 h-4 text-indigo-600" />;
    if (
      lowerType.includes("image") ||
      lowerType.includes("png") ||
      lowerType.includes("jpg")
    )
      return <Image className="w-4 h-4 text-amber-600" />;
    return <File className="w-4 h-4 text-slate-600" />;
  };

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#fafafa] font-sans">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const storagePercent = Math.min(
    Math.round(
      (parseFloat(user.storageUsed) / parseFloat(user.maxStorage)) * 100,
    ) || 0,
    100,
  );

  const imagesCount = files.filter(
    (f) =>
      f.fileType?.toLowerCase().includes("image") ||
      f.fileType?.toLowerCase().includes("png"),
  ).length;
  const videosCount = files.filter(
    (f) =>
      f.fileType?.toLowerCase().includes("video") ||
      f.fileType?.toLowerCase().includes("mp4"),
  ).length;
  const documentsCount = files.filter(
    (f) =>
      f.fileType?.toLowerCase().includes("pdf") ||
      f.fileType?.toLowerCase().includes("excel") ||
      f.fileType?.toLowerCase().includes("xlsx"),
  ).length;

  const displayedFiles = files.filter((file) => {
    if (!currentFolder) return !file.folderId;
    return file.folderId === currentFolder._id;
  });

  return (
    <div className="flex h-screen w-screen bg-[#fafafa] text-slate-900 font-sans antialiased overflow-hidden select-none">
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-6 flex-shrink-0 hidden md:flex">
        <div className="space-y-7">
          {/* Logo Branding */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setCurrentFolder(null)}
          >
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
              <Cloud className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">
              storeItNow
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setCurrentFolder(null)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${!currentFolder ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <LayoutGrid className="w-4 h-4" /> My Storage
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
              onClick={() => navigate("/profile")}
            >
              <Shield className="w-4 h-4" /> Account Settings
            </button>
          </nav>
        </div>

        {/* User Identity & Logout */}
        <div className="space-y-4">
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-all border border-transparent"
          >
            <div className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center bg-slate-800">
              {user.name ?
                user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {user.name}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white md:my-2 md:mr-2 md:rounded-2xl md:border md:border-slate-200/80 md:shadow-2xs">
        {/* TOP COMPACT NAV BAR */}
        <header className="h-14 border-b border-slate-100 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="p-1.5 hover:bg-slate-50 rounded text-slate-500 md:hidden">
              <Menu className="w-4 h-4" />
            </button>
            <div className="relative w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full bg-slate-50 text-xs px-9 py-2 rounded-lg outline-none focus:bg-white border border-transparent focus:border-slate-200 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={toggleNotifications}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.some((n) => n.unread) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-3 top-12 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <div className="text-sm font-semibold">Notifications</div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <button
                      onClick={markAllRead}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Mark all read
                    </button>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ?
                    <div className="p-4 text-xs text-slate-500">
                      No notifications
                    </div>
                  : notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 flex items-start gap-3 hover:bg-slate-50 ${n.unread ? "bg-white" : "bg-white/80"}`}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1 ${n.unread ? "bg-rose-500" : "bg-slate-300"}`}
                        />
                        <div className="flex-1 text-xs">
                          <div className="font-semibold text-slate-900">
                            {n.title}
                          </div>
                          <div className="text-slate-500 mt-0.5">{n.body}</div>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {n.time}
                        </div>
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="ml-2 text-xs text-slate-400 hover:text-slate-600"
                        >
                          Read
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </header>

        {/* WORKSPACE VIEWPORT PANEL */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
          {/* HERO / TOP RIBBON - unique, modern visual */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-50 to-white/60 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome back, {user?.name || "User"}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Quick glance at your storage and recent activity
                </p>
                <div className="mt-3 w-full max-w-md">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full  from-emerald-500 to-emerald-400 transition-all"
                      style={{ width: `${storagePercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    {user?.storageUsed} GB used of {user?.maxStorage} GB —{" "}
                    {storagePercent}%
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 ">
              <label className="flex items-center gap-2 bg-green-300 hover:bg-green-500 transition-all duration-700 text-xs font-semibold px-4 py-2 rounded-lg border shadow-sm cursor-pointer">
                <Upload className="w-4 h-4 text-slate-700" /> Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* ── METRICS MODULE PANEL ── */}
          {!currentFolder && (
            <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* Storage Micro Box */}
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl flex flex-col justify-between h-28">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-slate-900" /> Storage
                  Capacity
                </span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-mono">
                    {user.storageUsed} / {user.maxStorage} GB
                  </h3>
                  <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-slate-900 transition-all duration-500"
                      style={{ width: `${storagePercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Images counter card */}
              <div className="border border-slate-100 p-5 rounded-xl flex items-center justify-between h-28 bg-white shadow-3xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Images
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-mono">
                    {imagesCount} Files
                  </h3>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                  <Image className="w-4 h-4" />
                </div>
              </div>

              {/* Videos counter card */}
              <div className="border border-slate-100 p-5 rounded-xl flex items-center justify-between h-28 bg-white shadow-3xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Videos
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-mono">
                    {videosCount} Files
                  </h3>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <Video className="w-4 h-4" />
                </div>
              </div>

              {/* Docs counter card */}
              <div className="border border-slate-100 p-5 rounded-xl flex items-center justify-between h-28 bg-white shadow-3xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Documents
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-mono">
                    {documentsCount} Files
                  </h3>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
            </section>
          )}

          {/* Directory Navigation Context Layout */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <button
                onClick={() => setCurrentFolder(null)}
                className="text-slate-900 hover:underline flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" /> root
              </button>
              {currentFolder && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {currentFolder.name}
                  </span>
                  <button
                    onClick={() => setCurrentFolder(null)}
                    className="ml-3 text-[10px] font-bold text-slate-400 hover:text-slate-900 flex items-center gap-0.5 uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-3 h-3" /> Exit
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 rounded-md transition-all ${viewMode === "list" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-400"}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-400"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── SUB-FOLDERS ROW ── */}
          {!currentFolder && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-1.5">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Folders
                </span>

                {/* Folder Build Component Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Create new folder..."
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                    className="rounded-lg px-3 py-1 text-xs outline-none border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition-all w-44 bg-slate-50 focus:bg-white font-medium text-slate-800"
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="text-white text-xs font-bold px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 transition-all flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create
                  </button>
                </div>
              </div>

              {folders.length === 0 ?
                <div className="p-4 text-center border border-dashed rounded-xl text-xs text-slate-400 bg-slate-50/50">
                  No folders configured.
                </div>
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5">
                  {folders.map((folder) => (
                    <div
                      key={folder._id}
                      onClick={() => {
                        setCurrentFolder({
                          _id: folder._id,
                          name: folder.name,
                        });
                        setActiveMenuId(null);
                      }}
                      className="border border-slate-100 p-3 rounded-xl bg-slate-50/30 flex items-center gap-3 hover:border-slate-300 hover:bg-white transition-all duration-200 cursor-pointer group shadow-3xs"
                    >
                      <Folder className="w-4 h-4 text-amber-500 fill-amber-500/10 flex-shrink-0 group-hover:scale-105 transition-transform" />
                      <span className="text-xs font-semibold text-slate-700 truncate group-hover:text-slate-900">
                        {folder.name}
                      </span>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ── FILES PRESENTATION SPACE CONTAINER ── */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-50 pb-1.5 block">
              Files Container
            </span>

            {displayedFiles.length === 0 ?
              <div className="p-16 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 bg-slate-50/30 flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                <Cloud className="w-6 h-6 text-slate-300" />
                <p className="font-semibold text-slate-500">Quadrant empty</p>
                <p className="text-[11px] text-slate-400 font-normal leading-normal text-center">
                  Synchronize a fresh asset node from the top control toolbar
                  panels.
                </p>
              </div>
            : viewMode === "list" ?
              /* List Row Render */
              <div className="w-full border border-slate-100 rounded-xl bg-white overflow-x-auto overflow-y-visible shadow-3xs">
                <div className="min-w-[650px]">
                  <div className="grid grid-cols-12 pb-2.5 pt-3.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase px-4 border-b bg-slate-50">
                    <div className="col-span-8 flex items-center gap-3">
                      Name
                    </div>
                    <div className="col-span-4 text-right">Actions</div>
                  </div>

                  <div className="divide-y divide-slate-50 overflow-y-visible">
                    {displayedFiles.map((file) => {
                      const isSelected = selectedFiles.includes(file._id);
                      const isMenuOpen = activeMenuId === file._id;

                      return (
                        <div
                          key={file._id}
                          className={`grid grid-cols-12 items-center py-3 px-4 text-xs font-semibold transition-all cursor-pointer group relative ${isSelected ? "bg-slate-50" : "hover:bg-slate-50/50"}`}
                          style={{
                            borderLeft:
                              isSelected ? "2px solid #0f172a" : (
                                "2px solid transparent"
                              ),
                          }}
                          onClick={() => handleSelectFile(file._id)}
                        >
                          <div className="col-span-8 flex items-center gap-4 min-w-0 pr-4">
                            <div
                              className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all ${isSelected ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white opacity-0 group-hover:opacity-100"}`}
                            >
                              {isSelected && (
                                <CheckCircle2 className="w-2.5 h-2.5 text-white fill-white" />
                              )}
                            </div>
                            <div className="flex items-center gap-2.5 min-w-0">
                              {(
                                file.fileType
                                  ?.toLowerCase()
                                  .includes("image") && file.url
                              ) ?
                                <img
                                  src={file.url}
                                  alt={file.fileName}
                                  className="w-6 h-6 object-cover rounded"
                                />
                              : getFileIcon(file.fileType)}
                              <span className="text-slate-700 truncate group-hover:text-slate-900 font-bold">
                                {file.fileName}
                              </span>
                            </div>
                          </div>

                          {/* Options Context Menu */}
                          <div
                            className="col-span-4 flex items-center justify-end gap-1.5 relative z-20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                setActiveMenuId(isMenuOpen ? null : file._id)
                              }
                              className={`p-1.5 border rounded-lg shadow-3xs transition-colors ${isMenuOpen ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-900"}`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200/60 rounded-xl shadow-xl z-50 py-1 flex flex-col text-left animate-fadeIn">
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => setActiveMenuId(null)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-900 hover:bg-slate-50 font-bold text-xs"
                                >
                                  <Download className="w-3.5 h-3.5" /> View /
                                  Fetch
                                </a>
                                <button
                                  onClick={() => handleDelete(file._id)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 font-bold text-xs border-t"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Purge
                                  Object
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
            : /* Bento Minimalist Grid Matrix Layout */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {displayedFiles.map((file) => {
                  const isSelected = selectedFiles.includes(file._id);
                  return (
                    <div
                      key={file._id}
                      onClick={() => handleSelectFile(file._id)}
                      className={`border rounded-xl p-4 flex flex-col justify-between bg-white border-slate-100 cursor-pointer relative transition-all h-36 shadow-3xs group ${isSelected ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900/5" : "hover:border-slate-300"}`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center absolute top-3.5 left-3.5 transition-all ${isSelected ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white opacity-0 group-hover:opacity-100"}`}
                      >
                        {isSelected && (
                          <CheckCircle2 className="w-2.5 h-2.5 text-white fill-white" />
                        )}
                      </div>

                      <div className="flex justify-center items-center h-16 pt-1 group-hover:scale-105 transition-transform duration-200">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl shadow-3xs">
                          {(
                            file.fileType?.toLowerCase().includes("image") &&
                            file.url
                          ) ?
                            <img
                              src={file.url}
                              alt={file.fileName}
                              className="w-12 h-12 object-cover rounded"
                            />
                          : getFileIcon(file.fileType)}
                        </div>
                      </div>

                      <div
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-xs font-bold text-slate-700 truncate text-center group-hover:text-slate-900 px-0.5">
                          {file.fileName}
                        </p>
                        <div className="flex items-center justify-between text-[11px] mt-2 border-t pt-2 border-slate-100 px-0.5 font-semibold">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-900 hover:underline"
                          >
                            Open
                          </a>
                          <button
                            onClick={() => handleDelete(file._id)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.12s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.04); border-radius: 99px; }
      `}</style>
    </div>
  );
}

export default Dashboard;
