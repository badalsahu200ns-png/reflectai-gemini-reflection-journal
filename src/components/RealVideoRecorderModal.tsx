import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Video,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  MapPin,
  Tag,
  Check,
  X,
  AlertCircle,
  Clock,
  Volume2,
  VolumeX,
  Sliders,
  RefreshCw,
  Edit3,
  Layers,
  Save,
  SwitchCamera
} from 'lucide-react';
import { DedicatedMemoryItem, JournalMood, JournalLocation } from '../types';
import { LocationPickerModal } from './LocationPickerModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface RealVideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMemory: (memory: DedicatedMemoryItem) => void;
}

export const RealVideoRecorderModal: React.FC<RealVideoRecorderModalProps> = ({
  isOpen,
  onClose,
  onSaveMemory
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Media Stream & Recording States
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'review'>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Video Player in Review Mode
  const [isPlayingReview, setIsPlayingReview] = useState(false);
  const [reviewCurrentTime, setReviewCurrentTime] = useState(0);
  const [reviewDuration, setReviewDuration] = useState(0);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState<JournalMood>('Calm');
  const [tags, setTags] = useState('VideoJournal, Mindfulness');
  const [location, setLocation] = useState<JournalLocation | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // AI Synthesis
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<{
    memoryTitle: string;
    whatHappened: string;
    keyMoments: string[];
    memorySummary: string;
    reflection: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Refs
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const reviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Start Camera Stream
  const initCamera = async (mode = facingMode) => {
    try {
      setPermissionError(null);
      // Clean up previous stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      setStream(mediaStream);
      setHasCameraPermission(true);

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = mediaStream;
      }

      // Initialize Audio Visualizer
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(mediaStream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 255) * 100)));
          }
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch (err) {
        console.warn('Audio visualization context not available:', err);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasCameraPermission(false);
      setPermissionError(
        err.name === 'NotAllowedError'
          ? 'Camera/Microphone permission was denied. Please grant permission in your browser.'
          : err.name === 'NotFoundError'
          ? 'No camera or microphone device found on this system.'
          : 'Could not access camera: ' + (err.message || 'Unknown error')
      );
    }
  };

  // Stop Stream and Audio Context
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      initCamera(facingMode);
    } else {
      stopStream();
      resetRecorder();
    }
    return () => {
      stopStream();
    };
  }, [isOpen]);

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    initCamera(nextMode);
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isMicMuted;
      });
      setIsMicMuted(!isMicMuted);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    const chunks: Blob[] = [];
    setRecordedChunks([]);

    // Select supported mimeType
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    let selectedMime = '';
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    try {
      const recorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMime || 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedVideoUrl(url);
        setRecordingState('review');
        stopStream();

        if (!title) {
          setTitle(`Video Reflection • ${new Date().toLocaleDateString()}`);
        }
      };

      recorder.start(250); // Slice every 250ms
      setMediaRecorder(recorder);
      setRecordingState('recording');
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to start MediaRecorder:', err);
      setPermissionError('Failed to initialize recorder: ' + err.message);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setRecordingState('paused');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setRecordingState('recording');
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const resetRecorder = () => {
    setRecordedChunks([]);
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    setRecordingState('idle');
    setRecordingDuration(0);
    setAiSummary(null);
    setTitle('');
    setDescription('');
    setIsPlayingReview(false);
  };

  const handleRetake = () => {
    resetRecorder();
    initCamera(facingMode);
  };

  // Generate AI Summary with Gemini
  const handleGenerateAISummary = async () => {
    setIsGeneratingAISummary(true);
    setAiError(null);
    try {
      const res = await fetch('/api/memories/video-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: title || 'Video Reflection',
          description: description || 'Spoken video journal reflection',
          mood,
          transcript: description || 'Spoken reflections captured on camera'
        })
      });

      if (!res.ok) {
        throw new Error('Could not synthesize AI video summary');
      }

      const data = await res.json();
      setAiSummary(data);
      if (data.memoryTitle && !title) {
        setTitle(data.memoryTitle);
      }
    } catch (err: any) {
      console.error('Error generating AI video summary:', err);
      setAiError(err.message || 'AI summary generation failed.');
    } finally {
      setIsGeneratingAISummary(false);
    }
  };

  // Save to Memory Vault
  const handleSave = () => {
    if (!recordedVideoUrl) return;

    const memoryItem: DedicatedMemoryItem = {
      id: `mem-video-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      title: title.trim() || `Video Journal • ${new Date().toLocaleDateString()}`,
      description: description.trim() || (aiSummary?.memorySummary || 'Personal video reflection.'),
      mediaType: 'video',
      mediaUrl: recordedVideoUrl,
      videoDurationSeconds: recordingDuration,
      mood,
      tags: tags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
      location: location || undefined,
      capturedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      aiDescription: aiSummary?.memorySummary || undefined,
      aiVideoSummary: aiSummary
        ? {
            ...aiSummary,
            generatedAt: new Date().toISOString()
          }
        : undefined
    };

    onSaveMemory(memoryItem);
    onClose();
  };

  // Format Duration seconds -> MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Real Video Journal Recorder
                {recordingState === 'recording' && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    REC {formatTime(recordingDuration)}
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-400">
                Capture high-definition video memories with live audio and Gemini AI synthesis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Permission Error Banner */}
          {permissionError && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-3 text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-rose-300">Camera / Microphone Notice</p>
                <p className="text-xs text-rose-200/80 mt-0.5">{permissionError}</p>
                <button
                  onClick={() => initCamera(facingMode)}
                  className="mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Camera Access
                </button>
              </div>
            </div>
          )}

          {/* Camera Stage / Video Review Stage */}
          <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-inner flex items-center justify-center">
            {recordingState !== 'review' ? (
              <>
                <video
                  ref={liveVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {/* Overlay Controls */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  {/* Timer */}
                  <div className="pointer-events-auto px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-mono flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{formatTime(recordingDuration)}</span>
                  </div>

                  {/* Camera toggles */}
                  <div className="pointer-events-auto flex items-center gap-2">
                    {/* Audio Level Meter */}
                    <div className="px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                      <div className="w-12 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-75"
                          style={{ width: `${audioLevel}%` }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-neutral-400 hover:text-white"
                        title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                      >
                        {isMicMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white transition-colors"
                      title="Switch Camera (Front/Rear)"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Live Record Controls */}
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4">
                  {recordingState === 'idle' && (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={!hasCameraPermission}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-sm shadow-xl flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                      Start Recording
                    </button>
                  )}

                  {recordingState === 'recording' && (
                    <>
                      <button
                        type="button"
                        onClick={pauseRecording}
                        className="p-3.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white border border-neutral-700 backdrop-blur-md shadow-lg transition-colors"
                        title="Pause"
                      >
                        <Pause className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-xl flex items-center gap-2 transition-all transform hover:scale-105"
                      >
                        <Square className="w-4 h-4 fill-white" />
                        Finish Recording
                      </button>
                    </>
                  )}

                  {recordingState === 'paused' && (
                    <>
                      <button
                        type="button"
                        onClick={resumeRecording}
                        className="p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-colors"
                        title="Resume"
                      >
                        <Play className="w-5 h-5 fill-white" />
                      </button>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-xl flex items-center gap-2 transition-all"
                      >
                        <Square className="w-4 h-4 fill-white" />
                        Finish Recording
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              /* Review Player */
              <div className="relative w-full h-full flex flex-col justify-end">
                <video
                  ref={reviewVideoRef}
                  src={recordedVideoUrl || undefined}
                  playsInline
                  onTimeUpdate={() => {
                    if (reviewVideoRef.current) {
                      setReviewCurrentTime(reviewVideoRef.current.currentTime);
                      setReviewDuration(reviewVideoRef.current.duration || recordingDuration);
                    }
                  }}
                  onEnded={() => setIsPlayingReview(false)}
                  className="w-full h-full object-cover"
                />

                {/* Video Play/Pause Floating Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
                  <button
                    type="button"
                    onClick={() => {
                      if (reviewVideoRef.current) {
                        if (isPlayingReview) {
                          reviewVideoRef.current.pause();
                          setIsPlayingReview(false);
                        } else {
                          reviewVideoRef.current.play();
                          setIsPlayingReview(true);
                        }
                      }
                    }}
                    className="w-14 h-14 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-2xl transition-transform transform hover:scale-110"
                  >
                    {isPlayingReview ? <Pause className="w-6 h-6 fill-neutral-900" /> : <Play className="w-6 h-6 fill-neutral-900 ml-1" />}
                  </button>
                </div>

                {/* Scrubber Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3 text-xs text-white">
                  <span>{formatTime(reviewCurrentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={reviewDuration || recordingDuration || 1}
                    step="0.1"
                    value={reviewCurrentTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setReviewCurrentTime(val);
                      if (reviewVideoRef.current) {
                        reviewVideoRef.current.currentTime = val;
                      }
                    }}
                    className="flex-1 accent-rose-500 cursor-pointer h-1.5 bg-white/30 rounded-lg"
                  />
                  <span>{formatTime(reviewDuration || recordingDuration)}</span>

                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-200 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form & AI Section (Active when in Review mode) */}
          {recordingState === 'review' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
              {/* Left Column: Metadata */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Memory Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Breakthrough Reflection in Studio..."
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    User Notes & Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What were you experiencing or expressing in this video?"
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Emotional Tone
                    </label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value as JournalMood)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                    >
                      <option value="Calm">🌊 Calm</option>
                      <option value="Thoughtful">💡 Thoughtful</option>
                      <option value="Energized">⚡ Energized</option>
                      <option value="Focused">🎯 Focused</option>
                      <option value="Grateful">🙏 Grateful</option>
                      <option value="Curious">🔮 Curious</option>
                      <option value="Anxious">🌧️ Anxious</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Milestone, Travel..."
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Location Attachment */}
                <div className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{location ? location.name : 'No location attached'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                  >
                    {location ? 'Change Location' : '+ Tag Place'}
                  </button>
                </div>
              </div>

              {/* Right Column: AI Video Memory Synthesis */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-neutral-900 to-purple-950/40 border border-indigo-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                        Gemini AI Video Synthesis
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateAISummary}
                      disabled={isGeneratingAISummary}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      {isGeneratingAISummary ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Synthesizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Generate AI Summary
                        </>
                      )}
                    </button>
                  </div>

                  {aiSummary ? (
                    <div className="space-y-3 text-xs text-neutral-200">
                      <div>
                        <span className="text-neutral-400 font-medium block mb-0.5">What Happened:</span>
                        <p className="leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                          {aiSummary.whatHappened}
                        </p>
                      </div>

                      {aiSummary.keyMoments && aiSummary.keyMoments.length > 0 && (
                        <div>
                          <span className="text-neutral-400 font-medium block mb-1">Key Moments:</span>
                          <ul className="list-disc list-inside space-y-1 text-neutral-300">
                            {aiSummary.keyMoments.map((km, i) => (
                              <li key={i}>{km}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <span className="text-amber-300/90 font-medium block mb-0.5">Reflective Takeaway:</span>
                        <p className="italic text-neutral-300 bg-amber-950/20 border border-amber-800/30 p-2 rounded-xl">
                          "{aiSummary.reflection}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Click <strong className="text-indigo-300">Generate AI Summary</strong> to have Gemini analyze your video memory context, extract key moments, and create an introspective synthesis.
                    </p>
                  )}

                  {aiError && <p className="text-xs text-rose-400">{aiError}</p>}
                </div>

                {/* Save Memory Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Save className="w-4 h-4" /> Save Video Memory to Vault
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Location Picker Modal */}
        <LocationPickerModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          currentLocation={location}
          onSelectLocation={(loc) => setLocation(loc)}
        />
      </motion.div>
    </div>
  );
};
