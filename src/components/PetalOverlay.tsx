import React, { useMemo } from 'react';
import { JournalThemeId } from '../types';

interface PetalOverlayProps {
  themeId: JournalThemeId;
  isDark?: boolean;
  reducedMotion?: boolean;
}

interface ParticleItem {
  id: number;
  type: 'petal' | 'leaf' | 'particle' | 'glow';
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
  rotation: number;
  color: string;
  driftX: string;
}

export const PetalOverlay: React.FC<PetalOverlayProps> = ({
  themeId,
  isDark = false,
  reducedMotion = false
}) => {
  // If reduced motion is requested by system or user, do not render moving particles
  if (reducedMotion) {
    return null;
  }

  // Pre-generate stable particle positions strictly distributed along the perimeter/margins
  const particles: ParticleItem[] = useMemo(() => {
    // 12-16 lightweight decorative items strictly placed in perimeter zones (left, right, top, bottom-corners)
    const positions: { left: string; top: string; driftX: string }[] = [
      // Left edge zone
      { left: '2%', top: '10%', driftX: '18px' },
      { left: '4%', top: '28%', driftX: '24px' },
      { left: '1.5%', top: '52%', driftX: '15px' },
      { left: '5%', top: '76%', driftX: '20px' },
      { left: '3%', top: '92%', driftX: '14px' },
      // Right edge zone
      { left: '94%', top: '8%', driftX: '-18px' },
      { left: '96%', top: '32%', driftX: '-22px' },
      { left: '93%', top: '58%', driftX: '-16px' },
      { left: '95%', top: '80%', driftX: '-20px' },
      { left: '92%', top: '94%', driftX: '-15px' },
      // Top ambient corners
      { left: '15%', top: '3%', driftX: '12px' },
      { left: '82%', top: '4%', driftX: '-12px' },
      // Bottom ambient corners
      { left: '12%', top: '96%', driftX: '16px' },
      { left: '86%', top: '95%', driftX: '-16px' }
    ];

    const getColors = (tId: JournalThemeId) => {
      switch (tId) {
        case 'rose-garden':
        case 'rose':
          return isDark
            ? ['#F43F5E', '#FB7185', '#FDA4AF', '#E11D48']
            : ['#FB7185', '#F43F5E', '#FDA4AF', '#FECDD3'];
        case 'lavender-dream':
        case 'twilight':
          return isDark
            ? ['#A78BFA', '#8B5CF6', '#C4B5FD', '#7C3AED']
            : ['#8B5CF6', '#C4B5FD', '#A78BFA', '#DDD6FE'];
        case 'sunset-bloom':
        case 'sepia':
          return isDark
            ? ['#FB923C', '#F97316', '#FDBA74', '#F59E0B']
            : ['#FB923C', '#F97316', '#FDBA74', '#FDE047'];
        case 'botanical-serenity':
        case 'emerald':
        case 'monochrome':
          return isDark
            ? ['#34D399', '#10B981', '#6EE7B7', '#059669']
            : ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];
        case 'sakura-breeze':
        case 'ocean':
        default:
          return isDark
            ? ['#EC4899', '#F472B6', '#DB2777', '#7DD3FC']
            : ['#F472B6', '#FBCFE8', '#EC4899', '#BAE6FD'];
      }
    };

    const colors = getColors(themeId);

    return positions.map((pos, idx) => {
      const type: 'petal' | 'leaf' | 'particle' | 'glow' =
        themeId === 'botanical-serenity'
          ? (idx % 3 === 0 ? 'leaf' : idx % 2 === 0 ? 'petal' : 'particle')
          : themeId === 'lavender-dream'
          ? (idx % 3 === 0 ? 'glow' : 'petal')
          : 'petal';

      return {
        id: idx,
        type,
        left: pos.left,
        top: pos.top,
        size: 10 + (idx % 4) * 4,
        delay: `${(idx * 0.75).toFixed(1)}s`,
        duration: `${14 + (idx % 5) * 3}s`,
        opacity: isDark ? 0.35 + (idx % 3) * 0.15 : 0.45 + (idx % 3) * 0.15,
        rotation: (idx * 37) % 360,
        color: colors[idx % colors.length],
        driftX: pos.driftX
      };
    });
  }, [themeId, isDark]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none transition-opacity duration-500"
      aria-hidden="true"
    >
      <style>{`
        @keyframes gentleFloat {
          0% {
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-24px) translateX(var(--drift-x, 15px)) rotate(18deg) scale(1.06);
          }
          100% {
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
          }
        }
        @keyframes sakuraBreeze {
          0% {
            transform: translateY(-10px) translateX(0px) rotate(0deg);
          }
          50% {
            transform: translateY(18px) translateX(var(--drift-x, 26px)) rotate(35deg);
          }
          100% {
            transform: translateY(-10px) translateX(0px) rotate(0deg);
          }
        }
        @keyframes softGlowPulse {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.9);
          }
          50% {
            opacity: 0.65;
            transform: scale(1.2);
          }
        }
        .anim-gentle-float {
          animation: gentleFloat linear infinite;
          will-change: transform;
        }
        .anim-sakura-breeze {
          animation: sakuraBreeze ease-in-out infinite;
          will-change: transform;
        }
        .anim-soft-glow {
          animation: softGlowPulse ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>

      {particles.map((p) => {
        const animClass =
          themeId === 'sakura-breeze' || themeId === 'ocean'
            ? 'anim-sakura-breeze'
            : p.type === 'glow'
            ? 'anim-soft-glow'
            : 'anim-gentle-float';

        return (
          <div
            key={p.id}
            className={`absolute ${animClass}`}
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size * (p.type === 'leaf' ? 1.6 : 1.2)}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: p.opacity,
              ['--drift-x' as any]: p.driftX
            }}
          >
            {p.type === 'leaf' ? (
              // Botanical Leaf Shape
              <svg
                viewBox="0 0 24 36"
                className="w-full h-full drop-shadow-xs"
                style={{ transform: `rotate(${p.rotation}deg)` }}
              >
                <path
                  d="M12 0 C20 10 24 24 12 36 C0 24 4 10 12 0 Z"
                  fill={p.color}
                />
                <path
                  d="M12 3 L12 33"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            ) : p.type === 'glow' ? (
              // Soft Glowing Particle
              <div
                className="w-full h-full rounded-full blur-[2px]"
                style={{
                  backgroundColor: p.color,
                  boxShadow: `0 0 12px ${p.color}`
                }}
              />
            ) : (
              // Romantic / Sakura / Peach Petal Shape
              <svg
                viewBox="0 0 24 28"
                className="w-full h-full drop-shadow-xs"
                style={{ transform: `rotate(${p.rotation}deg)` }}
              >
                <path
                  d="M12 2 C18 2 23 8 22 18 C21 24 16 27 12 27 C8 27 3 24 2 18 C1 8 6 2 12 2 Z"
                  fill={p.color}
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};
