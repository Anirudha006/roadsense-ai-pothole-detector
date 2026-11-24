import { COLOR_TOKENS, SEVERITY_COLORS } from '@roadsense/shared';
import type { SeverityLevel } from '@roadsense/shared';

/**
 * CSS custom property declarations for light-vibrant theme
 */
export const CSS_VARIABLES: Record<string, string> = {
  '--bg': COLOR_TOKENS.bg,
  '--surface': COLOR_TOKENS.surface,
  '--primary': COLOR_TOKENS.primary,
  '--primary-soft': COLOR_TOKENS.primarySoft,
  '--accent': COLOR_TOKENS.accent,
  '--sun': COLOR_TOKENS.sun,
  '--coral': COLOR_TOKENS.coral,
  '--success': COLOR_TOKENS.success,
  '--text': COLOR_TOKENS.text,
  '--muted': COLOR_TOKENS.muted,
  '--border': COLOR_TOKENS.border,
};

/**
 * Tailwind CSS color configuration object for Tailwind v3
 */
export const TAILWIND_THEME_COLORS = {
  roadsense: {
    bg: COLOR_TOKENS.bg,
    surface: COLOR_TOKENS.surface,
    primary: COLOR_TOKENS.primary,
    'primary-soft': COLOR_TOKENS.primarySoft,
    accent: COLOR_TOKENS.accent,
    sun: COLOR_TOKENS.sun,
    coral: COLOR_TOKENS.coral,
    success: COLOR_TOKENS.success,
    text: COLOR_TOKENS.text,
    muted: COLOR_TOKENS.muted,
    border: COLOR_TOKENS.border,
  },
};

export const SHADOWS = {
  card: '0 8px 30px rgba(20, 184, 166, 0.12)',
  cardHover: '0 12px 36px rgba(20, 184, 166, 0.18)',
  alert: '0 10px 40px rgba(251, 113, 133, 0.25)',
  floating: '0 6px 20px rgba(15, 42, 46, 0.10)',
} as const;

export const RADIUS = {
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  full: '9999px',
} as const;

export const TYPOGRAPHY = {
  fontHeading: "'Plus Jakarta Sans', 'Poppins', sans-serif",
  fontBody: "'Inter', sans-serif",
} as const;

/**
 * Helper returning hex color and background styling for a given severity level.
 */
export function getSeverityStyle(level: SeverityLevel): {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
} {
  switch (level) {
    case 'critical':
      return {
        color: COLOR_TOKENS.coral,
        bgColor: 'rgba(251, 113, 133, 0.15)',
        borderColor: COLOR_TOKENS.coral,
        label: 'Critical Hazard',
      };
    case 'medium':
      return {
        color: COLOR_TOKENS.sun,
        bgColor: 'rgba(251, 191, 36, 0.18)',
        borderColor: COLOR_TOKENS.sun,
        label: 'Moderate Warning',
      };
    case 'low':
    default:
      return {
        color: COLOR_TOKENS.success,
        bgColor: 'rgba(52, 211, 153, 0.15)',
        borderColor: COLOR_TOKENS.success,
        label: 'Minor Defect',
      };
  }
}
