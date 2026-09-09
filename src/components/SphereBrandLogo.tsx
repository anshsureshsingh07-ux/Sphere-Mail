import React from 'react';

interface SphereBrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const SphereBrandLogo: React.FC<SphereBrandLogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconDimensions = size === 'sm' ? 26 : size === 'lg' ? 42 : 32;

  return (
    <div className="flex items-center gap-2.5 select-none" id="sphere-brand-logo">
      {/* Futuristic Sphere Emblem */}
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: iconDimensions, height: iconDimensions }}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-purple-400 opacity-90 blur-[2px] animate-pulse" />
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#181926] via-[#0f1017] to-[#0a0a0f] border border-violet-400/40 flex items-center justify-center shadow-lg shadow-violet-950/50">
          {/* Inner orbit core */}
          <div className="w-1/2 h-1/2 rounded-full border border-violet-300/60 flex items-center justify-center bg-violet-600/20">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
          </div>
          {/* Planetary rings */}
          <div className="absolute w-[115%] h-[40%] rounded-full border border-indigo-400/40 -rotate-25 pointer-events-none" />
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className="font-extrabold tracking-tight text-white text-base sm:text-lg flex items-center">
            Sphere
            <span className="text-violet-400 ml-1 font-semibold">Mail</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-500/20">
            Loopin
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-400 tracking-wide font-medium mt-0.5">
            Your mail for Sphere
          </span>
        )}
      </div>
    </div>
  );
};
