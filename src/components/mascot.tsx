
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
        {/* Head */}
        <ellipse cx="75" cy="70" rx="40" ry="35" fill="#DEB887" stroke="#8B4513" strokeWidth="2.5" />
        
        {/* Rosy Cheeks */}
        <ellipse cx="50" cy="75" rx="8" ry="6" fill="#FFC0CB" opacity="0.6" stroke="none" />
        <ellipse cx="100" cy="75" rx="8" ry="6" fill="#FFC0CB" opacity="0.6" stroke="none" />

        {/* Button Eyes */}
        <circle cx="65" cy="65" r="5" fill="#4a3b2b" stroke="#3b2e21" strokeWidth="1"/>
        <path d="M 63 63 L 67 67 M 67 63 L 63 67" stroke="#9a8b7b" strokeWidth="0.8"/>
        <circle cx="85" cy="65" r="5" fill="#4a3b2b" stroke="#3b2e21" strokeWidth="1"/>
        <path d="M 83 63 L 87 67 M 87 63 L 83 67" stroke="#9a8b7b" strokeWidth="0.8"/>

        {/* Mouth */}
        <path d="M 65,85 Q 75,95 85,85" stroke="#5C2E00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 65 85 L 63 88 M 75 95 L 75 98 M 85 85 L 87 88" stroke="#5C2E00" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Hat */}
        <path d="M 25,50 C 25,30 50,20 75,20 C 100,20 125,30 125,50 L 115,48 C 115,40 95,32 75,32 C 55,32 35,40 35,48 Z" fill="#A0522D" stroke="#6B4226" strokeWidth="3" />
        <path d="M 50,22 C 50,15 65,10 75,10 C 85,10 100,15 100,22 L 95,22 L 55,22 Z" fill="#8B4513" stroke="#5C2E00" strokeWidth="3" />
        
        {/* Hat Patch */}
        <rect x="90" y="35" width="15" height="10" fill="#D2B48C" stroke="#8B4513" strokeWidth="1.5" rx="2" />
        <path d="M 92 37 L 95 43 M 98 37 L 95 43" stroke="#8B4513" strokeWidth="1.5" />

        {/* Body */}
        <path d="M 40 100 H 110 L 105 160 H 45 Z" fill="#ADD8E6" stroke="#4682B4" strokeWidth="2.5"/>
        {/* Plaid Pattern */}
        <path d="M 40 120 H 110 M 40 140 H 110 M 60 100 V 160 M 90 100 V 160" stroke="#4682B4" strokeWidth="1.5" opacity="0.6"/>

         {/* Collar */}
        <path d="M 60 100 L 50 110 L 75 105 L 100 110 L 90 100" fill="none" stroke="#F4E07C" strokeWidth="4" strokeLinecap="round"/>

        {/* Arms (straw) */}
        <g stroke="#F4D03F" strokeWidth="3" strokeLinecap="round">
          <path d="M 40 115 L 5 130" />
          <path d="M 40 115 L 0 115" />
          <path d="M 40 115 L 10 100" />
          <path d="M 110 115 L 145 130" />
          <path d="M 110 115 L 150 115" />
          <path d="M 110 115 L 140 100" />
        </g>

        {/* Legs */}
        <path d="M 45 160 L 50 210 H 65 L 60 160 Z" fill="#4169E1" stroke="#2c4c85" strokeWidth="2.5" />
        <path d="M 95 160 L 100 210 H 85 L 90 160 Z" fill="#4169E1" stroke="#2c4c85" strokeWidth="2.5" />

        {/* Straw from legs */}
         <g stroke="#F4D03F" strokeWidth="3" strokeLinecap="round">
            <path d="M 52 210 L 45 220" />
            <path d="M 58 210 L 60 220" />
            <path d="M 63 210 L 70 218" />

            <path d="M 87 210 L 80 218" />
            <path d="M 92 210 L 95 220" />
            <path d="M 98 210 L 105 220" />
        </g>
      </g>
    </svg>
  );
}
