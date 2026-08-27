import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Volume2
} from 'lucide-react';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTranscript: (transcript: string) => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onApplyTranscript
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 45, 60, 30, 20, 50, 75, 40, 25, 65, 35]);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize speech recognition and microphone on modal open
  useEffect(() => {
    if (!isOpen) {
      handleStopRecording();
      setElapsedSeconds(0);
      setTranscript('');
      setInterimTranscript('');
      setErrorMessage(null);
      return;
    }

    // Auto-start recording attempt when opened
    startSession();

    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  // Elapsed timer tick
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  };

  const startSession = async () => {
    setErrorMessage(null);
    setTranscript('');
    setInterimTranscript('');

    // Check browser speech recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech Recognition is not natively supported in this browser. You can type in the box or use Chrome / Safari / Edge.'
      );
      setHasPermission(false);
      return;
    }

    try {
      // Request microphone access for audio visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setHasPermission(true);

      // Setup Web Audio API analyser for live waveform bars
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const updateWaveform = () => {
          if (analyserRef.current && isRecording && !isPaused) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            // Sample 12 frequency bins
            const bars = Array.from({ length: 14 }).map((_, i) => {
              const val = dataArray[i * 2] || 0;
              return Math.max(12, Math.min(95, Math.round((val / 255) * 100)));
            });
            setAudioLevels(bars);
          }
          animationFrameRef.current = requestAnimationFrame(updateWaveform);
        };
        updateWaveform();
      }

      // Configure SpeechRecognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setIsPaused(false);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += (res[0].transcript || '') + ' ';
          } else {
            interimStr += res[0].transcript || '';
          }
        }

        if (finalStr) {
          setTranscript((prev) => {
            const trimmed = finalStr.trim();
            return prev ? `${prev} ${trimmed}` : trimmed;
          });
        }
        setInterimTranscript(interimStr);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions.');
          setHasPermission(false);
        } else if (event.error === 'no-speech') {
          // Soft timeout, user is silent
        } else {
          setErrorMessage(`Speech recognition notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If still flagged as recording and not manually paused, auto-restart
        if (isRecording && !isPaused) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setHasPermission(false);
      setErrorMessage(
        'Unable to access microphone. Please check your browser permissions.'
      );
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    } else {
      setIsPaused(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    cleanupAudio();
  };

  const handleApply = () => {
    const fullText = (transcript + (interimTranscript ? ` ${interimTranscript}` : '')).trim();
    if (fullText) {
      onApplyTranscript(fullText);
    }
    handleStopRecording();
    onClose();
  };

  const handleReset = () => {
    handleStopRecording();
    setTranscript('');
    setInterimTranscript('');
    setElapsedSeconds(0);
    startSession();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg rounded-2xl bg-[#0B0D0E] border border-[#22272B] shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 text-white space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2428] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111416] border border-[#76B900]/40 flex items-center justify-center text-[#76B900] shadow-[0_0_15px_rgba(118,185,0,0.15)]">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Voice Journaling
                {isRecording && !isPaused && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#76B900]/15 text-[#8FE000] border border-[#76B900]/40 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8FE000]" />
                    LISTENING
                  </span>
                )}
                {isPaused && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
                    PAUSED
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400">
                Speak freely. ReflectAI transcribes your thoughts in real time.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleStopRecording();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-[#111416] border border-[#22272B] text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Waveform & Timer Visualizer */}
        <div className="p-5 rounded-2xl bg-[#111416] border border-[#1F2428] flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
          {/* Timer Display */}
          <div className="text-3xl font-mono font-bold tracking-wider text-white">
            {formatTimer(elapsedSeconds)}
          </div>

          {/* Animated Waveform Visualizer Bars */}
          <div className="flex items-center justify-center gap-1.5 h-14 w-full px-4">
            {audioLevels.map((lvl, idx) => (
              <motion.div
                key={idx}
                animate={{
                  height: isRecording && !isPaused ? `${lvl}%` : '15%',
                  backgroundColor: isRecording && !isPaused ? '#76B900' : '#333C44'
                }}
                transition={{ duration: 0.1 }}
                className="w-2 rounded-full transition-all"
                style={{
                  minHeight: '6px',
                  boxShadow: isRecording && !isPaused ? '0 0 8px rgba(118, 185, 0, 0.4)' : 'none'
                }}
              />
            ))}
          </div>

          {/* Recording Status / Mic Control */}
          <div className="flex items-center gap-3 pt-1">
            {isRecording ? (
              <>
                <button
                  type="button"
                  onClick={handlePauseResume}
                  className="px-3 py-1.5 rounded-xl bg-[#171A1C] hover:bg-[#22272B] border border-[#2B3238] text-xs font-semibold text-neutral-200 hover:text-white flex items-center gap-1.5 transition-all"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-[#8FE000]" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-xs font-semibold text-red-300 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startSession}
                className="px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(118,185,0,0.3)] active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl bg-[#171A1C] hover:bg-[#22272B] border border-[#2B3238] text-neutral-400 hover:text-white transition-colors"
              title="Record Again"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Error message banner if any */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Live Transcript Box (Editable) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <label className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#76B900]" />
              Voice Transcript (Editable)
            </label>
            <span className="font-mono text-[10px] text-neutral-500">
              {transcript.length + interimTranscript.length} chars
            </span>
          </div>

          <div className="relative">
            <textarea
              value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
              onChange={(e) => {
                setTranscript(e.target.value);
                setInterimTranscript('');
              }}
              placeholder="Your transcribed words will appear here in real-time as you speak..."
              rows={5}
              className="w-full bg-[#111416] border border-[#22272B] focus:border-[#76B900] focus:ring-1 focus:ring-[#76B900] rounded-xl p-3.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none transition-all leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#1F2428] pt-4">
          <button
            type="button"
            onClick={() => {
              handleStopRecording();
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl bg-[#111416] hover:bg-[#171A1C] border border-[#22272B] text-neutral-400 hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApply}
              disabled={!(transcript + interimTranscript).trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black font-bold text-xs transition-all shadow-[0_0_20px_rgba(118,185,0,0.25)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Use Transcript</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
