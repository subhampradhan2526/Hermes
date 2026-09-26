"use client";

import { useState, useEffect } from "react";
import { Video, PlayCircle, BarChart3, Clock, AlertCircle, TrendingUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Match {
  id: string;
  title: string;
  team_a_name: string;
  team_b_name: string;
  status: string;
  created_at: string;
  players_count?: number;
  events_count?: number;
  latest_job_status?: string;
  latest_job_progress?: number;
}

export default function DashboardPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1/matches/`);
      setMatches(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching matches", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    // Poll every 5s to pick up status changes
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  const completed = matches.filter(m => m.status === "completed").length;
  const analyzing = matches.filter(m => m.status === "analyzing" || m.status === "processing").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Football AI Analytics Platform — YOLOv8 + ByteTrack + SigLIP Pipeline
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 border border-border/50">
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Total Matches</span>
            <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-white">{matches.length}</span>
            <span className="text-emerald-400 text-xs font-semibold ml-2 inline-flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />{completed} complete
            </span>
          </div>
          <p className="text-muted-foreground text-[11px]">Uploaded for CV inference</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 border border-border/50">
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Currently Analyzing</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-amber-400">{analyzing}</span>
            {analyzing > 0 && (
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 ml-2 animate-pulse" />
            )}
          </div>
          <p className="text-muted-foreground text-[11px]">Active ML pipeline jobs</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 border border-border/50">
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Frames Processed</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-white">
              {matches.reduce((acc, m) => acc + (m.players_count || 0) * 25, 0).toLocaleString() || "0"}
            </span>
          </div>
          <p className="text-muted-foreground text-[11px]">Estimated detection frames</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 border border-border/50">
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Analytics</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-white">
              {matches.reduce((acc, m) => acc + (m.events_count || 0), 0)}
            </span>
          </div>
          <p className="text-muted-foreground text-[11px]">Total events detected</p>
        </div>
      </div>

      {/* Recent Matches Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-border/50 shadow-xl">
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-card/30">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Analyses</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Click any match to view CV analytics</p>
          </div>
          <Link href="/dashboard/matches" className="text-xs text-primary hover:text-primary/80 font-semibold underline underline-offset-2">
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b border-white/5">
              <tr>
                <th className="px-6 py-3 font-semibold">Match</th>
                <th className="px-6 py-3 font-semibold">Teams</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="font-mono text-sm">Loading AI pipeline data...</span>
                    </div>
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 text-primary/40" />
                    <p className="text-muted-foreground font-medium">No matches yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use <strong className="text-white">Upload & Analyze</strong> in the sidebar to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                matches.slice(0, 10).map((match) => (
                  <tr key={match.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                          <Video className="w-4 h-4" />
                        </div>
                        <span className="group-hover:text-primary transition-colors">{match.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                      {match.team_a_name} vs {match.team_b_name}
                    </td>
                    <td className="px-6 py-4">
                      {match.status === "completed" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          ✓ Complete
                        </span>
                      ) : match.status === "analyzing" || match.status === "processing" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          {match.latest_job_progress || 0}% analyzing
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 text-muted-foreground border border-white/10">
                          {match.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                      {new Date(match.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/matches/${match.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold border border-primary/25"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        View Analytics
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
