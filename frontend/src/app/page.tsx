import Link from "next/link";
import { Activity, Play, BarChart3, Crosshair, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden overflow-y-auto">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="absolute top-0 w-full z-10 py-6 px-8 flex justify-between items-center glass">
        <div className="flex items-center gap-2">
          <Activity className="text-primary w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">Her<span className="text-primary">mes</span></span>
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

        {/* How It Works Section */}
        <section className="mt-32 w-full max-w-6xl px-4 text-left">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Under the Hood</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our proprietary computer vision stack processes tactical data in milliseconds.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                <div>
                  <h4 className="text-lg font-bold mb-2">Detection & Tracking</h4>
                  <p className="text-sm text-muted-foreground">YOLOv8 detects players, while ByteTrack assigns persistent IDs frame-by-frame, resisting occlusions.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">2</div>
                <div>
                  <h4 className="text-lg font-bold mb-2">Team Clustering</h4>
                  <p className="text-sm text-muted-foreground">SigLIP extracts deep visual embeddings from player crops, automatically clustering them into distinct teams.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">3</div>
                <div>
                  <h4 className="text-lg font-bold mb-2">Pitch Homography</h4>
                  <p className="text-sm text-muted-foreground">OpenCV warps 2D pixel coordinates into a top-down tactical radar map for spatial analysis.</p>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl aspect-square flex items-center justify-center border-border/50 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
               <div className="text-center space-y-4 relative z-10">
                 <Activity className="w-16 h-16 text-primary mx-auto opacity-50" />
                 <p className="font-mono text-xs text-muted-foreground tracking-widest">SYSTEM_ARCHITECTURE_VISUAL</p>
               </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-32 w-full max-w-4xl px-4 text-left mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border-border/50 transition-colors hover:border-primary/30">
              <h4 className="text-lg font-bold mb-2 text-white">What type of video footage is required?</h4>
              <p className="text-sm text-muted-foreground">For optimal tactical radar accuracy, we recommend standard broadcast or tactical camera angles (elevated, center-pitch). However, Hermes is designed to be robust even with single-camera amateur footage.</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-border/50 transition-colors hover:border-primary/30">
              <h4 className="text-lg font-bold mb-2 text-white">How long does analysis take?</h4>
              <p className="text-sm text-muted-foreground">Our pipeline runs extremely fast utilizing batching and tensor optimization. Processing generally takes less than half the duration of the video itself depending on server load.</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mt-32 w-full max-w-4xl px-4 text-center mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Ready to elevate your game?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Get in touch with our team for enterprise API access, custom integrations, or a personalized demo.</p>
          <a href="#" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_40px_rgba(14,165,233,0.6)]">
            Contact Sales
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-12 py-6 border-t border-white/5 glass relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="text-primary w-5 h-5" />
            <span className="font-bold text-sm">Her<span className="text-primary">mes</span></span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Hermes Analytics. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">API Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
