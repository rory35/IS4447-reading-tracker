import { useCallback, useContext, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppContext } from './_layout';
import PrimaryButton from '@/components/ui/primary-button';
import { useTheme } from '@/hooks/use-theme';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, refreshCategories } = useContext(AppContext);
  const { C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: C.background },
    heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: C.text },
    list: { marginTop: 12 },
    empty: { textAlign: 'center', marginTop: 40, color: C.textMuted },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    pressed: { opacity: 0.6 },
    badge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    badgeText: { fontSize: 20 },
    name: { fontSize: 16, flex: 1, color: C.text },
    chevron: { fontSize: 20, color: C.textLight },
  }), [C]);

  useFocusEffect(
    useCallback(() => {
      refreshCategories();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading} accessibilityRole="header">Categories</Text>

      <PrimaryButton
        label="+ Add Category"
        onPress={() => router.push('/category/add')}
      />

      {categories.length === 0 ? (
        <Text style={styles.empty}>No categories yet.</Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          renderItem={({ item }) => (
            <Pressable
              accessibilityLabel={`Category ${item.name}, edit`}
              accessibilityRole="button"
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