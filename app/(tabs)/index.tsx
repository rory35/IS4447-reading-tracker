import { useContext, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppContext } from '../_layout';
import PrimaryButton from '@/components/ui/primary-button';

export default function BooksScreen() {
  const router = useRouter();
  const { books, refreshBooks } = useContext(AppContext);

  useFocusEffect(
    useCallback(() => {
      refreshBooks();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.heading}
        accessibilityRole="header"
      >
        My Books
      </Text>

      <PrimaryButton
        label="+ Add Book"
        onPress={() => router.push('/book/add')}
      />

      {books.length === 0 ? (
        <Text style={styles.empty}>No books yet. Add your first book to get started.</Text>
      ) : (
        <FlatList
          data={books}
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