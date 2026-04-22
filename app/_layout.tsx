import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useEffect, useState } from 'react';
import 'react-native-reanimated';
import { eq } from 'drizzle-orm';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { seedDatabaseIfEmpty } from '../db/seed';
import { db } from '@/db/client';
import { user_books, books, categories } from '@/db/schema';

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

type AppContextType = {
  currentUserId: number;
  books: BookRow[];
  categories: Category[];
  refreshBooks: () => Promise<void>;
  refreshCategories: () => Promise<void>;
};

export const AppContext = createContext<AppContextType>({
  currentUserId: 1,
  books: [],
  categories: [],
  refreshBooks: async () => {},
  refreshCategories: async () => {},
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [currentUserId] = useState<number>(1);
  const [bookRows, setBookRows] = useState<BookRow[]>([]);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);

  const refreshBooks = async () => {
    const result = await db
      .select()
      .from(user_books)
      .innerJoin(books, eq(user_books.book_id, books.id))
      .innerJoin(categories, eq(user_books.category_id, categories.id))
      .where(eq(user_books.user_id, currentUserId));
    setBookRows(result as BookRow[]);
  };

  const refreshCategories = async () => {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.user_id, currentUserId));
    setCategoryRows(result as Category[]);
  };

  useEffect(() => {
    (async () => {
      await seedDatabaseIfEmpty();
      await refreshBooks();
      await refreshCategories();
    })();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUserId,
        books: bookRows,
        categories: categoryRows,
        refreshBooks,
        refreshCategories,
      }}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppContext.Provider>
  );
}