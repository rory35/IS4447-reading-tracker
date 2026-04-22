import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { categories } from '@/db/schema';

type Category = {
  id: number;
  name: string;
  colour: string;
  icon: string;
  user_id: number;
};

export default function CategoriesScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<Category[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const result = await db.select().from(categories).where(eq(categories.user_id, 1));
        setRows(result as Category[]);
      })();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Categories</Text>

      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/category/add')}
      >
        <Text style={styles.addText}>+ Add Category</Text>
      </Pressable>

      {rows.length === 0 ? (
        <Text style={styles.empty}>No categories yet.</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => router.push(`/category/${item.id}`)}
            >
              <View style={[styles.badge, { backgroundColor: item.colour }]}>
                <Text style={styles.badgeText}>{item.icon}</Text>
              </View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.chevron}>›</Text>
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
  addButton: { backgroundColor: '#457B9D', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  addText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  pressed: { opacity: 0.6 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  badgeText: { fontSize: 20 },
  name: { fontSize: 16, flex: 1 },
  chevron: { fontSize: 20, color: '#999' },
});