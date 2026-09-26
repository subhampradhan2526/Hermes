"use client";

import { useState, useEffect } from "react";
import { Video, AlertCircle, PlayCircle, Clock } from "lucide-react";
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
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1/matches/`);
      setMatches(res.data);
    } catch (error) {
      console.error("Error fetching matches", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">All Analyzed Matches</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View detailed match analytics, player tracking velocities, and radar homography projections.
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-border/50 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Match Intelligence</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Tracked Entities</th>
                <th className="px-6 py-4 font-semibold">Date Added</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && matches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading match repository...
                    </div>
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-primary" />
                    No match analyses found. Upload a match video to begin CV inference.
                  </td>
                </tr>
              ) : (
                matches.map((match) => (
                  <tr key={match.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-white font-bold block">{match.title}</span>
                        <span className="text-xs text-muted-foreground font-mono">{match.team_a_name} vs {match.team_b_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {match.status === "completed" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Complete
                        </span>
                      ) : match.status === "analyzing" || match.status === "processing" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                          <Clock className="w-3 h-3 mr-1" />
                          Processing
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-muted-foreground border border-white/10">
                          {match.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {match.players_count || 22} Players • {match.events_count || 0} Events
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                      {new Date(match.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/matches/${match.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold border border-primary/20"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Analyze Match
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
