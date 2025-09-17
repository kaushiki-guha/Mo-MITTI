
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
        <path d="M 20,50 C 20,30 50,25 75,25 C 100,25 130,30 130,50 L 110,48 C 110,40 95,35 75,35 C 55,35 40,40 40,48 Z" fill="#A0522D" stroke="#5C2E00" strokeWidth="2.5" />
        <path d="M 45,28 C 45,20 60,15 75,15 C 90,15 105,20 105,28 L 100,28 L 50,28 Z" fill="#8B4513" stroke="#5C2E00" strokeWidth="2.5" />

        {/* Head */}
        <ellipse cx="75" cy="70" rx="35" ry="30" fill="#DEB887" stroke="#8B4513" strokeWidth="2" />
        <path d="M 60 65 L 68 73 M 68 65 L 60 73" stroke="#5C2E00" strokeWidth="3" strokeLinecap="round" />
        <path d="M 82 65 L 90 73 M 90 65 L 82 73" stroke="#5C2E00" strokeWidth="3" strokeLinecap="round" />
        <path d="M 65,85 Q 75,95 85,85" stroke="#5C2E00" strokeWidth="2" strokeLinecap="round" />
        <path d="M 70 85 L 72 82 M 75 85 L 77 82 M 80 85 L 82 82" stroke="#5C2E00" strokeWidth="1" strokeLinecap="round" />

        {/* Body */}
        <path d="M 40 100 H 110 L 105 160 H 45 Z" fill="#ADD8E6" stroke="#4682B4" strokeWidth="2"/>
        {/* Plaid Pattern */}
        <path d="M 40 120 H 110 M 40 140 H 110 M 60 100 V 160 M 90 100 V 160" stroke="#4682B4" strokeWidth="1" opacity="0.6"/>

         {/* Collar */}
        <path d="M 60 100 L 50 110 L 75 105 L 100 110 L 90 100" fill="none" stroke="#F0E68C" strokeWidth="4" strokeLinecap="round"/>


        {/* Arms (straw) */}
        <g stroke="#F0E68C" strokeWidth="3" strokeLinecap="round">
          <path d="M 40 115 L 5 130" />
          <path d="M 40 115 L 0 115" />
          <path d="M 40 115 L 10 100" />
          <path d="M 110 115 L 145 130" />
          <path d="M 110 115 L 150 115" />
          <path d="M 110 115 L 140 100" />
        </g>

        {/* Legs */}
        <path d="M 45 160 L 50 210 H 65 L 60 160 Z" fill="#4682B4" stroke="#2c516d" strokeWidth="2" />
        <path d="M 95 160 L 100 210 H 85 L 90 160 Z" fill="#4682B4" stroke="#2c516d" strokeWidth="2" />

        {/* Straw from legs */}
         <g stroke="#F0E68C" strokeWidth="3" strokeLinecap="round">
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
