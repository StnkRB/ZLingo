import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { Mic, MicOff, Video, VideoOff, Loader2, MessageSquare, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveCoachProps {
  initialContext?: string | null;
}

export default function LiveCoach({ initialContext }: LiveCoachProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState<string>('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextPlaybackTimeRef = useRef<number>(0);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: isVideoOn 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      nextPlaybackTimeRef.current = 0;

      // In a real app, we'd load a worklet for PCM processing. 
      // For this demo, we'll use a simpler script processor or just handle the connection.
      // Note: Guidelines require manual PCM encoding/decoding for Live API.
      
      const baseInstruction = "You are 'Z-Coach', a high-energy GenZ slang expert. Your goal is to coach the user on how to talk like a GenZ legend. Use terms like 'rizz', 'no cap', 'fr', 'bet', 'slay', 'on god'. Give feedback on their rizz level. Be chaotic, funny, and supportive. If they say something 'cringe', call it out but help them fix it. You can also analyze memes if the user shows them to the camera or describes them. This is a voice-only experience, so focus on conversational flow and vibe.";
      const contextualInstruction = initialContext 
        ? `${baseInstruction} The user just uploaded a meme and you explained it as: "${initialContext}". Start the conversation by referencing this meme and asking the user what they think about it or if they want to practice using the slang from the explanation.`
        : baseInstruction;

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: contextualInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            // Start sending audio frames here
            sessionPromise.then((session) => processAudio(stream, session));
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              const audioPart = message.serverContent.modelTurn.parts.find(p => p.inlineData);
              if (audioPart?.inlineData) {
                playAudio(audioPart.inlineData.data);
              }
            }
            
            if (message.serverContent?.modelTurn?.parts) {
                const textPart = message.serverContent.modelTurn.parts.find(p => p.text);
                if (textPart?.text) {
                    setAiResponse(textPart.text);
                }
            }

            if (message.serverContent?.interrupted) {
              // Handle interruption
              stopPlayback();
            }
          },
          onclose: () => {
            setIsConnected(false);
            stopSession();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setIsConnecting(false);
          }
        }
      });
      
      const session = await sessionPromise;
      sessionRef.current = session;

    } catch (error) {
      console.error("Failed to start session:", error);
      setIsConnecting(false);
    }
  };

  const processAudio = (stream: MediaStream, session: any) => {
    const audioContext = audioContextRef.current!;
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      if (isMuted) return;
      const inputData = e.inputBuffer.getChannelData(0);
      // Convert Float32 to Int16 PCM
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      session.sendRealtimeInput({
        media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
      });

      // If video is on, send frames occasionally
      if (isVideoOn && canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const frameData = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
          session.sendRealtimeInput({
            media: { data: frameData, mimeType: 'image/jpeg' }
          });
        }
      }
    };
  };

  const playAudio = async (base64Data: string) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = audioContext.createBuffer(1, floatData.length, 24000);
    buffer.getChannelData(0).set(floatData);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    const now = audioContext.currentTime;
    if (nextPlaybackTimeRef.current < now) {
      nextPlaybackTimeRef.current = now + 0.05; // Small buffer for initial start
    }

    source.start(nextPlaybackTimeRef.current);
    nextPlaybackTimeRef.current += buffer.duration;
  };

  const stopPlayback = () => {
    // Logic to stop current audio source if needed
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    setIsConnected(false);
    setAiResponse('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="glass-card bg-black/40 aspect-video relative overflow-hidden flex items-center justify-center group">
            {isVideoOn ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="text-neon-blue text-center">
                <motion.div
                  animate={isConnected ? { 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Zap className="w-24 h-24 mx-auto mb-4 fill-neon-blue/20" />
                </motion.div>
                <p className="font-display text-2xl uppercase tracking-widest text-glow">
                  {isConnected ? 'Z-Coach is Vibe-Checking' : 'Ready to Rizz?'}
                </p>
              </div>
            )}
            
            <canvas ref={canvasRef} width="320" height="240" className="hidden" />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${isMuted ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-neon-green/20 border-neon-green/50 text-neon-green'}`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button 
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${!isVideoOn ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-neon-pink/20 border-neon-pink/50 text-neon-pink'}`}
              >
                {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            </div>
          </div>

          <div className="glass-card bg-neon-blue/5 border-neon-blue/20 min-h-[120px] flex items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />
            <AnimatePresence mode="wait">
              {aiResponse ? (
                <motion.p 
                  key={aiResponse}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-display uppercase text-center tracking-tight leading-tight"
                >
                  "{aiResponse}"
                </motion.p>
              ) : (
                <p className="text-sm font-mono opacity-30 tracking-[0.2em] uppercase">
                  {isConnected ? "Awaiting Z-Coach input..." : "Connect to start the session"}
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Session Info</h3>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green shadow-[0_0_10px_rgba(0,255,0,0.5)]' : 'bg-red-500'}`} />
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Coach Identity</p>
                <p className="text-lg font-bold uppercase tracking-tighter">Z-Coach (Zephyr)</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Voice Profile</p>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                  <MessageSquare size={14} className="text-neon-pink" />
                  <p className="text-xs font-bold uppercase tracking-widest">High Energy</p>
                </div>
              </div>

              <div className="pt-12">
                {!isConnected ? (
                  <button 
                    onClick={startSession}
                    disabled={isConnecting}
                    className="w-full glass-btn bg-white text-black hover:bg-neon-blue hover:text-white border-none"
                  >
                    {isConnecting ? <Loader2 className="animate-spin mx-auto" /> : (
                      <span className="flex items-center justify-center gap-2">
                        <Zap size={18} />
                        Connect Coach
                      </span>
                    )}
                  </button>
                ) : (
                  <button 
                    onClick={stopSession}
                    className="w-full glass-btn bg-red-500/20 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    End Session
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-auto pt-8 border-t border-white/10">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] font-mono leading-relaxed text-white/30 uppercase tracking-widest">
                  PRO TIP: Ask Z-Coach to rate your "aura" or explain why something is "lowkey fire".
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
