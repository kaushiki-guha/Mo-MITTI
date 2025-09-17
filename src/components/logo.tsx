
import * as React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 170 32"
      height="28"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="24"
        fontFamily="'Poppins', sans-serif"
        fontSize="24"
        fontWeight="600"
        fill="currentColor"
      >
        MoMITTI
      </text>
      <path
        d="M160 28 C 158 20, 162 14, 168 12"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
