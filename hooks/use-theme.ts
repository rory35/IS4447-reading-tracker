import { useContext } from 'react';
import { AppContext } from '@/app/_layout';
import { Colors } from '@/constants/theme';

export function useTheme() {
  const { themeMode, toggleTheme } = useContext(AppContext);
  return {
    C: themeMode === 'dark' ? Colors.dark : Colors.light,
    themeMode,
    toggleTheme,
  };
}