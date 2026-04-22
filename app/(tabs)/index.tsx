import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { user_books, books, categories } from '@/db/schema';

type BookRow = {
  user_books: { id: number; user_id: number; book_id: number; category_id: number };
  books: { id: number; title: string; author: string; total_pages: number; isbn: string | null };
  categories: { id: number; name: string; colour: string; icon: string };
};

export default function BooksScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<BookRow[]>([]);

  useEffect(() => {
    (async () => {
      const result = await db
        .select()
        .from(user_books)
        .innerJoin(books, eq(user_books.book_id, books.id))
        .innerJoin(categories, eq(user_books.category_id, categories.id))
        .where(eq(user_books.user_id, 1));
      setRows(result as BookRow[]);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>My Books</Text>

      {rows.length === 0 ? (
        <Text style={styles.empty}>No books yet. Add your first book to get started.</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.user_books.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => router.push(`/book/${item.user_books.id}`)}
            >
              <View style={[styles.badge, { backgroundColor: item.categories.colour }]}>
                <Text style={styles.badgeText}>{item.categories.icon}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.title}>{item.books.title}</Text>
                <Text style={styles.author}>{item.books.author}</Text>
                <Text style={styles.category}>{item.categories.name}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  pressed: { opacity: 0.6 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  badgeText: { fontSize: 20 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  author: { fontSize: 14, color: '#666', marginTop: 2 },
  category: { fontSize: 12, color: '#999', marginTop: 2 },
});