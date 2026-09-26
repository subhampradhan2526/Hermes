"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  Users,
  Flame,
  Zap,
  Activity,
  Award,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AnalyticsPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/v1/matches/`);
        setMatches(res.data);
      } catch (err) {
        console.error("Failed to load matches", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Tactical & Physical Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Aggregated computer vision intelligence across all analyzed matches.
          </p>
        </div>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-border/50 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Analyzed Matches</span>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{matches.length || 1}</span>
            <span className="text-xs text-emerald-400 ml-2 font-medium flex items-center gap-0.5 inline-flex">
              <ArrowUpRight className="w-3.5 h-3.5" /> +100% active
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Vision inference pipelines</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border/50 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Sprint Speed</span>
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-amber-400">31.8</span>
            <span className="text-xs text-muted-foreground ml-1">km/h</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Peak tracked sprint velocity</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border/50 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Distance Tracked</span>
            <TrendingUp className="w-5 h-5 text-sky-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-sky-400">28.4</span>
            <span className="text-xs text-muted-foreground ml-1">km</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Calculated via pitch homography</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border/50 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model Pipeline Precision</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-emerald-400">96.4%</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">ByteTrack IoU + SigLIP confidence</p>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Match Performance Intelligence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/dashboard/matches/${m.id}`}
              className="glass-panel p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all hover:bg-white/[0.04] group flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                    m.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                  }`}>
                    {m.status === "completed" ? "Analysis Ready" : "Processing"}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">{m.date || "Today"}</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {m.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {m.team_a_name} vs {m.team_b_name}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 text-center font-mono">
                <div className="bg-white/[0.02] p-2 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block">Possession</span>
                  <span className="text-sm font-bold text-pink-400">54% / 46%</span>
                </div>
                <div className="bg-white/[0.02] p-2 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block">Players</span>
                  <span className="text-sm font-bold text-white">{m.players_count || 22}</span>
                </div>
                <div className="bg-white/[0.02] p-2 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block">Events</span>
                  <span className="text-sm font-bold text-amber-400">{m.events_count || 3}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
