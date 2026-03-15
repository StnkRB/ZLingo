import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Upload, Sparkles, X, Loader2, MessageSquare } from 'lucide-react';

interface MemeDecoderProps {
  onStartChat: (context: string) => void;
}

export default function MemeDecoder({ onStartChat }: MemeDecoderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setExplanation(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const decodeMeme = async () => {
    if (!image) return;
    setIsDecoding(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
              { text: "Explain this meme in peak GenZ slang. Tell me why it's funny (or if it's mid/cringe), what the 'lore' is, and give it a 'Rizz Rating' from 1-10. Keep it high energy and chaotic." }
            ]
          }
        ],
        config: {
          temperature: 1,
          topP: 0.95,
        }
      });

      setExplanation(response.text || "Vibe check failed. Try another one.");
    } catch (error) {
      console.error("Meme decoding failed:", error);
      setExplanation("The rizz engine stalled. Check your connection.");
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <div className="glass-card bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-neon-pink p-2 rounded-xl shadow-[0_0_20px_rgba(255,0,255,0.4)]">
            <ImageIcon className="text-black" size={20} />
          </div>
          <h3 className="text-xl font-bold tracking-tighter uppercase">Meme Decoder</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-neon-pink animate-pulse" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-neon-pink font-bold">
            Lore Engine Ready
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-4 relative overflow-hidden
              ${image ? 'border-neon-pink/50 bg-neon-pink/5' : 'border-white/10 hover:border-neon-pink/30 hover:bg-white/5'}`}
          >
            {image ? (
              <>
                <img src={image} alt="Meme" className="w-full h-full object-contain rounded-2xl" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setImage(null); setExplanation(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:text-neon-pink transition-colors"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="text-white/40" size={24} />
                </div>
                <div>
                  <p className="font-display text-lg uppercase tracking-widest">Drop the sauce</p>
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">PNG, JPG, WEBP • Max 5MB</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <button 
            onClick={decodeMeme}
            disabled={!image || isDecoding}
            className={`w-full glass-btn flex items-center justify-center gap-2 transition-all
              ${!image || isDecoding ? 'opacity-50 cursor-not-allowed' : 'bg-neon-pink text-white border-none hover:shadow-[0_0_30px_rgba(255,0,255,0.4)]'}`}
          >
            {isDecoding ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Sparkles size={18} />
                Decode Lore
              </>
            )}
          </button>
        </div>

        {/* Explanation Section */}
        <div className="glass-card bg-white/5 border-white/5 flex flex-col min-h-[300px]">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {explanation ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-neon-pink">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Analysis Complete</span>
                  </div>
                  <div className="font-sans text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                    {explanation}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <MessageSquare size={48} />
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
                    Upload a meme to see the lore
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {explanation && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <button 
                onClick={() => onStartChat(explanation)}
                className="w-full py-3 rounded-2xl bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Discuss with Z-Coach
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
