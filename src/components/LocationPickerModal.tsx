import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Navigation,
  X,
  Check,
  Search,
  Globe,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { JournalLocation } from '../types';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: JournalLocation | null;
  onSelectLocation: (loc: JournalLocation | null) => void;
}

const POPULAR_MINDFUL_SPOTS = [
  { name: 'Home Sanctuary', lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
  { name: 'Mountain Overlook', lat: 40.0150, lng: -105.2705, address: 'Boulder, CO' },
  { name: 'Botanical Gardens', lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
  { name: 'Kyoto Bamboo Grove', lat: 35.0116, lng: 135.7681, address: 'Kyoto, Japan' },
  { name: 'Central Park Meadow', lat: 40.7829, lng: -73.9654, address: 'New York, NY' },
  { name: 'Oceanfront Trail', lat: 36.6002, lng: -121.8947, address: 'Monterey, CA' }
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation
}) => {
  const [placeName, setPlaceName] = useState(currentLocation?.name || '');
  const [address, setAddress] = useState(currentLocation?.address || '');
  const [lat, setLat] = useState<number>(currentLocation?.lat || 37.7749);
  const [lng, setLng] = useState<number>(currentLocation?.lng || -122.4194);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude);
        setLng(longitude);

        try {
          const res = await fetch('/api/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lng: longitude })
          });

          if (res.ok) {
            const data = await res.json();
            setPlaceName(data.name || `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
            setAddress(data.address || '');
          } else {
            setPlaceName(`GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
          }
        } catch {
          setPlaceName(`GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        setErrorMsg('Unable to retrieve GPS location. You can enter a custom sanctuary or city name below.');
      },
      { timeout: 8000 }
    );
  };

  const handleSave = () => {
    if (!placeName.trim()) {
      onSelectLocation(null);
    } else {
      onSelectLocation({
        name: placeName.trim(),
        lat: Number(lat) || 37.7749,
        lng: Number(lng) || -122.4194,
        address: address.trim() || undefined
      });
    }
    onClose();
  };

  const handleClear = () => {
    onSelectLocation(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-[#0B0D0E] border border-[#22272B] shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 text-white space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2428] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111416] border border-[#76B900]/40 flex items-center justify-center text-[#76B900] shadow-[0_0_12px_rgba(118,185,0,0.2)]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Location-Aware Reflection</h3>
              <p className="text-xs text-neutral-400">
                Anchor your reflection in a physical sanctuary or place.
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

        {/* GPS Quick Action */}
        <div className="space-y-3">
          <button
            onClick={handleGetCurrentLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#111416] hover:bg-[#171A1C] border border-[#76B900]/40 text-[#8FE000] text-xs font-semibold transition-all shadow-[0_0_15px_rgba(118,185,0,0.1)] active:scale-98"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#76B900]" />
                <span>Locating with GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-[#76B900]" />
                <span>Detect Current Coordinates (GPS)</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Custom Place Details */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Place or Sanctuary Name</label>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Kyoto Zen Garden, Home Office, Mountain Ridge"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#111416] border border-[#22272B] text-white placeholder-neutral-500 focus:outline-none focus:border-[#76B900] text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">City or Address (Optional)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Kyoto, Japan or Boulder, CO"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#111416] border border-[#22272B] text-white placeholder-neutral-500 focus:outline-none focus:border-[#76B900] text-xs transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[#111416] border border-[#22272B] text-neutral-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[#111416] border border-[#22272B] text-neutral-300 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Quick Suggestion Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-neutral-400 font-semibold">Mindful Sanctuary Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_MINDFUL_SPOTS.map((spot) => (
              <button
                key={spot.name}
                type="button"
                onClick={() => {
                  setPlaceName(spot.name);
                  setAddress(spot.address);
                  setLat(spot.lat);
                  setLng(spot.lng);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#111416] hover:bg-[#171A1C] text-[11px] text-neutral-300 border border-[#22272B] hover:border-[#76B900]/40 transition-colors"
              >
                📍 {spot.name}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-xl bg-[#111416] border border-[#1F2428] flex items-start gap-2.5 text-[11px] text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-[#76B900] shrink-0 mt-0.5" />
          <span>
            <strong className="text-neutral-200">Privacy Guarantee:</strong> Location is completely optional and is stored only in your encrypted user partition when you explicitly attach it. Administrators never see exact locations.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-[#1F2428] pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-neutral-400 hover:text-rose-400 transition-colors"
          >
            Remove Location
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-[#111416] hover:bg-[#171A1C] border border-[#22272B] text-neutral-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(118,185,0,0.25)] active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Attach Location</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
