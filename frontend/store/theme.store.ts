// store/theme.store.ts
import { create } from 'zustand';
import { useColorScheme } from 'react-native';
import * as SecureStore from "expo-secure-store";

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  isLoaded: boolean;
  setTheme: (theme: Theme) => void;
  loadTheme: () => Promise<void>;
  getActiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'system',
  isLoaded: false,
  
  loadTheme: async () => {
    try {
      const savedTheme = await SecureStore.getItem('theme');
      if (savedTheme) {
        set({ theme: savedTheme as Theme, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      set({ isLoaded: true });
    }
  },
  
  setTheme: async (theme: Theme) => {
    try {
      await SecureStore.setItem('theme', theme);
      set({ theme });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },
  
  getActiveTheme: () => {
    const { theme } = get();
    const systemTheme = useColorScheme();
    return theme === 'system' ? systemTheme || 'light' : theme;
  },
}));