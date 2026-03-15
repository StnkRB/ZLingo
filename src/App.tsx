import { useState } from 'react';
import LiveCoach from './components/LiveCoach';
import MemeDecoder from './components/MemeDecoder';
import { Zap, Github, Twitter, Sparkles, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'coach' | 'decoder'>('coach');
  const [initialContext, setInitialContext] = useState<string | null>(null);

  const handleStartChat = (context: string) => {
    setInitialContext(context);
    setActiveTab('coach');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 vibrant-gradient pointer-events-none" />
      
      {/* Marquee Header */}
      <div className="bg-white/5 backdrop-blur-md text-white/60 py-2 overflow-hidden whitespace-nowrap border-b border-white/10 z-50">
        <div className="marquee-track flex gap-8 font-mono uppercase text-[10px] tracking-widest">
          {[...Array(10)].map((_, i) => (
            <span key={i}>No Cap • Fr Fr • Rizz Only • Slay • On God • Bet • Skibidi • Sigma • Gyatt • </span>
          ))}
        </div>
      </div>

      {/* Main Nav */}
      <header className="sticky top-0 z-50 px-4 py-6">
        <div className="container mx-auto glass-card !py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="bg-neon-blue p-2 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.5)]"
            >
              <Zap className="text-black fill-black" size={24} />
            </motion.div>
            <h1 className="text-3xl md:text-4xl tracking-tighter text-glow">ZLINGO</h1>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
              <button 
                onClick={() => setActiveTab('coach')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                  ${activeTab === 'coach' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                <MessageSquare size={14} />
                Live Coach
              </button>
              <button 
                onClick={() => setActiveTab('decoder')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                  ${activeTab === 'decoder' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                <ImageIcon size={14} />
                Meme Decoder
              </button>
            </nav>
          </div>

          <div className="flex gap-3">
            <button className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-all">
              <Twitter size={18} />
            </button>
            <button className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-all">
              <Github size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto mb-16 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-[10px] font-bold uppercase tracking-widest"
          >
            <Sparkles size={12} />
            {activeTab === 'coach' ? 'Next-Gen Conversation Coach' : 'Deep Lore Analysis Engine'}
          </motion.div>
          <h2 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter">
            {activeTab === 'coach' ? (
              <>MASTER THE <span className="text-neon-blue">VIBE</span></>
            ) : (
              <>DECODE THE <span className="text-neon-pink">LORE</span></>
            )}
          </h2>
          <p className="text-lg md:text-xl font-sans text-white/60 max-w-2xl mx-auto leading-relaxed">
            {activeTab === 'coach' 
              ? "Stop being mid. Level up your rizz with Z-Coach. Real-time voice coaching for the next generation of legends."
              : "Don't get left behind. Upload any meme and get the full breakdown in peak GenZ slang. No cap, just lore."}
          </p>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'coach' ? (
              <LiveCoach initialContext={initialContext} />
            ) : (
              <MemeDecoder onStartChat={handleStartChat} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-black/40 backdrop-blur-3xl py-16 relative z-10">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter">ZLINGO</h2>
            <p className="font-sans text-sm text-white/40 leading-relaxed">
              The ultimate GenZ conversation coach. Built for the rizzlers, by the rizzlers. Voice-first, vibe-only.
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Core Features</h3>
            <ul className="space-y-3 font-mono text-xs uppercase tracking-wider text-white/40">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-neon-blue" />
                Live Slang Decoding
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-neon-pink" />
                Real-time Rizz Feedback
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-neon-green" />
                Meme Culture Analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-neon-yellow" />
                Conversational Practice
              </li>
            </ul>
          </div>
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Join the Circle</h3>
            <div className="flex gap-3">
              <input 
                type="email" 
                placeholder="EMAIL@FRFR.COM" 
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 font-mono text-sm focus:outline-none focus:border-neon-blue transition-all"
              />
              <button className="bg-white text-black px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-neon-blue transition-all">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-16 pt-8 border-t border-white/5 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-white/20">
          © 2026 ZLINGO • NO CAP • ALL RIGHTS RESERVED • STAY SIGMA
        </div>
      </footer>
    </div>
  );
}
