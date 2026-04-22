import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { user_books, books, categories, reading_logs } from '@/db/schema';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [book, setBook] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const userBookId = Number(id);

        const [bookRow] = await db
          .select()
          .from(user_books)
          .innerJoin(books, eq(user_books.book_id, books.id))
          .innerJoin(categories, eq(user_books.category_id, categories.id))
          .where(eq(user_books.id, userBookId));

        setBook(bookRow);

        const logRows = await db
          .select()
          .from(reading_logs)
          .where(eq(reading_logs.user_book_id, userBookId))
          .orderBy(desc(reading_logs.date), desc(reading_logs.created_at));

        setLogs(logRows);
      })();
    }, [id])
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Book',
      'This will remove the book from your list and all its reading logs. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const userBookId = Number(id);
            await db.delete(reading_logs).where(eq(reading_logs.user_book_id, userBookId));
            await db.delete(user_books).where(eq(user_books.id, userBookId));
            router.back();
          },
        },
      ]
    );
  };

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const totalRead = logs.reduce((sum, log) => sum + log.pages_read, 0);
  const percent = Math.min(100, Math.round((totalRead / book.books.total_pages) * 100));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{book.books.title}</Text>
      <Text style={styles.author}>{book.books.author}</Text>

      <View style={[styles.badge, { backgroundColor: book.categories.colour }]}>
        <Text style={styles.badgeText}>
          {book.categories.icon} {book.categories.name}
        </Text>
      </View>

      <Text style={styles.progress}>
        {totalRead} / {book.books.total_pages} pages ({percent}%)
      </Text>

      <Pressable style={styles.logButton} onPress={() => router.push(`/book/${id}/log`)}>
        <Text style={styles.logText}>+ Log Reading</Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable style={styles.editButton} onPress={() => router.push(`/book/${id}/edit`)}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>

      <Text style={styles.heading}>Reading History</Text>

      {logs.length === 0 ? (
        <Text style={styles.empty}>No sessions logged yet.</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.pages}>{item.pages_read} pages</Text>
              {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  author: { fontSize: 16, color: '#666', marginBottom: 12 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 16 },
  badgeText: { color: '#fff', fontWeight: '600' },
  progress: { fontSize: 16, marginBottom: 12 },
  logButton: { backgroundColor: '#2A9D8F', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  logText: { color: '#fff', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  editButton: { flex: 1, backgroundColor: '#457B9D', padding: 12, borderRadius: 8, alignItems: 'center' },
  editText: { color: '#fff', fontWeight: '600' },
  deleteButton: { flex: 1, backgroundColor: '#E63946', padding: 12, borderRadius: 8, alignItems: 'center' },
  deleteText: { color: '#fff', fontWeight: '600' },
  heading: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  empty: { color: '#666', marginTop: 12 },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  date: { fontWeight: '600' },
  pages: { color: '#444', marginTop: 2 },
  notes: { color: '#666', fontStyle: 'italic', marginTop: 2 },
});