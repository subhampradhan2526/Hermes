"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Play,
  Pause,
  ArrowLeft,
  Activity,
  Users,
  Video as VideoIcon,
  Zap,
  Flame,
  Shield,
  Clock,
  RotateCcw,
  Sparkles,
  Download
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface MatchDetail {
  id: string;
  title: string;
  team_a_name: string;
  team_b_name: string;
  team_a_color: string;
  team_b_color: string;
  score_a?: number;
  score_b?: number;
  date?: string;
  venue?: string;
  status: string;
  video_url?: string;
  video_duration?: number;
  video_fps?: number;
  players_count?: number;
  events_count?: number;
  latest_job_status?: string;
  latest_job_progress?: number;
  statistics_summary?: any;
}

interface PlayerItem {
  id: string;
  tracker_id: number;
  team_id: number;
  name: string;
  jersey_number: string;
  position: string;
  is_goalkeeper: boolean;
  statistics?: {
    distance_covered_m: number;
    top_speed_kmh: number;
    avg_speed_kmh: number;
    sprints_count: number;
    stats_json?: any;
  };
}

interface EventItem {
  id: string;
  timestamp_seconds: number;
  frame_idx: number;
  event_type: string;
  tracker_id?: number;
  team_id?: number;
  confidence: number;
  details?: any;
}

interface RadarFrame {
  frame_idx: number;
  timestamp_seconds: number;
  radar_points: Array<{ x: number; y: number; team_id: number; tracker_id: number }>;
  ball?: { pitch_x?: number; pitch_y?: number; x: number; y: number } | null;
  in_possession_team?: number | null;
}

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"players" | "events" | "tactics">("players");

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMatchData = async () => {
    try {
      const [mRes, pRes, eRes, rRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/v1/matches/${matchId}`),
        axios.get(`${API_BASE}/api/v1/matches/${matchId}/players`),
        axios.get(`${API_BASE}/api/v1/matches/${matchId}/events`),
        axios.get(`${API_BASE}/api/v1/matches/${matchId}/radar`),
      ]);

      if (mRes.status === "fulfilled") {
        setMatch(mRes.value.data);
        if (mRes.value.data.status === "completed" && intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      if (pRes.status === "fulfilled") setPlayers(pRes.value.data);
      if (eRes.status === "fulfilled") setEvents(eRes.value.data);
      if (rRes.status === "fulfilled") setRadarFrames(rRes.value.data);
    } catch (err) {
      console.error("Failed to fetch match details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchData();
    intervalRef.current = setInterval(fetchMatchData, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [matchId]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!isPlaying) {
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn("Video play failed:", err);
            setIsPlaying(false);
          });
      } else {
        setIsPlaying(true);
      }
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Find nearest radar frame for current playback timestamp
  const currentRadarFrame = radarFrames.length > 0
    ? radarFrames.reduce((prev, curr) =>
        Math.abs(curr.timestamp_seconds - currentTime) < Math.abs(prev.timestamp_seconds - currentTime) ? curr : prev
      )
    : null;

  const possessionA = match?.statistics_summary?.possession?.team_a_pct ?? 52.4;
  const possessionB = match?.statistics_summary?.possession?.team_b_pct ?? 47.6;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading && !match) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-sm">Loading Computer Vision Match Analytics...</p>
        </div>
      </div>
    );
  }

  const videoSource = match?.video_url
    ? (match.video_url.startsWith("http") ? match.video_url : `${API_BASE}${match.video_url}`)
    : null;

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-border/40 text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">{match?.title || "Match Analytics"}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                match?.status === "completed"
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : match?.status === "analyzing"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                  : "bg-primary/10 text-primary border-primary/30"
              }`}>
                {match?.status === "completed" ? "CV Analysis Complete" : match?.status === "analyzing" ? `Analyzing (${match.latest_job_progress || 0}%)` : "Ready"}
              </span>
            </div>
            <p className="text-muted-foreground text-xs flex items-center gap-3 mt-1">
              <span>{match?.venue || "Football Arena"}</span>
              <span>•</span>
              <span className="font-mono text-primary">{match?.team_a_name} vs {match?.team_b_name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 glass hover:bg-white/10 border border-border/60 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors text-white"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            Export Match Intelligence
          </button>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left 2 Cols: Video Stream + Key KPI Cards */}
        <div className="lg:col-span-2 flex flex-col gap-5 min-h-0">
          {/* Video Player Card */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-border/50 relative aspect-video flex-shrink-0 flex items-center justify-center bg-black/60 shadow-2xl">
            {videoSource ? (
              <video
                ref={videoRef}
                src={videoSource}
                className="w-full h-full object-contain"
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls={false}
                playsInline
                preload="metadata"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <VideoIcon className="w-14 h-14 opacity-30" />
                <p className="text-sm font-mono">No video feed stream available</p>
              </div>
            )}

            {/* AI Overlay Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[11px] font-mono font-medium text-white/90">YOLOv8 + ByteTrack + SigLIP</span>
            </div>

            {/* Custom Bottom Video Controller Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col gap-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.05"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex items-center justify-between text-xs text-white/90 font-mono">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        setCurrentTime(0);
                      }
                    }}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors text-muted-foreground hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">2D Homography Sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Metrics Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel rounded-xl p-4 border border-border/50 flex flex-col justify-between">
              <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Ball Possession</span>
              <div className="flex items-baseline justify-between mt-2">
                <div className="text-left">
                  <span className="text-xs text-pink-400 font-semibold block">{match?.team_a_name}</span>
                  <span className="text-2xl font-extrabold text-pink-500">{possessionA}%</span>
                </div>
                <span className="text-xs text-muted-foreground">vs</span>
                <div className="text-right">
                  <span className="text-xs text-sky-400 font-semibold block">{match?.team_b_name}</span>
                  <span className="text-2xl font-extrabold text-sky-400">{possessionB}%</span>
                </div>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3 flex">
                <div className="bg-pink-500 h-full" style={{ width: `${possessionA}%` }} />
                <div className="bg-sky-400 h-full" style={{ width: `${possessionB}%` }} />
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4 border border-border/50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Tracked Entities</span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-white">{players.length || match?.players_count || 22}</span>
                <span className="text-xs text-muted-foreground ml-2">Players & Referees</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> SigLIP Jersey Clustered
              </p>
            </div>

            <div className="glass-panel rounded-xl p-4 border border-border/50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Max Player Speed</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-amber-400">
                  {players.length > 0 ? Math.max(...players.map(p => p.statistics?.top_speed_kmh || 0)).toFixed(1) : "29.4"}
                </span>
                <span className="text-xs text-muted-foreground ml-1">km/h</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Real-time Homography Speed
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Tactical Radar + Tabbed Intelligence Panel */}
        <div className="flex flex-col gap-5 h-full min-h-0">
          {/* Tactical 2D Pitch Radar Canvas */}
          <div className="glass-panel rounded-2xl p-4 border border-border/50 flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider flex items-center gap-2 text-white">
                <Activity className="w-4 h-4 text-primary" />
                Tactical Radar (Homography)
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live 2D Projection
              </span>
            </div>

            {/* Pitch SVG Map */}
            <div className="aspect-[105/68] w-full bg-emerald-950/40 border border-emerald-500/30 rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner">
              {/* Pitch Markings */}
              <div className="absolute inset-2 border border-emerald-400/30 rounded" />
              <div className="absolute top-2 bottom-2 left-1/2 w-0 border-l border-emerald-400/30" />
              <div className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 border border-emerald-400/30 rounded-full" />
              {/* Penalty boxes */}
              <div className="absolute top-1/4 bottom-1/4 left-2 w-8 border border-emerald-400/30" />
              <div className="absolute top-1/4 bottom-1/4 right-2 w-8 border border-emerald-400/30" />

              {/* Dynamic Radar Points */}
              {currentRadarFrame?.radar_points?.map((pt, idx) => {
                const isTeamA = pt.team_id === 0;
                const isTeamB = pt.team_id === 1;
                const isRef = pt.team_id === 2 || pt.team_id === 3;
                const colorClass = isTeamA ? "bg-pink-500 shadow-[0_0_8px_#ec4899]" : isTeamB ? "bg-sky-400 shadow-[0_0_8px_#38bdf8]" : "bg-amber-300";

                return (
                  <div
                    key={idx}
                    className={`absolute w-2.5 h-2.5 rounded-full ${colorClass} transition-all duration-100 -translate-x-1/2 -translate-y-1/2`}
                    style={{
                      left: `${Math.max(4, Math.min(96, pt.x * 100))}%`,
                      top: `${Math.max(4, Math.min(96, pt.y * 100))}%`,
                    }}
                    title={`#${pt.tracker_id} (${isTeamA ? match?.team_a_name : match?.team_b_name})`}
                  />
                );
              })}

              {/* Ball Position */}
              {currentRadarFrame?.ball && currentRadarFrame.ball.pitch_x !== null && currentRadarFrame.ball.pitch_x !== undefined && (
                <div
                  className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${Math.max(4, Math.min(96, (currentRadarFrame.ball.pitch_x || 0.5) * 100))}%`,
                    top: `${Math.max(4, Math.min(96, (currentRadarFrame.ball.pitch_y || 0.5) * 100))}%`,
                  }}
                  title="Football"
                />
              )}
            </div>

            {/* Radar Legend */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3 pt-2 border-t border-white/5 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
                <span>{match?.team_a_name || "Team A"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                <span>{match?.team_b_name || "Team B"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white inline-block shadow-[0_0_5px_white]" />
                <span>Ball</span>
              </div>
            </div>
          </div>

          {/* Bottom Tabs Panel */}
          <div className="glass-panel rounded-2xl p-4 border border-border/50 flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-3 shrink-0">
              <button
                onClick={() => setActiveTab("players")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "players"
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Tracked Players ({players.length})
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "events"
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Events ({events.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
              {activeTab === "players" ? (
                players.length > 0 ? (
                  players.map((p) => {
                    const isTeamA = p.team_id === 0;
                    return (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-white/[0.06] transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isTeamA ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          }`}>
                            #{p.tracker_id}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-white block">{p.name || `Player #${p.tracker_id}`}</span>
                            <span className="text-[10px] text-muted-foreground">{isTeamA ? match?.team_a_name : match?.team_b_name} • {p.position}</span>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-xs font-bold text-amber-400 block">{p.statistics?.top_speed_kmh?.toFixed(1) || "0.0"} km/h</span>
                          <span className="text-[10px] text-muted-foreground">{p.statistics?.distance_covered_m?.toFixed(0) || "0"} m covered</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-xs font-mono">
                    Player statistics will populate once the CV analysis reaches 100%
                  </div>
                )
              ) : (
                events.length > 0 ? (
                  events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3 text-xs"
                    >
                      <span className="font-mono text-primary font-semibold text-[11px] bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shrink-0">
                        {formatTime(ev.timestamp_seconds)}
                      </span>
                      <div className="flex-1">
                        <span className="font-semibold text-white block">{ev.event_type}</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {ev.details?.speed_kmh ? `Recorded top velocity: ${ev.details.speed_kmh} km/h` : "Tactical phase logged by computer vision engine"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-xs font-mono">
                    No tactical events detected yet
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
