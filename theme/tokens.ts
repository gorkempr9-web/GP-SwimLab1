import { TextStyle } from 'react-native';
import { palette } from '@/theme/colors';

export const colors = {
  background: palette.navy900,
  backgroundDeep: palette.navy950,
  surface: palette.card,
  surfaceSolid: palette.cardSolid,
  surfaceSoft: '#F1F5F9',
  glass: 'rgba(255, 255, 255, 0.72)',
  cyan: palette.cyan,
  cyanSoft: 'rgba(56, 189, 248, 0.14)',
  blue: palette.sportBlue,
  blueSoft: 'rgba(56, 189, 248, 0.14)',
  info: '#38BDF8',
  infoSoft: 'rgba(56, 189, 248, 0.14)',
  coral: palette.coral,
  coralSoft: 'rgba(249, 115, 22, 0.13)',
  violet: palette.violet,
  violetSoft: 'rgba(139, 92, 246, 0.13)',
  teal: '#0F766E',
  text: palette.text,
  muted: palette.muted,
  mutedStrong: '#475569',
  border: 'rgba(30, 58, 95, 0.10)',
  borderStrong: 'rgba(30, 58, 95, 0.14)',
  gold: palette.gold,
  goldSoft: 'rgba(251, 191, 36, 0.14)',
  danger: palette.danger,
  dangerSoft: 'rgba(239, 68, 68, 0.12)',
  success: palette.success,
  successSoft: 'rgba(34, 197, 94, 0.13)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 22,
  xl: 34,
};

export const typography: Record<string, TextStyle> = {
  hero: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '900',
    letterSpacing: 0,
  },
  h1: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: 0,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export const card = {
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.borderStrong,
  borderRadius: radii.xl,
};

export const gradients = {
  app: [colors.background, '#EFF6FF', '#F8FAFC'] as const,
  hero: ['rgba(56, 189, 248, 0.18)', '#FFFFFF', 'rgba(139, 92, 246, 0.10)'] as const,
  fallback: ['rgba(56, 189, 248, 0.10)', '#FFFFFF', 'rgba(248, 250, 252, 0.96)'] as const,
};
