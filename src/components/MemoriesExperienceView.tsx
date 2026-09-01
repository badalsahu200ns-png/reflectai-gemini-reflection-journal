import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Video,
  Mic,
  PenTool,
  Upload,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit3,
  Star,
  Sparkles,
  MapPin,
  Tag,
  Calendar,
  Filter,
  Eye,
  Check,
  RotateCcw,
  X,
  Volume2,
  Clock,
  Film,
  Image as ImageIcon,
  FolderPlus,
  RefreshCw,
  Share2
} from 'lucide-react';
import { DedicatedMemoryItem, JournalMood, JournalLocation, JournalEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RealVideoRecorderModal } from './RealVideoRecorderModal';


interface MemoriesExperienceViewProps {
  entries?: JournalEntry[];
  onOpenEntry?: (entryId: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const MemoriesExperienceView: React.FC<MemoriesExperienceViewProps> = ({
  entries = [],
  onOpenEntry,
  onNavigateTab
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'photos' | 'videos' | 'voice' | 'written'>('all');
  
  // Filter & Search
  const [filterMood, setFilterMood] = useState<string>('ALL');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [filterDateGroup, setFilterDateGroup] = useState<'ALL' | 'TODAY' | 'MONTH' | 'YEAR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample + User-Created Memories State
  const [memoriesList, setMemoriesList] = useState<DedicatedMemoryItem[]>([
    {
      id: 'mem-sample-1',
      userId: user?.uid || 'anonymous',
      title: 'Sunrise Reflection by the Lake',
      description: 'Morning stillness, early morning mist clearing over the quiet water.',
      mediaType: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      mood: 'Calm',
      tags: ['Nature', 'Morning', 'Peace'],
      location: { name: 'Crystal Springs Lake', lat: 37.7749, lng: -122.4194 },
      capturedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isFavorite: true,
      aiDescription: 'A serene dawn captures golden rays piercing lake fog, cultivating deep mental quietude.',
      aiVideoSummary: null
    },
    {
      id: 'mem-sample-2',
      userId: user?.uid || 'anonymous',
      title: 'Project Milestone Breakthrough',
      description: 'Recorded a quick video journal right after solving the async state architecture bug!',
      mediaType: 'video',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoDurationSeconds: 42,
      thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
      mood: 'Energized',
      tags: ['Career', 'Milestone', 'Coding'],
      location: { name: 'Home Studio', lat: 37.7749, lng: -122.4194 },
      capturedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      isFavorite: true,
      aiDescription: 'High-energy celebration of a technical breakthrough.',
      aiVideoSummary: {
        memoryTitle: 'The Spark of Technical Resolution',
        whatHappened: 'You expressed immense relief and creative momentum after untangling a complex engineering issue.',
        keyMoments: [
          'Expressed authentic relief at resolving the persistence bottleneck',
          'Noticed that taking a 15-minute walk provided the cognitive breakthrough',
          'Articulated renewed confidence in upcoming releases'
        ],
        memorySummary: 'A vivid snapshot of persistence paying off, demonstrating that rest facilitates problem-solving.',
        reflection: 'Notice how your patience transformed frustration into deep technical mastery.',
        generatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ]);

  // Modal States
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video' | 'voice' | 'text'>('photo');
  const [selectedMemory, setSelectedMemory] = useState<DedicatedMemoryItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // New Memory Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMood, setNewMood] = useState<JournalMood>('Calm');
  const [newTags, setNewTags] = useState<string>('ReflectAI, Memory');
  const [newLocationName, setNewLocationName] = useState('Sanctuary');
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedAISummary, setGeneratedAISummary] = useState<any | null>(null);
  const [generatedAIDescription, setGeneratedAIDescription] = useState('');

  // Real Video Recorder State
  const [isRealVideoRecorderOpen, setIsRealVideoRecorderOpen] = useState(false);

  // Video recording simulation
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoTimer, setVideoTimer] = useState(0);
  const videoTimerRef = useRef<any>(null);

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startVideoRecording = () => {
    setIsRecordingVideo(true);
    setVideoTimer(0);
    videoTimerRef.current = setInterval(() => {
      setVideoTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopVideoRecording = () => {
    setIsRecordingVideo(false);
    if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    // Use fallback sample video
    setMediaPreviewUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  };

  // AI Video Memory Summary Generator
  const handleGenerateVideoSummary = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/memories/video-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: newTitle || 'Personal Video Journal',
          description: newDescription || 'Video memory recorded in ReflectAI',
          mood: newMood,
          transcript: newDescription
        })
      });
      const data = await res.json();
      setGeneratedAISummary(data);
      if (!newTitle && data.memoryTitle) setNewTitle(data.memoryTitle);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // AI Photo Description Generator
  const handleGeneratePhotoDescription = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/gemini/reflect-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a poetic, 2-sentence reflective description for a photo titled "${newTitle || 'Captured Moment'}" with notes: "${newDescription}". Ground it in mindfulness.`,
          systemInstruction: 'You are a warm, poetic mindfulness journal AI.',
          temperature: 0.7
        })
      });
      const data = await res.json();
      setGeneratedAIDescription(data.text || 'A cherished visual moment captured with mindful presence.');
    } catch (err) {
      setGeneratedAIDescription('A cherished visual moment captured with mindful presence.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Save Memory
  const handleSaveMemory = () => {
    if (!newTitle.trim() && !newDescription.trim()) return;

    const newMem: DedicatedMemoryItem = {
      id: `mem-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      title: newTitle || (captureMode === 'video' ? 'Video Journal Memory' : 'Photo Memory'),
      description: newDescription,
      mediaType: captureMode,
      mediaUrl: mediaPreviewUrl || (captureMode === 'photo' ? 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80' : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
      videoDurationSeconds: captureMode === 'video' ? Math.max(videoTimer, 15) : undefined,
      mood: newMood,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      location: newLocationName ? { name: newLocationName, lat: 37.7749, lng: -122.4194 } : null,
      capturedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      aiDescription: generatedAIDescription || undefined,
      aiVideoSummary: generatedAISummary || null
    };

    setMemoriesList([newMem, ...memoriesList]);
    resetCaptureForm();
    setIsCaptureModalOpen(false);
  };

  const resetCaptureForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewMood('Calm');
    setNewTags('ReflectAI, Memory');
    setNewLocationName('Sanctuary');
    setMediaPreviewUrl(null);
    setGeneratedAISummary(null);
    setGeneratedAIDescription('');
    setIsRecordingVideo(false);
    setVideoTimer(0);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemoriesList(
      memoriesList.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    );
  };

  const deleteMemory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemoriesList(memoriesList.filter((m) => m.id !== id));
    if (selectedMemory?.id === id) setIsDetailModalOpen(false);
  };

  // Filtered List
  const filteredMemories = memoriesList.filter((m) => {
    if (activeSubTab === 'photos' && m.mediaType !== 'photo') return false;
    if (activeSubTab === 'videos' && m.mediaType !== 'video') return false;
    if (activeSubTab === 'voice' && m.mediaType !== 'voice') return false;
    if (activeSubTab === 'written' && m.mediaType !== 'text') return false;
    if (filterMood !== 'ALL' && m.mood !== filterMood) return false;
    if (filterTag !== 'ALL' && !m.tags.includes(filterTag)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDesc = (m.description || '').toLowerCase().includes(q);
      const matchTags = m.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn" id="memories-experience-view">
      {/* Header with Capture Action */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400">
              <Camera className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-white">
              Memories & Media Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Capture photos, record video journals, dictate voice memories, and synthesize moments with Gemini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRealVideoRecorderOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
            id="btn-real-video-recorder"
          >
            <Video className="w-4 h-4" />
            <span>🎥 Record Live Video</span>
          </button>
          <button
            onClick={() => {
              resetCaptureForm();
              setIsCaptureModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F44336] hover:bg-[#D32F2F] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
            id="btn-capture-memory"
          >
            <Plus className="w-4 h-4" />
            <span>+ Capture a Memory</span>
          </button>
        </div>
      </header>

      {/* Sub-Navigation & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-neutral-800 pb-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111416] border border-neutral-800">
          {[
            { id: 'all', label: 'All Memories', icon: Sparkles },
            { id: 'photos', label: 'Photo Wall', icon: ImageIcon },
            { id: 'videos', label: 'Video Library', icon: Film },
            { id: 'voice', label: 'Voice Audio', icon: Mic },
            { id: 'written', label: 'Written Memories', icon: PenTool }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#76B900] text-black shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mood Filter */}
          <select
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#14171A] border border-neutral-800 text-xs text-neutral-300 focus:border-[#76B900] focus:outline-none"
          >
            <option value="ALL">All Moods</option>
            <option value="Calm">🌿 Calm</option>
            <option value="Energized">⚡ Energized</option>
            <option value="Focused">🎯 Focused</option>
            <option value="Grateful">🌸 Grateful</option>
            <option value="Thoughtful">✨ Thoughtful</option>
          </select>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="px-3 py-1.5 rounded-xl bg-[#14171A] border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:border-[#76B900] focus:outline-none"
          />
        </div>
      </div>

      {/* PHOTO MEMORY WALL & VIDEO LIBRARY GRID */}
      {filteredMemories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-800 bg-[#111416]">
          <Camera className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">No memories captured in this view</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Upload meaningful photos, record video reflections, or write notes to preserve key milestones.
          </p>
          <button
            onClick={() => setIsCaptureModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#76B900] text-black text-xs font-bold"
          >
            Capture First Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map((mem) => {
            const isVideo = mem.mediaType === 'video';
            const isPhoto = mem.mediaType === 'photo';

            return (
              <div
                key={mem.id}
                onClick={() => {
                  setSelectedMemory(mem);
                  setIsDetailModalOpen(true);
                }}
                className="rounded-2xl border border-neutral-800/80 bg-[#14171A] overflow-hidden hover:border-[#76B900]/50 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
                id={`card-memory-${mem.id}`}
              >
                {/* Media Preview Container */}
                <div className="relative aspect-video bg-black/40 overflow-hidden">
                  {mem.mediaUrl && isPhoto && (
                    <img
                      src={mem.mediaUrl}
                      alt={mem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {mem.mediaUrl && isVideo && (
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                      <img
                        src={mem.thumbnailUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'}
                        alt={mem.title}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>
                      {mem.videoDurationSeconds && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                          0:{mem.videoDurationSeconds < 10 ? `0${mem.videoDurationSeconds}` : mem.videoDurationSeconds}
                        </span>
                      )}
                    </div>
                  )}

                  {mem.mediaType === 'voice' && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/40 to-black p-4 text-center">
                      <Volume2 className="w-8 h-8 text-indigo-400 mb-2" />
                      <span className="text-xs font-semibold text-indigo-300">Voice Memory Audio</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20 capitalize">
                      {mem.mediaType}
                    </span>

                    <button
                      onClick={(e) => toggleFavorite(mem.id, e)}
                      className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-neutral-300 hover:text-amber-400 transition-colors"
                      title={mem.isFavorite ? 'Remove favorite' : 'Favorite'}
                    >
                      <Star className={`w-3.5 h-3.5 ${mem.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>{new Date(mem.capturedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {mem.mood && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4B400]/10 text-amber-300 border border-amber-500/20">
                          {mem.mood}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-[#76B900] transition-colors">
                      {mem.title}
                    </h3>

                    {mem.description && (
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {mem.description}
                      </p>
                    )}

                    {/* AI Video Summary Snippet */}
                    {mem.aiVideoSummary && (
                      <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200 mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-purple-300">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>AI Video Synthesis:</span>
                        </div>
                        <p className="line-clamp-2 text-purple-200/80 text-[10px]">
                          {mem.aiVideoSummary.memorySummary}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer Tags & Location */}
                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1.5 truncate">
                      {mem.location && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <MapPin className="w-3 h-3" />
                          {mem.location.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => deleteMemory(mem.id, e)}
                        className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                        title="Delete memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAPTURE MEMORY MODAL (+ Photo / Video / Voice / Written) */}
      {/* ========================================================================= */}
      {isCaptureModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#14171A] border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#76B900]/15 flex items-center justify-center text-[#76B900]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Capture a New Memory</h2>
                  <p className="text-xs text-neutral-400">Add media, record audio/video, or write notes</p>
                </div>
              </div>
              <button
                onClick={() => setIsCaptureModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selectors */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'photo', label: 'Take Photo', icon: Camera },
                { id: 'video', label: 'Record Video', icon: Video },
                { id: 'voice', label: 'Voice Audio', icon: Mic },
                { id: 'text', label: 'Write Note', icon: PenTool }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = captureMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setCaptureMode(m.id as any);
                      setMediaPreviewUrl(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#76B900] text-black border-[#76B900] shadow-xs'
                        : 'bg-[#111416] text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Media Upload / Record Section */}
            <div className="space-y-4">
              {captureMode === 'photo' && (
                <div className="p-4 rounded-2xl border border-neutral-800 bg-[#111416] space-y-3">
                  {mediaPreviewUrl ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                      <img src={mediaPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setMediaPreviewUrl(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-neutral-700 hover:border-[#76B900] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                      <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                      <span className="text-xs font-semibold text-white">Click or drag photo here to upload</span>
                      <span className="text-[10px] text-neutral-500 mt-1">Supports JPG, PNG, WEBP up to 25MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'photo')}
                        className="hidden"
                      />
                    </label>
                  )}

                  {mediaPreviewUrl && (
                    <button
                      type="button"
                      onClick={handleGeneratePhotoDescription}
                      disabled={isGeneratingAI}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-800 text-purple-300 text-xs font-semibold hover:bg-purple-900 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isGeneratingAI ? 'Generating AI Description...' : 'Generate AI Photo Reflection'}</span>
                    </button>
                  )}

                  {generatedAIDescription && (
                    <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200">
                      <strong>AI Description:</strong> {generatedAIDescription}
                    </div>
                  )}
                </div>
              )}

              {captureMode === 'video' && (
                <div className="p-4 rounded-2xl border border-neutral-800 bg-[#111416] space-y-4">
                  {mediaPreviewUrl ? (
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                        <video src={mediaPreviewUrl} controls className="w-full h-full object-cover" />
                        <button
                          onClick={() => setMediaPreviewUrl(null)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* AI Video Summary Button */}
                      <button
                        type="button"
                        onClick={handleGenerateVideoSummary}
                        disabled={isGeneratingAI}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{isGeneratingAI ? 'Generating Video Memory Summary...' : 'Generate AI Video Summary'}</span>
                      </button>

                      {/* AI Summary Review Card */}
                      {generatedAISummary && (
                        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 space-y-3 text-xs text-purple-100 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-300 text-sm">
                              {generatedAISummary.memoryTitle}
                            </span>
                            <span className="text-[10px] text-purple-400 font-mono">Gemini Video Intelligence</span>
                          </div>
                          <div>
                            <strong className="text-purple-300">What Happened:</strong> {generatedAISummary.whatHappened}
                          </div>
                          <div>
                            <strong className="text-purple-300">Key Moments:</strong>
                            <ul className="list-disc list-inside space-y-0.5 mt-1 text-purple-200/90">
                              {generatedAISummary.keyMoments?.map((km: string, idx: number) => (
                                <li key={idx}>{km}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong className="text-purple-300">Reflection:</strong> {generatedAISummary.reflection}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      {isRecordingVideo ? (
                        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800/50 space-y-3">
                          <div className="flex items-center justify-center gap-2 text-rose-400 font-mono font-bold text-lg animate-pulse">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span>Recording Video: 0:{videoTimer < 10 ? `0${videoTimer}` : videoTimer}</span>
                          </div>
                          <button
                            type="button"
                            onClick={stopVideoRecording}
                            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-all"
                          >
                            Stop & Process Video
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={startVideoRecording}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-all"
                          >
                            <Video className="w-4 h-4" />
                            <span>Record Video Journal</span>
                          </button>
                          <label className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer transition-all">
                            <Upload className="w-4 h-4" />
                            <span>Upload Video File</span>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleFileUpload(e, 'video')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Memory Details Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Memory Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Peaceful hike in the redwoods..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-[#76B900] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Description & Notes
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What happened? What were you feeling or realizing?"
                    rows={3}
                    className="w-full p-3 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-[#76B900] focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Mood
                    </label>
                    <select
                      value={newMood}
                      onChange={(e) => setNewMood(e.target.value as JournalMood)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-xs text-white focus:border-[#76B900] focus:outline-none"
                    >
                      <option value="Calm">🌿 Calm</option>
                      <option value="Energized">⚡ Energized</option>
                      <option value="Focused">🎯 Focused</option>
                      <option value="Grateful">🌸 Grateful</option>
                      <option value="Thoughtful">✨ Thoughtful</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-xs text-white focus:border-[#76B900] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="Nature, Travel, Milestone"
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-xs text-white focus:border-[#76B900] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsCaptureModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMemory}
                className="px-5 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                Save Memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MEMORY DETAIL MODAL */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedMemory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#14171A] border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#76B900] bg-[#76B900]/15 px-2 py-0.5 rounded-full font-bold">
                  {selectedMemory.mediaType} Memory
                </span>
                <h2 className="text-lg font-serif font-bold text-white mt-1">
                  {selectedMemory.title}
                </h2>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Display */}
            {selectedMemory.mediaUrl && (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                {selectedMemory.mediaType === 'photo' ? (
                  <img
                    src={selectedMemory.mediaUrl}
                    alt={selectedMemory.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <video src={selectedMemory.mediaUrl} controls className="w-full h-full object-cover" />
                )}
              </div>
            )}

            {/* Content & Metadata */}
            <div className="space-y-3 text-xs">
              <p className="text-neutral-300 leading-relaxed text-sm">
                {selectedMemory.description}
              </p>

              {selectedMemory.aiVideoSummary && (
                <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 space-y-2 text-purple-100">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Gemini Video Memory Synthesis</span>
                  </div>
                  <p className="text-xs">{selectedMemory.aiVideoSummary.memorySummary}</p>
                  <div className="pt-2 border-t border-purple-900/40 text-purple-200">
                    <strong>Mindful Reflection:</strong> {selectedMemory.aiVideoSummary.reflection}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 text-neutral-400">
                {selectedMemory.mood && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Mood: {selectedMemory.mood}
                  </span>
                )}
                {selectedMemory.location && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedMemory.location.name}
                  </span>
                )}
                {selectedMemory.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <button
                onClick={(e) => deleteMemory(selectedMemory.id, e)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/50 text-rose-300 hover:bg-rose-900 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Memory</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real Video Recorder Modal */}
      <RealVideoRecorderModal
        isOpen={isRealVideoRecorderOpen}
        onClose={() => setIsRealVideoRecorderOpen(false)}
        onSaveMemory={(mem) => {
          setMemoriesList((prev) => [mem, ...prev]);
        }}
      />
    </div>
  );
};
