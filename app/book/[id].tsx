import { useCallback, useContext, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { eq, desc } from 'drizzle-orm';

import { AppContext } from '../_layout';
import { db } from '@/db/client';
import { user_books, books, categories, reading_logs } from '@/db/schema';
import PrimaryButton from '@/components/ui/primary-button';
import { Colors } from '@/constants/theme';

const C = Colors.light;

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { refreshBooks } = useContext(AppContext);

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
            await refreshBooks();
            router.back();
          },
        },
      ]
    );
  };

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const totalRead = logs.reduce((sum, log) => sum + log.pages_read, 0);
  const percent = Math.min(100, Math.round((totalRead / book.books.total_pages) * 100));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">{book.books.title}</Text>
      <Text style={styles.author}>{book.books.author}</Text>

      <View
        style={[styles.badge, { backgroundColor: book.categories.colour }]}
        accessibilityLabel={`Category ${book.categories.name}`}
      >
        <Text style={styles.badgeText}>
          {book.categories.icon} {book.categories.name}
        </Text>
      </View>

      <Text style={styles.progress}>
        {totalRead} / {book.books.total_pages} pages ({percent}%)
      </Text>

      <View style={styles.row}>
        <PrimaryButton label="+ Log Reading" onPress={() => router.push(`/book/${id}/log`)} />
      </View>

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <PrimaryButton label="Edit" variant="secondary" onPress={() => router.push(`/book/${id}/edit`)} />
        </View>
        <View style={styles.actionItem}>
          <PrimaryButton label="Delete" variant="danger" onPress={handleDelete} />
        </View>
      </View>

      <Text style={styles.heading} accessibilityRole="header">Reading History</Text>

      {logs.length === 0 ? (
        <Text style={styles.empty}>No sessions logged yet.</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.logRow}>
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
  container: { flex: 1, padding: 16, backgroundColor: C.background },
  loading: { color: C.textMuted },
  title: { fontSize: 24, fontWeight: 'bold', color: C.text },
  author: { fontSize: 16, color: C.textMuted, marginBottom: 12 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 16 },
  badgeText: { color: C.textOnPrimary, fontWeight: '600' },
  progress: { fontSize: 16, marginBottom: 12, color: C.text },
  row: { marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  actionItem: { flex: 1 },
  heading: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: C.text },
  empty: { color: C.textMuted, marginTop: 12 },
  logRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  date: { fontWeight: '600', color: C.text },
  pages: { color: C.textMuted, marginTop: 2 },
  notes: { color: C.textMuted, fontStyle: 'italic', marginTop: 2 },
});