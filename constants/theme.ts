import { Platform } from 'react-native';

// Brand tint used by the tab bar
const tintColorLight = '#0F766E';
const tintColorDark = '#2DD4BF';

export const Colors = {
  light: {
    // Existing (kept for tab bar)
    text: '#111827',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    // Brand
    primary: '#0F766E',
    primaryDark: '#115E59',

    // Semantic
    success: '#2A9D8F',
    danger: '#E63946',
    warning: '#F4A261',

    // Surfaces
    surface: '#F9F9F9',
    surfaceAlt: '#F5F5F5',
    border: '#EEEEEE',
    borderStrong: '#CCCCCC',

    // Text variations
    textMuted: '#666666',
    textLight: '#999999',
    textOnPrimary: '#FFFFFF',

    // States
    disabled: '#94A3B8',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    primary: '#2DD4BF',
    primaryDark: '#14B8A6',

    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',

    surface: '#1F2937',
    surfaceAlt: '#111827',
    border: '#374151',
    borderStrong: '#4B5563',

    textMuted: '#9CA3AF',
    textLight: '#6B7280',
    textOnPrimary: '#FFFFFF',

    disabled: '#4B5563',
  },
};

// Category swatches users can pick from
export const CategoryColours = [
  '#E63946', '#F4A261', '#E9C46A', '#2A9D8F',
  '#457B9D', '#6D597A', '#B5838D', '#264653',
];

export const CategoryIcons = ['📖', '📚', '🚀', '👤', '💡', '🎭', '🔬', '🗺️', '❤️', '⚔️'];

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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});