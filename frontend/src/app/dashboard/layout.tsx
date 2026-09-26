"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Video, BarChart2, Settings, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const navLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/matches", label: "Matches", icon: Video, exact: false },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isActive = (link: { href: string; exact: boolean }) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/") || file.name.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/);
    if (!isVideo) {
      setUploadStatus("error");
      setUploadMessage("Please select a valid video file (.mp4, .mov, .avi, .mkv, .webm)");
      setIsUploading(true);
      setTimeout(() => setIsUploading(false), 4000);
      return;
    }

    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);
    setUploadMessage(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append("file", file);

    // Create a Blob with explicit type to ensure correct MIME
    const blob = new Blob([await file.arrayBuffer()], { type: "video/mp4" });
    const correctedFormData = new FormData();
    correctedFormData.append("file", blob, file.name);

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev >= 85 ? prev : prev + 8));
      }, 400);

      const uploadRes = await axios.post(`${API_BASE}/api/v1/videos/`, correctedFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressTimer);
      setUploadProgress(95);

      const videoId = uploadRes.data.id;
      const videoName = file.name.replace(/\.[^/.]+$/, "");

      // Create match
      const matchRes = await axios.post(`${API_BASE}/api/v1/matches/`, {
        title: videoName,
        video_id: videoId,
        team_a_name: "Team A",
        team_b_name: "Team B",
      });

      // Trigger analysis
      await axios.post(`${API_BASE}/api/v1/analysis/`, {
        match_id: matchRes.data.id,
        video_id: videoId,
        model_name: "existing_pipeline",
        mode: "RADAR",
      });

      setUploadProgress(100);
      setUploadStatus("success");
      setUploadMessage(`${file.name} uploaded! Analysis started.`);

      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus("idle");
        router.push(`/dashboard/matches/${matchRes.data.id}`);
      }, 2000);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setUploadStatus("error");
      setUploadMessage(err.response?.data?.detail || "Upload failed. Please try again.");
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus("idle");
      }, 5000);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border glass-panel flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="text-primary w-6 h-6" />
            <span className="font-bold tracking-tight">
              Footy<span className="text-primary">Vision</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all text-sm ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/25 shadow-sm shadow-primary/10"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Upload Button in Sidebar */}
        <div className="px-4 pb-6 space-y-3">
          <input
            type="file"
            accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            onClick={handleUploadClick}
            disabled={uploadStatus === "uploading"}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {uploadStatus === "uploading" ? "Uploading..." : "Upload & Analyze"}
          </button>

          {/* Upload Progress Toast */}
          {isUploading && (
            <div className="glass-panel p-3 rounded-xl border border-border/50 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white truncate max-w-[160px]">
                  {uploadStatus === "uploading" ? "Processing..." : uploadStatus === "success" ? "✓ Done!" : "✗ Error"}
                </span>
                <button onClick={() => { setIsUploading(false); setUploadStatus("idle"); }}>
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-white" />
                </button>
              </div>
              {uploadStatus === "uploading" && (
                <div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground mt-1">{uploadProgress}%</p>
                </div>
              )}
              {uploadStatus === "success" && (
                <p className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {uploadMessage}
                </p>
              )}
              {uploadStatus === "error" && (
                <p className="text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {uploadMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border/50 glass z-10 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold hidden sm:block">
              {navLinks.find((l) => isActive(l))?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile Upload Button */}
            <button
              onClick={handleUploadClick}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary font-semibold text-sm">
              AI
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
