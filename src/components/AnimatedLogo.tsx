import React from 'react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showWordmark?: boolean;
  isLooping?: boolean;
  className?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = 'md',
  showWordmark = true,
  isLooping = true,
  className = '',
}) => {
  const dimensions = {
    sm: { w: 26, h: 26, fontSize: 'text-sm font-semibold tracking-tight' },
    md: { w: 34, h: 34, fontSize: 'text-base font-semibold tracking-tight' },
    lg: { w: 48, h: 48, fontSize: 'text-xl font-bold tracking-tight' },
    hero: { w: 68, h: 68, fontSize: 'text-2xl font-bold tracking-tight' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(139,92,246,0.35)]"
        style={{ width: dimensions.w, height: dimensions.h }}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Linear gradient for document outline and scan beam */}
            <linearGradient id="docGradient" x1="8" y1="3" x2="28" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            <linearGradient id="scanBeamGradient" x1="10" y1="12" x2="26" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
            </linearGradient>

            <radialGradient id="lensReflect" cx="22" cy="21" r="7" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0D1122" stopOpacity="0.8" />
            </radialGradient>
          </defs>

          {/* 1. Document Outline draws itself */}
          <path
            d="M8 5C8 3.89543 8.89543 3 10 3H20L28 11V31C28 32.1046 27.1046 33 26 33H10C8.89543 33 8 32.1046 8 31V5Z"
            stroke="url(#docGradient)"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isLooping ? 'anim-doc-dark' : ''}
          />
          {/* Folded corner */}
          <path
            d="M20 3V11H28"
            stroke="#8B5CF6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />

          {/* Placeholder document lines */}
          <rect x="12" y="15" width="10" height="1.5" rx="0.75" fill="#475569" opacity="0.45" />
          
          {/* 4. Small cyan highlight appears on detected text */}
          <rect
            x="12"
            y="19"
            width="12"
            height="1.75"
            rx="0.875"
            className={isLooping ? 'anim-highlight-cyan' : 'fill-cyan-400'}
          />
          <rect x="12" y="24" width="7" height="1.5" rx="0.75" fill="#475569" opacity="0.4" />

          {/* 3. Violet-blue scanning line moves across document */}
          <line
            x1="9"
            y1="12"
            x2="27"
            y2="12"
            stroke="url(#scanBeamGradient)"
            strokeWidth="1.75"
            strokeLinecap="round"
            className={isLooping ? 'anim-scan-dark' : 'opacity-0'}
          />

          {/* 2. Lens appears & 5. Pulses */}
          <g className={isLooping ? 'anim-lens-dark' : ''}>
            {/* Lens aperture back fill */}
            <circle
              cx="22"
              cy="21"
              r="6.5"
              fill="url(#lensReflect)"
              stroke="#8B5CF6"
              strokeWidth="1.8"
            />
            {/* Inner cyan focus ring */}
            <circle
              cx="22"
              cy="21"
              r="4.2"
              stroke="#22D3EE"
              strokeWidth="1.2"
              strokeDasharray="3 2"
              opacity="0.85"
            />
            {/* Lens handle */}
            <path
              d="M26.8 25.8L31.5 30.5"
              stroke="#06B6D4"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Lens optical glint */}
            <circle cx="20.2" cy="19.2" r="1" fill="#FFFFFF" opacity="0.9" />
          </g>
        </svg>
      </div>

      {showWordmark && (
        <div className="flex items-center tracking-tight font-sans">
          <span className={`text-slate-100 font-semibold ${dimensions.fontSize}`}>
            Contract<span className="text-gradient-brand font-bold">Lens</span>
          </span>
        </div>
      )}
    </div>
  );
};
