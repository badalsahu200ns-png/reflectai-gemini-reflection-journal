import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  RotateCcw,
  Check,
  X,
  Upload,
  AlertCircle,
  Sparkles,
  RefreshCw,
  User
} from 'lucide-react';

interface CameraAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAvatar: (photoDataUrl: string) => Promise<void> | void;
  currentPhotoURL?: string | null;
}

export const CameraAvatarModal: React.FC<CameraAvatarModalProps> = ({
  isOpen,
  onClose,
  onSaveAvatar,
  currentPhotoURL
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream when modal opens
  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, cameraFacing]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCapturing(true);

    // Stop any existing stream first
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((err) => {
          console.warn('Auto-play blocked, manual click needed:', err);
        });
      }
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      let message = 'Unable to access camera. Please check camera permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device found on this system.';
      }
      setCameraError(message);
    } finally {
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Square crop centered
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;

    // Mirror if front-facing camera
    if (cameraFacing === 'user') {
      ctx.translate(400, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleSave = async () => {
    if (!capturedPhoto) return;
    setIsSaving(true);
    try {
      await onSaveAvatar(capturedPhoto);
      onClose();
    } catch (err) {
      console.error('Failed to save avatar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        ctx.drawImage(img, startX, startY, size, size, 0, 0, 400, 400);
        const croppedData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(croppedData);
        stopCamera();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-[#14171A] border border-[#22272B] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#22272B]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#76B900]/15 text-[#8FE000]">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Device Camera Avatar</h3>
                <p className="text-[11px] text-neutral-400">Take a photo to personalize your profile</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col items-center justify-center space-y-5">
            {/* Viewfinder / Captured Photo Frame */}
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-[#76B900]/50 bg-black shadow-inner flex items-center justify-center">
              {capturedPhoto ? (
                <img
                  src={capturedPhoto}
                  alt="Captured Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : cameraError ? (
                <div className="p-6 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs text-neutral-300 font-medium">{cameraError}</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-[#22272B] hover:bg-[#333B42] text-xs text-white transition-colors"
                  >
                    Retry Camera
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraFacing === 'user' ? '-scale-x-100' : ''}`}
                  />
                  {isCapturing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </>
              )}

              {/* Viewfinder Target Guide Overlay */}
              {!capturedPhoto && !cameraError && (
                <div className="absolute inset-0 border border-white/20 rounded-full pointer-events-none" />
              )}
            </div>

            {/* Hidden Canvas for capture processing */}
            <canvas ref={canvasRef} className="hidden" />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Controls */}
            {!capturedPhoto ? (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    title="Flip camera"
                    className="p-3 rounded-full bg-[#1F2428] hover:bg-[#2A3138] text-neutral-300 border border-[#333B42] transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCapture}
                    disabled={Boolean(cameraError) || isCapturing}
                    className="px-6 py-3 rounded-full bg-[#76B900] hover:bg-[#8FE000] text-black font-bold text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload existing photo"
                    className="p-3 rounded-full bg-[#1F2428] hover:bg-[#2A3138] text-neutral-300 border border-[#333B42] transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-neutral-500">Center your face in the circular viewfinder</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex-1 py-2.5 rounded-xl bg-[#1F2428] hover:bg-[#2A3138] text-neutral-200 border border-[#333B42] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Set as Avatar'}</span>
                  </button>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">Photo ready to apply to your profile</span>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="px-6 py-3 bg-[#0E1012] border-t border-[#22272B] text-center text-[11px] text-neutral-500">
            Photos are saved privately to your encrypted profile in Cloud Firestore.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
