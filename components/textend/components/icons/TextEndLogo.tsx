import React from 'react';

export interface TextEndLogoProps {
  className?: string;
  iconOnly?: boolean;
  accentColor?: string;
  isDark?: boolean;
  onClick?: () => void;
}

export const TextEndLogo: React.FC<TextEndLogoProps> = ({ 
  className = "h-7", 
  iconOnly = false,
  accentColor = "text-indigo-400",
  isDark = true,
  onClick
}) => {
  const iconColor = isDark ? "text-white" : "text-[#1f7a3e]";
  const textColor = isDark ? "text-white" : "text-[#111827]";

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group hover:opacity-85 transition-opacity' : ''} ${className}`}
    >
      {/* Geometric polyhedron / 3D box icon */}
      <div className={`relative w-6 h-6 flex-shrink-0 ${iconColor} flex items-center justify-center`}>
        <svg
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <polygon points="14 2 24.5 8 24.5 20 14 26 3.5 20 3.5 8" strokeOpacity="0.95" />
          <polyline points="14 2 14 14 24.5 8" strokeOpacity="0.85" />
          <polyline points="14 14 3.5 8" strokeOpacity="0.85" />
          <polyline points="14 14 14 26" strokeOpacity="0.85" />
          <polyline points="14 2 3.5 20" strokeOpacity="0.35" />
          <polyline points="14 2 24.5 20" strokeOpacity="0.35" />
          <polyline points="3.5 8 24.5 20" strokeOpacity="0.3" />
          <polyline points="24.5 8 3.5 20" strokeOpacity="0.3" />
        </svg>
      </div>

      {!iconOnly && (
        <span className={`font-bold text-[19px] tracking-tight ${textColor} font-sans flex items-center`}>
          Text<span className={accentColor}>End</span>
        </span>
      )}
    </div>
  );
};

export const StealthWriterLogo = TextEndLogo;
