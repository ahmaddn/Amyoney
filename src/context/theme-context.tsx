import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { AppThemeColors, ColorPreset, Colors, PalettePresets } from '@/constants/theme';
import { FAVICON_DATA_URIS } from '@/constants/favicons';
import { CurrencyCode, setActiveCurrency as setGlobalCurrency } from '@/utils/format';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  colorPreset: ColorPreset;
  currency: CurrencyCode;
  colors: AppThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  setColorPreset: (preset: ColorPreset) => void;
  setCurrency: (currency: CurrencyCode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  resolvedTheme: 'light',
  colorPreset: 'forest',
  currency: 'IDR',
  colors: Colors.light,
  setThemeMode: () => {},
  setColorPreset: () => {},
  setCurrency: () => {},
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = 'amyoney_theme_mode';
const PRESET_STORAGE_KEY = 'amyoney_color_preset';
const CURRENCY_STORAGE_KEY = 'amyoney_currency';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme() ?? 'light';
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [colorPreset, setColorPresetState] = useState<ColorPreset>('forest');
  const [currency, setCurrencyState] = useState<CurrencyCode>('IDR');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
        if (savedTheme && (savedTheme === 'system' || savedTheme === 'light' || savedTheme === 'dark')) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setThemeModeState(savedTheme);
        }

        const savedPreset = window.localStorage.getItem(PRESET_STORAGE_KEY) as ColorPreset | null;
        if (savedPreset && PalettePresets[savedPreset]) {
          setColorPresetState(savedPreset);
        }

        const savedCurr = window.localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
        if (savedCurr) {
          setCurrencyState(savedCurr);
          setGlobalCurrency(savedCurr);
        }
      }
    } catch {
      // Storage access fallback
    }
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
      }
    } catch {
      // Storage fallback
    }
  };

  const resolvedTheme: 'light' | 'dark' =
    themeMode === 'system' ? deviceColorScheme : themeMode;

  const updateWebFaviconAndTheme = React.useCallback((preset: ColorPreset) => {
    if (typeof document === 'undefined') return;
    try {
      // Perbarui favicon dinamis sesuai warna preset tema aktif menggunakan data URI
      const dataUri = FAVICON_DATA_URIS[preset] || FAVICON_DATA_URIS.forest;
      
      // Hapus atau perbarui semua elemen icon rel agar browser mendeteksi perubahan seketika
      const existingIcons = document.querySelectorAll("link[rel*='icon']");
      if (existingIcons.length > 0) {
        existingIcons.forEach((el) => {
          (el as HTMLLinkElement).href = dataUri;
          (el as HTMLLinkElement).type = 'image/png';
        });
      } else {
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.type = 'image/png';
        faviconLink.href = dataUri;
        document.getElementsByTagName('head')[0].appendChild(faviconLink);
      }

      // Perbarui warna status bar browser mobile
      const presetData = PalettePresets[preset] || PalettePresets.forest;
      let metaTheme = document.querySelector("meta[name='theme-color']") as HTMLMetaElement | null;
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.getElementsByTagName('head')[0].appendChild(metaTheme);
      }
      metaTheme.content = resolvedTheme === 'dark' ? presetData.darkHeroBg : presetData.lightHeroBg;
    } catch {
      // Ignore if not in DOM environment
    }
  }, [resolvedTheme]);

  useEffect(() => {
    updateWebFaviconAndTheme(colorPreset);
  }, [colorPreset, updateWebFaviconAndTheme]);

  const setColorPreset = (preset: ColorPreset) => {
    setColorPresetState(preset);
    updateWebFaviconAndTheme(preset);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(PRESET_STORAGE_KEY, preset);
      }
    } catch {
      // Storage fallback
    }
  };

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    setGlobalCurrency(code);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(CURRENCY_STORAGE_KEY, code);
      }
    } catch {
      // Storage fallback
    }
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('light');
    }
  };

  // Hitung token warna dinamis secara menyeluruh berdasarkan mode dan preset
  const basePalette = resolvedTheme === 'dark' ? Colors.dark : Colors.light;
  const presetConfig = PalettePresets[colorPreset] || PalettePresets.forest;

  const dynamicColors = {
    ...basePalette,
    brandPrimary: resolvedTheme === 'dark' ? presetConfig.darkPrimary : presetConfig.lightPrimary,
    brandAccent: resolvedTheme === 'dark' ? presetConfig.darkAccent : presetConfig.lightAccent,
    primary: resolvedTheme === 'dark' ? presetConfig.darkPrimary : presetConfig.lightPrimary,
    heroBg: resolvedTheme === 'dark' ? presetConfig.darkHeroBg : presetConfig.lightHeroBg,
    heroText: resolvedTheme === 'dark' ? presetConfig.darkHeroText : presetConfig.lightHeroText,
    heroAccent: resolvedTheme === 'dark' ? presetConfig.darkHeroAccent : presetConfig.lightHeroAccent,
    background: resolvedTheme === 'dark' ? presetConfig.darkBg : presetConfig.lightBg,
    backgroundElement: resolvedTheme === 'dark' ? presetConfig.darkBgElement : presetConfig.lightBgElement,
    backgroundSelected: resolvedTheme === 'dark' ? presetConfig.darkBgSelected : presetConfig.lightBgSelected,
    border: resolvedTheme === 'dark' ? presetConfig.darkBorder : presetConfig.lightBorder,
    card: resolvedTheme === 'dark' ? presetConfig.darkBgElement : presetConfig.lightBgElement,
    income: resolvedTheme === 'dark' ? presetConfig.darkIncome : presetConfig.lightIncome,
    incomeBg: resolvedTheme === 'dark' ? presetConfig.darkIncomeBg : presetConfig.lightIncomeBg,
    expense: resolvedTheme === 'dark' ? presetConfig.darkAccent : presetConfig.lightPrimary,
    expenseBg: resolvedTheme === 'dark' ? presetConfig.darkBgSelected : presetConfig.lightBgSelected,
    text: resolvedTheme === 'dark' ? presetConfig.darkText : presetConfig.lightText,
    textSecondary: resolvedTheme === 'dark' ? presetConfig.darkTextSecondary : presetConfig.lightTextSecondary,
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedTheme,
        colorPreset,
        currency,
        colors: dynamicColors,
        setThemeMode,
        setColorPreset,
        setCurrency,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
