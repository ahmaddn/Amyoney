/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { AppThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

export function useTheme(): AppThemeColors {
  const { colors } = useAppTheme();
  return colors;
}
