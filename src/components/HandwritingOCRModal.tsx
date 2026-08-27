import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { OCRResult } from '../types';

interface HandwritingOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText: (text: string, mode: 'append' | 'replace') => void;
}

export const HandwritingOCRModal: React.FC<HandwritingOCRModalProps> = ({
  isOpen,
  onClose,
  onApplyText
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPEG, WEBP).');
      return;
    }

    setMimeType(file.type);
    setError(null);
    setOcrResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imagePreview) return;

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch('/api/journal/ocr-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'OCR processing failed.');
      }

      const result: OCRResult = await response.json();
      setOcrResult(result);
      setEditedText(result.transcribedText || '');
    } catch (err: any) {
      console.error('OCR Error:', err);
      setError(err.message || 'Could not recognize text from this image. Please ensure handwriting is clear.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopy = () => {
    if (!editedText) return;
    navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setImagePreview(null);
    setOcrResult(null);
    setEditedText('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0B0D0E] border border-[#22272B] shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-white overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1F2428] bg-[#0E1012]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111416] border border-[#76B900]/40 flex items-center justify-center text-[#76B900] shadow-[0_0_12px_rgba(118,185,0,0.2)]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Handwritten Journal OCR
                <span className="text-[10px] font-mono font-bold uppercase bg-[#76B900]/15 text-[#8FE000] px-2 py-0.5 rounded-md border border-[#76B900]/40">
                  Gemini Vision
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Scan or photograph your physical notebook to convert handwritten pages into digital reflections.
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {!imagePreview ? (
            /* Upload Zone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#22272B] hover:border-[#76B900] rounded-2xl p-10 text-center cursor-pointer bg-[#111416]/60 hover:bg-[#111416] transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-14 h-14 rounded-2xl bg-[#171A1C] border border-[#2B3238] group-hover:border-[#76B900]/50 flex items-center justify-center mx-auto text-neutral-400 group-hover:text-[#76B900] transition-all mb-3 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-xs font-semibold text-white mb-1">
                Click or drag a photo of your handwritten journal page here
              </p>
              <p className="text-[11px] text-neutral-400">
                Supports JPG, PNG, WEBP from camera snapshot or scan
              </p>
            </div>
          ) : (
            /* Scanning & Result View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Image Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-white">Source Page Photo</span>
                  <button
                    onClick={handleReset}
                    className="text-xs text-[#76B900] hover:text-[#8FE000] transition-colors"
                  >
                    Change Photo
                  </button>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-[#22272B] bg-[#0E1012] max-h-[300px] flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Journal Page"
                    className="max-h-[300px] w-full object-contain"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                      <div className="w-7 h-7 border-2 border-[#76B900] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-[#8FE000]">Transcribing handwriting with Gemini...</span>
                    </div>
                  )}
                </div>

                {!ocrResult && !isScanning && (
                  <button
                    onClick={handleScan}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(118,185,0,0.25)] active:scale-98"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Transcribe Handwriting Now</span>
                  </button>
                )}
              </div>

              {/* Right Column: Transcription Output */}
              <div className="space-y-3 flex flex-col">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#76B900]" />
                    Recognized Text
                  </span>
                  {ocrResult && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#76B900]/15 text-[#8FE000] border border-[#76B900]/40">
                      CONFIDENCE: {ocrResult.confidence.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col min-h-[220px]">
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    placeholder={isScanning ? 'Transcribing text...' : 'Your transcribed text will appear here. You can review and edit before inserting into your journal.'}
                    rows={10}
                    className="w-full flex-1 p-3.5 rounded-xl bg-[#111416] border border-[#22272B] focus:border-[#76B900] text-neutral-100 text-xs focus:outline-none resize-none font-sans leading-relaxed transition-colors"
                  />
                </div>

                {ocrResult?.notes && (
                  <p className="text-[11px] text-neutral-400 italic">
                    AI Note: {ocrResult.notes}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {ocrResult && (
          <div className="px-6 py-4 border-t border-[#1F2428] bg-[#0E1012] flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111416] hover:bg-[#171A1C] border border-[#22272B] text-neutral-300 text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#8FE000]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onApplyText(editedText, 'append');
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#171A1C] hover:bg-[#22272B] border border-[#2B3238] text-white text-xs font-semibold transition-colors"
              >
                Append to Entry
              </button>
              <button
                onClick={() => {
                  onApplyText(editedText, 'replace');
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold transition-colors shadow-[0_0_15px_rgba(118,185,0,0.25)]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Insert as Main Text</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
