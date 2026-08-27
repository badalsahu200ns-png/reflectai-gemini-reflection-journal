import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Image as ImageIcon,
  FileText,
  Compass,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { JournalAttachment, ImageAnalysisResult } from '../types';

interface ImageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: JournalAttachment | null;
  journalContextText?: string;
  onApplyAnalysisToJournal?: (textToAppend: string) => void;
  onUpdateCaption?: (attachmentId: string, newCaption: string) => void;
}

export const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({
  isOpen,
  onClose,
  attachment,
  journalContextText = '',
  onApplyAnalysisToJournal,
  onUpdateCaption
}) => {
  const [analysisMode, setAnalysisMode] = useState<'describe' | 'connect' | 'extract_text'>('connect');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState<string>(attachment?.caption || '');

  if (!isOpen || !attachment) return null;

  const handleAnalyze = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/journal/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: attachment.url,
          mimeType: attachment.mimeType || 'image/jpeg',
          analysisMode,
          contextText: journalContextText
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ImageAnalysisResult = await response.json();
      setResult(data);

      if (data.suggestedCaption && !captionInput) {
        setCaptionInput(data.suggestedCaption);
      }
    } catch (err: any) {
      console.error('Image analysis failed:', err);
      setErrorMessage(err?.message || 'Failed to analyze image with Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCaption = () => {
    if (onUpdateCaption && attachment.id) {
      onUpdateCaption(attachment.id, captionInput.trim());
    }
  };

  const handleAppendToEntry = () => {
    if (!result || !onApplyAnalysisToJournal) return;

    let textToAppend = '';
    if (result.connection) {
      textToAppend = `\n\n**Visual Context & Photo Reflection:**\n${result.connection}`;
    } else if (result.summary) {
      textToAppend = `\n\n**Photo Note:**\n${result.summary}`;
    } else if (result.extractedText) {
      textToAppend = `\n\n**Text from Photo:**\n${result.extractedText}`;
    }

    if (textToAppend) {
      onApplyAnalysisToJournal(textToAppend);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0B0D0E] border border-[#22272B] shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-white overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1F2428] bg-[#0E1012]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#111416] border border-[#76B900]/40 flex items-center justify-center text-[#76B900] shadow-[0_0_12px_rgba(118,185,0,0.2)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Visual Memory Reflection</h3>
              <p className="text-xs text-neutral-400">
                Gemini Vision analyzes the atmosphere, scene, and connection to your thoughts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#111416] border border-[#22272B] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image Preview & Caption Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative rounded-xl overflow-hidden bg-[#111416] border border-[#1F2428] aspect-4/3 flex items-center justify-center">
              <img
                src={attachment.url}
                alt={attachment.name || 'Journal attachment'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#76B900]" />
                  Photo Caption
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={captionInput}
                    onChange={(e) => setCaptionInput(e.target.value)}
                    placeholder="Add a mindful caption..."
                    className="flex-1 bg-[#111416] border border-[#22272B] focus:border-[#76B900] rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none"
                  />
                  {onUpdateCaption && (
                    <button
                      type="button"
                      onClick={handleApplyCaption}
                      className="px-2.5 py-2 rounded-xl bg-[#171A1C] hover:bg-[#22272B] border border-[#2B3238] text-xs font-medium text-neutral-300 hover:text-white"
                      title="Save Caption"
                    >
                      <Check className="w-3.5 h-3.5 text-[#8FE000]" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  {attachment.name} • {Math.round((attachment.sizeBytes || 1024) / 1024)} KB
                </p>
              </div>

              {/* Analysis Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Analysis Intent</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#111416] border border-[#1F2428]">
                  <button
                    type="button"
                    onClick={() => setAnalysisMode('connect')}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      analysisMode === 'connect'
                        ? 'bg-[#76B900] text-black font-bold shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Connect
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalysisMode('describe')}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      analysisMode === 'describe'
                        ? 'bg-[#76B900] text-black font-bold shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Describe
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalysisMode('extract_text')}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      analysisMode === 'extract_text'
                        ? 'bg-[#76B900] text-black font-bold shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Read Text
                  </button>
                </div>
              </div>

              {/* Run Analysis Trigger Button */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black font-bold text-xs transition-all shadow-[0_0_20px_rgba(118,185,0,0.25)] active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze with Gemini Vision</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AI Analysis Result Card */}
          {result && (
            <div className="p-4 rounded-xl bg-[#111416] border border-[#76B900]/30 space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#1F2428] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#76B900] uppercase">
                    ReflectAI Visual Reflection
                  </span>
                  {result.mood && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#171A1C] border border-[#2B3238] text-neutral-300 font-medium">
                      Mood: {result.mood}
                    </span>
                  )}
                </div>
                {result.suggestedCaption && (
                  <span className="text-[11px] text-neutral-400 italic">
                    "{result.suggestedCaption}"
                  </span>
                )}
              </div>

              {result.connection && (
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#8FE000]" />
                    Connection to your journal:
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed pl-5 font-sans">
                    {result.connection}
                  </p>
                </div>
              )}

              {result.summary && (
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#76B900]" />
                    Visual Atmosphere & Highlights:
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed pl-5 font-sans">
                    {result.summary}
                  </p>
                </div>
              )}

              {result.extractedText && (
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-300" />
                    Extracted Text:
                  </h4>
                  <pre className="p-3 rounded-lg bg-[#0B0D0E] border border-[#1F2428] text-xs text-neutral-200 font-mono whitespace-pre-wrap">
                    {result.extractedText}
                  </pre>
                </div>
              )}

              {result.visualHighlights && result.visualHighlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.visualHighlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#171A1C] border border-[#22272B] text-neutral-300"
                    >
                      • {highlight}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#1F2428] bg-[#0E1012]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#111416] hover:bg-[#171A1C] border border-[#22272B] text-xs font-medium text-neutral-400 hover:text-white"
          >
            Close
          </button>

          {result && onApplyAnalysisToJournal && (
            <button
              type="button"
              onClick={handleAppendToEntry}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(118,185,0,0.25)] active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Append Reflection to Journal</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
