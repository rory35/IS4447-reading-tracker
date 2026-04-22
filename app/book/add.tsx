import { useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

import { AppContext } from '../_layout';
import { db } from '@/db/client';
import { books, user_books } from '@/db/schema';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';

export default function AddBookScreen() {
  const router = useRouter();
  const { currentUserId, categories, refreshBooks } = useContext(AppContext);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [isbn, setIsbn] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const handleSave = async () => {
    console.log('values:', { title, author, totalPages, isbn, categoryId });

    if (!title.trim() || !author.trim() || !totalPages.trim() || !categoryId) {
      Alert.alert('Missing info', 'Please fill in title, author, pages, and category.');
      return;
    }

    const pages = parseInt(totalPages, 10);
    if (isNaN(pages) || pages <= 0) {
      Alert.alert('Invalid pages', 'Total pages must be a positive number.');
      return;
    }

    try {
      let bookId: number;
      if (isbn.trim()) {
        const [existing] = await db.select().from(books).where(eq(books.isbn, isbn.trim()));
        if (existing) {
          bookId = existing.id;
        } else {
          const [newBook] = await db.insert(books).values({
            title: title.trim(),
            author: author.trim(),
            total_pages: pages,
            isbn: isbn.trim(),
          }).returning();
          bookId = newBook.id;
        }
      } else {
        const [newBook] = await db.insert(books).values({
          title: title.trim(),
          author: author.trim(),
          total_pages: pages,
        }).returning();
        bookId = newBook.id;
      }

      await db.insert(user_books).values({
        user_id: currentUserId,
        book_id: bookId,
        category_id: categoryId,
      });

      await refreshBooks();
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save book.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">Add Book</Text>

        <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Book title" />
        <FormField label="Author" value={author} onChangeText={setAuthor} placeholder="Author" />
        <FormField
          label="Total Pages"
          value={totalPages}
          onChangeText={setTotalPages}
          placeholder="e.g. 320"
          keyboardType="number-pad"
        />
        <FormField
          label="ISBN (optional)"
          value={isbn}
          onChangeText={setIsbn}
          placeholder="13-digit ISBN"
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
          <PrimaryButton label="Save Book" onPress={handleSave} />
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