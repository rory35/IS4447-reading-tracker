import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useEffect, useState } from 'react';
import 'react-native-reanimated';
import { eq } from 'drizzle-orm';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { seedDatabaseIfEmpty } from '../db/seed';
import { db } from '@/db/client';
import { user_books, books, categories } from '@/db/schema';
import { getSession, clearSession } from '../lib/auth';

export type BookRow = {
  user_books: { id: number; user_id: number; book_id: number; category_id: number };
  books: { id: number; title: string; author: string; total_pages: number; isbn: string | null };
  categories: { id: number; name: string; colour: string; icon: string };
};

export type Category = {
  id: number;
  name: string;
  colour: string;
  icon: string;
  user_id: number;
};

export type ThemeMode = 'light' | 'dark';

type AppContextType = {
  currentUserId: number | null;
  setCurrentUserId: (id: number | null) => void;
  logout: () => Promise<void>;
  books: BookRow[];
  categories: Category[];
  refreshBooks: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  themeMode: ThemeMode;
  toggleTheme: () => Promise<void>;
};

export const AppContext = createContext<AppContextType>({
  currentUserId: null,
  setCurrentUserId: () => {},
  logout: async () => {},
  books: [],
  categories: [],
  refreshBooks: async () => {},
  refreshCategories: async () => {},
  themeMode: 'light',
  toggleTheme: async () => {},
});

export const unstable_settings = {
  anchor: '(tabs)',
};

const THEME_KEY = 'themeMode';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [bookRows, setBookRows] = useState<BookRow[]>([]);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const refreshBooks = async () => {
    if (currentUserId === null) return;
    const result = await db
      .select()
      .from(user_books)
      .innerJoin(books, eq(user_books.book_id, books.id))
      .innerJoin(categories, eq(user_books.category_id, categories.id))
      .where(eq(user_books.user_id, currentUserId));
    setBookRows(result as BookRow[]);
  };

  const refreshCategories = async () => {
    if (currentUserId === null) return;
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.user_id, currentUserId));
    setCategoryRows(result as Category[]);
  };

  const logout = async () => {
    await clearSession();
    setCurrentUserId(null);
    setBookRows([]);
    setCategoryRows([]);
  };

  const toggleTheme = async () => {
    const next: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  };

  useEffect(() => {
    (async () => {
      await seedDatabaseIfEmpty();
      const sessionUserId = await getSession();
      setCurrentUserId(sessionUserId);

      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') {
        setThemeMode(stored);
      }

      setBootstrapped(true);
    })();
  }, []);

  useEffect(() => {
    if (currentUserId !== null) {
      refreshBooks();
      refreshCategories();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!bootstrapped) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (currentUserId === null && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (currentUserId !== null && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [bootstrapped, currentUserId, segments]);

  return (
    <AppContext.Provider
      value={{
        currentUserId,
        setCurrentUserId,
        logout,
        books: bookRows,
        categories: categoryRows,
        refreshBooks,
        refreshCategories,
        themeMode,
        toggleTheme,
      }}
    >
      <ThemeProvider value={themeMode === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AppContext.Provider>
  );
}