import * as React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 32"
      height="32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="24"
        fontFamily="sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="currentColor"
      >
        MO
      </text>
      <g transform="translate(48, 4)" stroke="currentColor" strokeWidth="1" fill="none">
        <path d="M 0,22 C 5,-2 20,-2 10,25" strokeDasharray="30" strokeDashoffset="0" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="30" to="0" dur="1s" fill="freeze" />
        </path>
        <g strokeLinecap="round">
            <path d="M 1.5,13.5 C 3.5,12.5 5.5,13.5 5.5,13.5" />
            <path d="M 3,10 C 5,9 7,10 7,10" />
            <path d="M 4.5,6.5 C 6.5,5.5 8.5,6.5 8.5,6.5" />
            <path d="M 6.5,3 C 8.5,2 10.5,3 10.5,3" />

            <path d="M 7.5,16.5 C 5.5,17.5 3.5,16.5 3.5,16.5" />
            <path d="M 9,19 C 7,20 5,19 5,19" />
            <path d="M 10,22.5 C 8,23.5 6,22.5 6,22.5" />
        </g>
      </g>
      <text
        x="78"
        y="24"
        fontFamily="sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="currentColor"
      >
        MITTI
      </text>
    </svg>
  );
}
