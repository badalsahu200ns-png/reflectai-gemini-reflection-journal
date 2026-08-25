import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, X, Check, Search, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { JournalLocation } from '../types';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: JournalLocation | null;
  onSelectLocation: (loc: JournalLocation | null) => void;
}

const POPULAR_MINDFUL_SPOTS = [
  { name: 'Home Sanctuary', lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
  { name: 'Botanical Gardens', lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
  { name: 'Mountain Overlook', lat: 40.0150, lng: -105.2705, address: 'Boulder, CO' },
  { name: 'Seaside Promenade', lat: 21.3069, lng: -157.8583, address: 'Honolulu, HI' },
  { name: 'Kyoto Bamboo Grove', lat: 35.0116, lng: 135.7681, address: 'Kyoto, Japan' },
  { name: 'Central Library Atrium', lat: 47.6062, lng: -122.3321, address: 'Seattle, WA' }
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
            setPlaceName(data.name || `GPS (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
            setAddress(data.address || '');
          } else {
            setPlaceName(`GPS Coordinate (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
          }
        } catch {
          setPlaceName(`GPS Coordinate (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        setErrorMsg('Unable to retrieve GPS location. You can enter a custom location name below.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 text-white space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Location-Aware Reflection</h3>
              <p className="text-xs text-neutral-400">Tag your journal entry with physical or mindful coordinates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="space-y-3">
          <button
            onClick={handleGetCurrentLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-700/50 text-purple-200 text-xs font-semibold transition-all shadow-sm"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                Detecting GPS Location...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-purple-400" />
                Detect My Current Location
              </>
            )}
          </button>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Custom Place Details */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Place or Sanctuary Name</label>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Kyoto Zen Garden, Mountain Cabin, Home Study"
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">City or Address (Optional)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Tokyo, Japan or Pacific Coast Highway"
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 text-xs"
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
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Quick Suggestion Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-neutral-400 font-medium">Quick Suggestions:</span>
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
                className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 border border-neutral-700/60 transition-colors"
              >
                📍 {spot.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
          >
            Remove Location
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow"
            >
              <Check className="w-3.5 h-3.5" />
              Save Location
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
