import { useContext, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

import { AppContext } from '../_layout';
import { db } from '@/db/client';
import { books, user_books } from '@/db/schema';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { useTheme } from '@/hooks/use-theme';

export default function AddBookScreen() {
  const router = useRouter();
  const { currentUserId, categories, refreshBooks } = useContext(AppContext);
  const { C } = useTheme();

  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [looking, setLooking] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    content: { padding: 16 },
    heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: C.text },
    hint: { fontSize: 12, color: C.textMuted, marginTop: 4, marginBottom: 8 },
    label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4, color: C.text },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, opacity: 0.6 },
    categoryChipSelected: { opacity: 1, borderWidth: 2, borderColor: C.text },
    categoryText: { color: C.textOnPrimary, fontWeight: '600' },
    buttonRow: { marginTop: 12 },
    lookupRow: { marginTop: 8 },
  }), [C]);

  const handleLookup = async () => {
    const code = isbn.replace(/[^0-9Xx]/g, '').trim();
    if (!code) {
      Alert.alert('Missing ISBN', 'Please enter an ISBN to look up.');
      return;
    }

    setLooking(true);
    try {
      const bookRes = await fetch(`https://openlibrary.org/isbn/${code}.json`);
      if (!bookRes.ok) {
        Alert.alert('Not found', `No book found for ISBN ${code}. Please fill in the details manually.`);
        return;
      }
      const bookData = await bookRes.json();

      const foundTitle = bookData.title as string | undefined;
      const foundPages = bookData.number_of_pages as number | undefined;

      // Try edition-level author first, then fall back to work-level author
      let authorKey = bookData.authors?.[0]?.key as string | undefined;

      if (!authorKey && bookData.works?.[0]?.key) {
        try {
          const workRes = await fetch(`https://openlibrary.org${bookData.works[0].key}.json`);
          if (workRes.ok) {
            const workData = await workRes.json();
            authorKey = workData.authors?.[0]?.author?.key;
          }
        } catch {
          // Work fetch failed — carry on
        }
      }

      let foundAuthor: string | undefined;
      if (authorKey) {
        try {
          const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`);
          if (authorRes.ok) {
            const authorData = await authorRes.json();
            foundAuthor = authorData.name;
          }
        } catch {
          // Author fetch failed — carry on
        }
      }

      if (foundTitle) setTitle(foundTitle);
      if (foundAuthor) setAuthor(foundAuthor);
      if (foundPages) setTotalPages(String(foundPages));

      if (!foundTitle && !foundAuthor && !foundPages) {
        Alert.alert('Incomplete record', 'Open Library has an entry but no details to auto-fill. Please enter manually.');
      }
    } catch (e: any) {
      Alert.alert('Lookup failed', e.message ?? 'Could not reach Open Library. Check your connection.');
    } finally {
      setLooking(false);
    }
  };

  const handleSave = async () => {
    const cleanIsbn = isbn.replace(/[^0-9Xx]/g, '').trim();

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
      if (cleanIsbn) {
        const [existing] = await db.select().from(books).where(eq(books.isbn, cleanIsbn));
        if (existing) {
          bookId = existing.id;
        } else {
          const [newBook] = await db.insert(books).values({
            title: title.trim(),
            author: author.trim(),
            total_pages: pages,
            isbn: cleanIsbn,
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

        <FormField
          label="ISBN"
          value={isbn}
          onChangeText={setIsbn}
          placeholder="13-digit ISBN"
          keyboardType="number-pad"
        />
        <Text style={styles.hint}>Enter an ISBN to auto-fill title, author, and pages.</Text>

        <View style={styles.lookupRow}>
          <PrimaryButton
            label={looking ? 'Looking up...' : 'Look up book'}
            onPress={handleLookup}
            variant="secondary"
            disabled={looking || !isbn.trim()}
          />
        </View>

        <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Book title" />
        <FormField label="Author" value={author} onChangeText={setAuthor} placeholder="Author" />
        <FormField
          label="Total Pages"
          value={totalPages}
          onChangeText={setTotalPages}
          placeholder="e.g. 320"
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
          <PrimaryButton label="Save Book" onPress={handleSave} />
        </View>
        <View style={styles.buttonRow}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}