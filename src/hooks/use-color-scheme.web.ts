import { useAppTheme } from '@/context/theme-context';

export function useColorScheme(): 'light' | 'dark' {
  const { resolvedTheme } = useAppTheme();
  return resolvedTheme ?? 'light';
}
