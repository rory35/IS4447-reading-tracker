import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { user_books, books, categories } from '@/db/schema';

export default function EditBookScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [bookId, setBookId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryList, setCategoryList] = useState<any[]>([]);

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

      const cats = await db.select().from(categories).where(eq(categories.user_id, 1));
      setCategoryList(cats);
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

      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not update book.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Edit Book</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Author</Text>
        <TextInput style={styles.input} value={author} onChangeText={setAuthor} />

        <Text style={styles.label}>Total Pages</Text>
        <TextInput
          style={styles.input}
          value={totalPages}
          onChangeText={setTotalPages}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {categoryList.map((cat) => (
            <Pressable
              key={cat.id}
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

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, opacity: 0.6 },
  categoryChipSelected: { opacity: 1, borderWidth: 2, borderColor: '#000' },
  categoryText: { color: '#fff', fontWeight: '600' },
  saveButton: { backgroundColor: '#2A9D8F', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#666' },
});