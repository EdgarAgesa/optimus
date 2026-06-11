import React from 'react';

// Outline iconography (stroke = currentColor, no fills) — replaces native emoji
// per the monochrome Runway treatment. Size via className (w-/h-), color via text-*.
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const HeadphonesIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
    <rect x="3" y="14" width="4" height="6" rx="2" />
    <rect x="17" y="14" width="4" height="6" rx="2" />
  </svg>
);

export const TvIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <rect x="3" y="5" width="18" height="12" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

export const PhoneIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <rect x="7" y="2" width="10" height="20" rx="2.5" />
    <path d="M10.5 18.5h3" />
  </svg>
);

export const LaptopIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <rect x="4" y="4" width="16" height="11" rx="1.5" />
    <path d="M2 19h20l-1.5-3h-17z" />
  </svg>
);

export const GamepadIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M6 9h12a4 4 0 0 1 4 4v2a3 3 0 0 1-3 3c-1.2 0-2.3-.6-2.9-1.6L15.5 15h-7l-.6 1.4A3.4 3.4 0 0 1 5 18a3 3 0 0 1-3-3v-2a4 4 0 0 1 4-4z" />
    <path d="M8 11.5v3M6.5 13h3M16 12h.01M18 14h.01" />
  </svg>
);

export const StarIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z" />
  </svg>
);

export const TruckIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M2 6h12v10H2zM14 9h4l3 3v4h-7z" />
    <circle cx="6" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </svg>
);

export const MobilePayIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <rect x="6" y="2" width="12" height="20" rx="2.5" />
    <path d="M10 12h4M12 10v4M9.5 19h5" />
  </svg>
);

export const CheckCircleIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
);
