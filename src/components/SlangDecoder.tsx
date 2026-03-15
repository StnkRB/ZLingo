import React, { useState } from 'react';
import { decodeSlang } from '../services/gemini';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SlangDecoder() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDecode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await decodeSlang(input);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <form onSubmit={handleDecode} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste slang here (e.g. 'no cap fr fr')..."
          className="w-full brutal-border p-6 pr-16 text-xl font-mono focus:outline-none focus:ring-4 focus:ring-neon-green"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-neon-green p-3 brutal-border hover:bg-white transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="brutal-card bg-neon-yellow space-y-4"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-3xl">Translation</h2>
              <div className="bg-brutal-black text-white px-3 py-1 font-mono text-sm">
                VIBE: {result.vibeScore}%
              </div>
            </div>
            <p className="text-2xl font-bold italic">"{result.translation}"</p>
            <div className="space-y-2">
              <p className="font-bold uppercase text-sm">Explanation:</p>
              <p className="text-lg">{result.explanation}</p>
            </div>
            <div className="bg-white/50 p-4 border-2 border-brutal-black italic">
              <p className="font-bold uppercase text-xs mb-1">Example usage:</p>
              "{result.example}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="text-center p-12 opacity-50">
          <Sparkles className="w-12 h-12 mx-auto mb-4" />
          <p className="font-display uppercase">Enter some slang to start decoding</p>
        </div>
      )}
    </div>
  );
}
