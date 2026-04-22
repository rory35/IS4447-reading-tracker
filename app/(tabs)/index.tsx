import { useCallback, useContext, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppContext } from '../_layout';
import PrimaryButton from '@/components/ui/primary-button';

export default function BooksScreen() {
  const router = useRouter();
  const { books, categories, refreshBooks } = useContext(AppContext);

  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshBooks();
    }, [])
  );

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((item) => {
      if (filterCategoryId !== null && item.user_books.category_id !== filterCategoryId) return false;
      if (q.length === 0) return true;
      return (
        item.books.title.toLowerCase().includes(q) ||
        item.books.author.toLowerCase().includes(q)
      );
    });
  }, [books, search, filterCategoryId]);

  const hasFilters = search.trim().length > 0 || filterCategoryId !== null;

  const resetFilters = () => {
    setSearch('');
    setFilterCategoryId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading} accessibilityRole="header">My Books</Text>

      <PrimaryButton label="+ Add Book" onPress={() => router.push('/book/add')} />

      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search by title or author"
        accessibilityLabel="Search books"
      />

      <View style={styles.filterRow}>
        <Pressable
          accessibilityLabel="Show all categories"
          accessibilityRole="button"
          onPress={() => setFilterCategoryId(null)}
          style={[
            styles.filterChip,
            styles.allChip,
            filterCategoryId === null && styles.filterChipSelected,
          ]}
        >
          <Text style={styles.filterText}>All</Text>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            accessibilityLabel={`Filter by ${cat.name}`}
            accessibilityRole="button"
            onPress={() => setFilterCategoryId(cat.id)}
            style={[
              styles.filterChip,
              { backgroundColor: cat.colour },
              filterCategoryId === cat.id && styles.filterChipSelected,
            ]}
          >
            <Text style={styles.filterText}>
              {cat.icon} {cat.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {hasFilters && (
        <Pressable
          accessibilityLabel="Reset filters"
          accessibilityRole="button"
          onPress={resetFilters}
          style={styles.reset}
        >
          <Text style={styles.resetText}>Reset filters</Text>
        </Pressable>
      )}

      {books.length === 0 ? (
        <Text style={styles.empty}>No books yet. Add your first book to get started.</Text>
      ) : filteredBooks.length === 0 ? (
        <Text style={styles.empty}>No books match your search.</Text>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.user_books.id.toString()}
          style={styles.list}
          renderItem={({ item }) => {
            const summary = `${item.books.title} by ${item.books.author}, category ${item.categories.name}`;
            return (
              <Pressable
                accessibilityLabel={`${summary}, view details`}
                accessibilityRole="button"
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
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  search: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, marginTop: 12 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, opacity: 0.55 },
  allChip: { backgroundColor: '#444' },
  filterChipSelected: { opacity: 1, borderWidth: 2, borderColor: '#000' },
  filterText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  reset: { marginTop: 8, alignSelf: 'flex-start' },
  resetText: { color: '#0F766E', fontWeight: '600' },
  list: { marginTop: 12 },
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