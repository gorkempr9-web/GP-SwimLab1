import { TextStyle } from 'react-native';

export const colors = {
  background: '#021526',
  backgroundDeep: '#020A14',
  surface: 'rgba(7, 35, 61, 0.82)',
  surfaceSolid: '#07233D',
  surfaceSoft: '#0A2C48',
  glass: 'rgba(255, 255, 255, 0.07)',
  cyan: '#21E6F3',
  cyanSoft: 'rgba(33, 230, 243, 0.14)',
  teal: '#14B8A6',
  text: '#F8FCFF',
  muted: '#9BB4C8',
  mutedStrong: '#C6D6E2',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(33, 230, 243, 0.36)',
  gold: '#FBBF24',
  goldSoft: 'rgba(251, 191, 36, 0.14)',
  danger: '#FB7185',
  dangerSoft: 'rgba(251, 113, 133, 0.11)',
  success: '#34D399',
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
  borderColor: colors.border,
  borderRadius: radii.lg,
};

export const gradients = {
  app: [colors.backgroundDeep, colors.background, '#052D45'] as const,
  hero: ['rgba(12, 229, 232, 0.28)', 'rgba(8, 42, 68, 0.88)', 'rgba(251, 191, 36, 0.12)'] as const,
  fallback: ['rgba(12, 229, 232, 0.2)', 'rgba(6, 31, 53, 0.92)'] as const,
};
