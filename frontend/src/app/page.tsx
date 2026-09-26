import Link from "next/link";
import { Activity, Play, BarChart3, Crosshair, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="absolute top-0 w-full z-10 py-6 px-8 flex justify-between items-center glass">
        <div className="flex items-center gap-2">
          <Activity className="text-primary w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">Footy<span className="text-primary">Vision</span> AI</span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/dashboard/matches" className="hover:text-primary transition-colors">Matches</Link>
          <Link href="/dashboard" className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary hover:text-white transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            Launch App
          </Link>
        </nav>
      </header>

      {/* Main Hero */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 z-10 pt-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-8 uppercase tracking-widest animate-pulse">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          MPS Acceleration Active
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Football Analytics</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
          Production-grade computer vision pipeline tracking players, ball, and pitch geometry in real-time. Uncover the tactical insights hidden in every frame.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/dashboard" className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_40px_rgba(14,165,233,0.6)]">
            <Play className="w-5 h-5 fill-current" />
            Analyze Video
          </Link>
          <Link href="/dashboard/matches/1" className="flex items-center justify-center gap-2 px-8 py-4 glass text-foreground font-semibold rounded-full hover:bg-white/5 transition-all">
            View Live Demo
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full px-4">
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-start text-left transition-transform hover:-translate-y-2 duration-300">
            <div className="p-3 bg-primary/10 text-primary rounded-xl mb-6">
              <Crosshair className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Precision Tracking</h3>
            <p className="text-muted-foreground text-sm">Advanced YOLO models and ByteTrack algorithms ensuring pixel-perfect player and ball localization.</p>
          </div>

          <div className="glass-panel p-8 rounded-2xl flex flex-col items-start text-left transition-transform hover:-translate-y-2 duration-300">
            <div className="p-3 bg-accent/10 text-accent rounded-xl mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Team Classification</h3>
            <p className="text-muted-foreground text-sm">SigLIP-powered zero-shot classification accurately separating teams and goalkeepers.</p>
          </div>

          <div className="glass-panel p-8 rounded-2xl flex flex-col items-start text-left transition-transform hover:-translate-y-2 duration-300">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Tactical Radar</h3>
            <p className="text-muted-foreground text-sm">Real-time pitch homography projection transforming 2D video into top-down tactical minimaps.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
