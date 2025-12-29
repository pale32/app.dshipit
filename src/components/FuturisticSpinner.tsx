"use client"

interface FuturisticSpinnerProps {
  size?: number;
  className?: string;
}

export function FuturisticSpinner({ size = 20, className = "" }: FuturisticSpinnerProps) {
  return (
    <div 
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ring */}
      <div 
        className="absolute inset-0 border-2 border-transparent border-t-cyan-300 border-r-violet-300 rounded-full animate-spin"
        style={{ 
          animationDuration: '1.5s',
          animationTimingFunction: 'linear'
        }}
      />
      
      {/* Inner ring */}
      <div 
        className="absolute inset-1 border-2 border-transparent border-b-blue-400 border-l-indigo-400 rounded-full animate-spin"
        style={{ 
          animationDuration: '1s',
          animationTimingFunction: 'linear',
          animationDirection: 'reverse'
        }}
      />
      
      {/* Core dot */}
      <div 
        className="absolute top-1/2 left-1/2 w-1 h-1 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
        style={{
          animationDuration: '2s'
        }}
      />
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 border border-transparent rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      />
    </div>
  );
}