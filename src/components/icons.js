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

export const CartIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
    <path d="M3 4h2l2.5 11h10L20 7H6" />
  </svg>
);

export const TrashIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
  </svg>
);

export const ChatIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
    <path d="M9 11h.01M12.5 11h.01M16 11h.01" />
  </svg>
);

export const SearchIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l5 5" />
  </svg>
);

export const ShareIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <circle cx="6" cy="12" r="2.2" /><circle cx="17" cy="6" r="2.2" /><circle cx="17" cy="18" r="2.2" />
    <path d="M8 11l7-4M8 13l7 4" />
  </svg>
);

export const DocIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M7 3h7l4 4v14H7zM14 3v4h4" />
    <path d="M10 12h5M10 16h5" />
  </svg>
);

export const GearIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9L19 19M19 5l-2.1 2.1M7.1 16.9L5 19" />
  </svg>
);

export const PinIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const PhoneCallIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);

export const CardIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <rect x="2.5" y="6" width="19" height="13" rx="2" />
    <path d="M2.5 10h19M6 15h4" />
  </svg>
);

export const BagIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M5 8h14l-1 13H6zM8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
  </svg>
);

export const HeartIcon = ({ className = '' }) => (
  <svg {...base} className={className}>
    <path d="M12 20s-7.5-4.9-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 11c-1.8 4.1-9.3 9-9.3 9z" />
  </svg>
);
