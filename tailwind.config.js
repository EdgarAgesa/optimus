/** @type {import('tailwindcss').Config} */
// SINGLE SOURCE OF DESIGN TRUTH — spec docs/superpowers/specs/2026-06-11-premium-redesign-design.md §4
// Default Tailwind color & shadow palettes are intentionally REMOVED:
// any value not defined here fails to exist => the no-ad-hoc-values law is build-enforced.
// Token additions after Phase 1 MUST be added here (named) and flagged in phase summaries.
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  corePlugins: {
    preflight: false, // coexistence with legacy CSS-file styling (spec §2.4); revisit Phase 5
  },
  theme: {
    // FULL OVERRIDE (not extend): only tokens exist.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      ink: {
        950: '#06161b', // deepest canvas — hero, footer
        900: '#0d2b33', // page canvas (brand dark)
        800: '#123a45', // card surface / elevation 1
        700: '#1a4a57', // hover surface / elevation 2
      },
      teal: {
        500: '#00bcd4', // primary accent, CTAs, active
        600: '#0097a7', // pressed / deep accent
      },
      accent: '#e63946',   // SALE / deals / destructive / error ONLY (spec red rules)
      warn: '#e8b339',     // warnings — badges/form hints only, never large surfaces
      whatsapp: '#25D366', // WhatsApp affordance ONLY — always with ink-950 text
      edge: 'rgba(0,188,212,0.14)', // the single border color
      fg: {
        hi: '#ffffff',   // primary text       → text-fg-hi
        mid: '#9fb6bc',  // secondary text     → text-fg-mid
        low: '#7d99a1',  // tertiary/metadata  → text-fg-low
      },
    },
    // Zero-shadow law (spec §4 Elevation): the ONLY shadows that exist.
    boxShadow: {
      none: 'none',
      'glow-featured': '0 0 24px rgba(0,188,212,0.25)',
    },
    // Full override: the ONLY backdrop blur (sticky nav, D5). No default-scale values.
    backdropBlur: {
      nav: '8px',
    },
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    fontSize: {
      // [size, { lineHeight, letterSpacing, fontWeight }] — Runway tightness, Minimax scale
      'display-xl': ['clamp(2.5rem, 8vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-2px', fontWeight: '600' }],
      display: ['2.5rem', { lineHeight: '1.05', letterSpacing: '-1.2px', fontWeight: '600' }],
      heading: ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '600' }],
      'card-title': ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],
      body: ['0.9375rem', { lineHeight: '1.5' }],
      label: ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.35px', fontWeight: '500' }], // pair with `uppercase`
      micro: ['0.6875rem', { lineHeight: '1.3' }],
      price: ['1.125rem', { lineHeight: '1.3', fontWeight: '700' }], // the only 700 in the system
    },
    borderRadius: {
      none: '0',
      xs: '4px',
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',   // standard card
      '2xl': '24px',
      feat: '32px', // featured card — the 32/16 pairing is the "moment" signal
      full: '9999px', // every button/pill/badge
    },
    extend: {
      backgroundImage: {
        'glow-teal': 'radial-gradient(circle, rgba(0,188,212,0.35) 0%, rgba(0,188,212,0) 70%)',
        'grad-gaming': 'linear-gradient(160deg, #00bcd4 0%, #0097a7 55%, #0d2b33 100%)',
        'grad-audio': 'linear-gradient(160deg, #007a8a 0%, #06161b 100%)',
        'grad-deals': 'linear-gradient(160deg, #e63946 0%, #8f1d27 100%)',
        'grad-phones': 'linear-gradient(160deg, #3ddbe8 0%, #0097a7 100%)',
      },
      // spacing: default Tailwind scale already covers the approved 4..96 ladder
      // (p-1=4px ... p-24=96px). No override needed; do NOT use arbitrary values.
    },
  },
  plugins: [],
};
