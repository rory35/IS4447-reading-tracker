import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

import { AppContext } from '../../_layout';
import { db } from '@/db/client';
import { user_books, books } from '@/db/schema';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';

export default function EditBookScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { categories, refreshBooks } = useContext(AppContext);

  const [bookId, setBookId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const userBookId = Number(id);

      const [row] = await db
        .select()
        .from(user_books)
        .innerJoin(books, eq(user_books.book_id, books.id))
        .where(eq(user_books.id, userBookId));

      if (row) {
        setBookId(row.books.id);
        setTitle(row.books.title);
        setAuthor(row.books.author);
        setTotalPages(row.books.total_pages.toString());
        setCategoryId(row.user_books.category_id);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!title.trim() || !author.trim() || !totalPages.trim() || !categoryId || !bookId) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }

    const pages = parseInt(totalPages, 10);
    if (isNaN(pages) || pages <= 0) {
      Alert.alert('Invalid pages', 'Total pages must be a positive number.');
      return;
    }

    try {
      await db.update(books)
        .set({ title: title.trim(), author: author.trim(), total_pages: pages })
        .where(eq(books.id, bookId));

      await db.update(user_books)
        .set({ category_id: categoryId })
        .where(eq(user_books.id, Number(id)));

      await refreshBooks();
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not update book.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">Edit Book</Text>

        <FormField label="Title" value={title} onChangeText={setTitle} />
        <FormField label="Author" value={author} onChangeText={setAuthor} />
        <FormField
          label="Total Pages"
          value={totalPages}
          onChangeText={setTotalPages}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              accessibilityLabel={`Category ${cat.name}`}
              accessibilityRole="button"
              onPress={() => setCategoryId(cat.id)}
              style={[
                styles.categoryChip,
                { backgroundColor: cat.colour },
                categoryId === cat.id && styles.categoryChipSelected,
              ]}
            >
              <Text style={styles.categoryText}>
                {cat.icon} {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <PrimaryButton label="Save Changes" onPress={handleSave} />
        </View>
        <View style={styles.buttonRow}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, opacity: 0.6 },
  categoryChipSelected: { opacity: 1, borderWidth: 2, borderColor: '#000' },
  categoryText: { color: '#fff', fontWeight: '600' },
  buttonRow: { marginTop: 12 },
});