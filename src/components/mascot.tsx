
import * as React from 'react';

export function Mascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 150 220"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <g transform="translate(5, 5)">
        {/* Hat */}
        <path d="M 40 50 Q 70 35, 100 50 L 120 45 Q 70 20, 20 45 Z" fill="#D2B48C" stroke="#8B4513" />
        <path d="M 50 48 L 50 30 Q 70 25, 90 30 L 90 48 Z" fill="#D2B48C" stroke="#8B4513" />
        
        {/* Head */}
        <ellipse cx="70" cy="65" rx="25" ry="20" fill="#FFD700" stroke="#DAA520" />
        <path d="M 55 65 h 30" stroke="#8B4513" strokeDasharray="4 2" />
        <path d="M 60 60 L 62 62 M 62 60 L 60 62" stroke="#8B4513" strokeLinecap="round"/>
        <path d="M 78 60 L 80 62 M 80 60 L 78 62" stroke="#8B4513" strokeLinecap="round"/>

        {/* Body */}
        <path d="M 45 85 C 55 90, 85 90, 95 85 L 100 130 H 40 Z" fill="#F0E68C" stroke="#BDB76B" />

        {/* Collar */}
        <path d="M 60 85 L 50 95 L 70 90 L 90 95 L 80 85" fill="#F0E68C" stroke="#BDB76B" />

        {/* Arms (straw) */}
        <g stroke="#D2B48C">
          <path d="M 45 100 L 10 110" />
          <path d="M 45 100 L 5 100" />
          <path d="M 45 100 L 15 90" />
          <path d="M 95 100 L 130 110" />
          <path d="M 95 100 L 135 100" />
          <path d="M 95 100 L 125 90" />
        </g>
        
        {/* Legs */}
        <path d="M 40 130 L 45 200 H 60 L 55 130 Z" fill="#A9A9A9" stroke="#696969" />
        <path d="M 85 130 L 90 200 H 75 L 80 130 Z" fill="#A9A9A9" stroke="#696969" />

        {/* Grass */}
        <g stroke="#8B4513" transform="translate(0, 200)">
            <path d="M 20 0 C 25 10, 35 10, 40 0" />
            <path d="M 40 0 C 45 15, 55 15, 60 0" />
            <path d="M 60 0 C 65 10, 75 10, 80 0" />
            <path d="M 80 0 C 85 15, 95 15, 100 0" />
            <path d="M 100 0 C 105 10, 115 10, 120 0" />
        </g>
      </g>
    </svg>
  );
}
