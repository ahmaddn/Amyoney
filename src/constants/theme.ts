/**
 * Color Themes and Currency Palette Definitions for Amyoney
 */
import { Platform } from 'react-native';

export type ColorPreset = 'forest' | 'sapphire' | 'obsidian' | 'terracotta';

export const PalettePresets: Record<
  ColorPreset,
  {
    name: string;
    lightPrimary: string;
    lightAccent: string;
    lightHeroBg: string;
    lightHeroText: string;
    lightHeroAccent: string;
    lightBg: string;
    lightBgElement: string;
    lightBgSelected: string;
    lightBorder: string;
    lightIncome: string;
    lightIncomeBg: string;
    lightText: string;
    lightTextSecondary: string;
    darkPrimary: string;
    darkAccent: string;
    darkHeroBg: string;
    darkHeroText: string;
    darkHeroAccent: string;
    darkBg: string;
    darkBgElement: string;
    darkBgSelected: string;
    darkBorder: string;
    darkIncome: string;
    darkIncomeBg: string;
    darkText: string;
    darkTextSecondary: string;
  }
> = {
  forest: {
    name: 'Emerald Forest',
    lightPrimary: '#173D32',
    lightAccent: '#C9F36A',
    lightHeroBg: '#173D32',
    lightHeroText: '#F7F8F5',
    lightHeroAccent: '#C9F36A',
    lightBg: '#F7F8F5',
    lightBgElement: '#FFFFFF',
    lightBgSelected: '#EEF1EB',
    lightBorder: '#E5E9E3',
    lightIncome: '#173D32',
    lightIncomeBg: '#E9F5EE',
    lightText: '#1B241E',
    lightTextSecondary: '#66776E',
    darkPrimary: '#C9F36A',
    darkAccent: '#C9F36A',
    darkHeroBg: '#132B23',
    darkHeroText: '#F7F8F5',
    darkHeroAccent: '#C9F36A',
    darkBg: '#111614',
    darkBgElement: '#1A221E',
    darkBgSelected: '#26322C',
    darkBorder: '#28322C',
    darkIncome: '#C9F36A',
    darkIncomeBg: '#173D32',
    darkText: '#F5F7F4',
    darkTextSecondary: '#8B948E',
  },
  sapphire: {
    name: 'Royal Sapphire',
    lightPrimary: '#0F2847',
    lightAccent: '#0284C7',
    lightHeroBg: '#0F2847',
    lightHeroText: '#F0F9FF',
    lightHeroAccent: '#38BDF8',
    lightBg: '#F0F4F8',
    lightBgElement: '#FFFFFF',
    lightBgSelected: '#E0E8F0',
    lightBorder: '#D0DCE7',
    lightIncome: '#0369A1',
    lightIncomeBg: '#E0F2FE',
    lightText: '#0F1E2E',
    lightTextSecondary: '#5A6F84',
    darkPrimary: '#38BDF8',
    darkAccent: '#38BDF8',
    darkHeroBg: '#091A30',
    darkHeroText: '#F0F9FF',
    darkHeroAccent: '#38BDF8',
    darkBg: '#0B131E',
    darkBgElement: '#132030',
    darkBgSelected: '#1C2E42',
    darkBorder: '#233852',
    darkIncome: '#38BDF8',
    darkIncomeBg: '#0F2847',
    darkText: '#F0F6FC',
    darkTextSecondary: '#8A9EB5',
  },
  obsidian: {
    name: 'Midnight Obsidian',
    lightPrimary: '#12161A',
    lightAccent: '#D97706',
    lightHeroBg: '#12161A',
    lightHeroText: '#FFFBEB',
    lightHeroAccent: '#F59E0B',
    lightBg: '#F5F5F7',
    lightBgElement: '#FFFFFF',
    lightBgSelected: '#EAEBEF',
    lightBorder: '#DCDEE4',
    lightIncome: '#B45309',
    lightIncomeBg: '#FEF3C7',
    lightText: '#181A1F',
    lightTextSecondary: '#6B7280',
    darkPrimary: '#F59E0B',
    darkAccent: '#F59E0B',
    darkHeroBg: '#16191D',
    darkHeroText: '#FFFBEB',
    darkHeroAccent: '#F59E0B',
    darkBg: '#0F1215',
    darkBgElement: '#1B1E24',
    darkBgSelected: '#282C35',
    darkBorder: '#303640',
    darkIncome: '#F59E0B',
    darkIncomeBg: '#2E2211',
    darkText: '#F9FAFB',
    darkTextSecondary: '#9CA3AF',
  },
  terracotta: {
    name: 'Nordic Terracotta',
    lightPrimary: '#3B2219',
    lightAccent: '#EA580C',
    lightHeroBg: '#3B2219',
    lightHeroText: '#FFF7ED',
    lightHeroAccent: '#FB923C',
    lightBg: '#F9F5F3',
    lightBgElement: '#FFFFFF',
    lightBgSelected: '#F1E9E4',
    lightBorder: '#E7DDD7',
    lightIncome: '#C2410C',
    lightIncomeBg: '#FFEDD5',
    lightText: '#261712',
    lightTextSecondary: '#78645C',
    darkPrimary: '#FB923C',
    darkAccent: '#FB923C',
    darkHeroBg: '#271610',
    darkHeroText: '#FFF7ED',
    darkHeroAccent: '#FB923C',
    darkBg: '#16110F',
    darkBgElement: '#241A16',
    darkBgSelected: '#352721',
    darkBorder: '#42312A',
    darkIncome: '#FB923C',
    darkIncomeBg: '#3B2219',
    darkText: '#FFF5F0',
    darkTextSecondary: '#B09A90',
  },
};

export const Colors = {
  light: {
    brandPrimary: '#173D32',
    brandAccent: '#C9F36A',
    heroBg: '#173D32',
    heroText: '#F7F8F5',
    heroAccent: '#C9F36A',
    text: '#202722',
    textSecondary: '#7B827D',
    background: '#F7F8F5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF1EB',
    border: '#E5E9E3',
    card: '#FFFFFF',
    income: '#173D32',
    incomeBg: '#E9F5EE',
    expense: '#C66B53',
    expenseBg: '#FAF0ED',
    primary: '#173D32',
    primaryText: '#FFFFFF',
    accentText: '#173D32',
  },
  dark: {
    brandPrimary: '#C9F36A',
    brandAccent: '#C9F36A',
    heroBg: '#132B23',
    heroText: '#F7F8F5',
    heroAccent: '#C9F36A',
    text: '#F5F7F4',
    textSecondary: '#8B948E',
    background: '#111614',
    backgroundElement: '#1A221E',
    backgroundSelected: '#26322C',
    border: '#28322C',
    card: '#1A221E',
    income: '#C9F36A',
    incomeBg: '#173D32',
    expense: '#E58A73',
    expenseBg: '#3A1E17',
    primary: '#C9F36A',
    primaryText: '#111614',
    accentText: '#111614',
  },
};

export type AppThemeColors = Record<keyof typeof Colors.light, string>;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
