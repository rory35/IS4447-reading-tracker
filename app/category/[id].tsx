import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

import { AppContext } from '../_layout';
import { db } from '@/db/client';
import { categories, user_books } from '@/db/schema';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { Colors, CategoryColours, CategoryIcons } from '@/constants/theme';

const C = Colors.light;

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { refreshCategories, refreshBooks } = useContext(AppContext);

  const [name, setName] = useState('');
  const [colour, setColour] = useState(CategoryColours[0]);
  const [icon, setIcon] = useState(CategoryIcons[0]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [row] = await db.select().from(categories).where(eq(categories.id, Number(id)));
      if (row) {
        setName(row.name);
        setColour(row.colour);
        setIcon(row.icon);
      }
      setLoaded(true);
    })();
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing info', 'Please enter a category name.');
      return;
    }

    try {
      await db.update(categories)
        .set({ name: name.trim(), colour, icon })
        .where(eq(categories.id, Number(id)));
      await refreshCategories();
      await refreshBooks();
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not update category.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Category',
      'You can only delete a category that is not in use. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const catId = Number(id);

            const inUse = await db.select().from(user_books).where(eq(user_books.category_id, catId));
            if (inUse.length > 0) {
              Alert.alert('Cannot delete', 'This category is still in use by one or more books.');
              return;
            }

            await db.delete(categories).where(eq(categories.id, catId));
            await refreshCategories();
            router.back();
          },
        },
      ]
    );
  };

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">Edit Category</Text>

        <FormField label="Name" value={name} onChangeText={setName} />

        <Text style={styles.label}>Colour</Text>
        <View style={styles.optionRow}>
          {CategoryColours.map((c) => (
            <Pressable
              key={c}
              accessibilityLabel={`Colour ${c}`}
              accessibilityRole="button"
              onPress={() => setColour(c)}
              style={[styles.colourSwatch, { backgroundColor: c }, colour === c && styles.selected]}
            />
          ))}
        </View>

        <Text style={styles.label}>Icon</Text>
        <View style={styles.optionRow}>
          {CategoryIcons.map((i) => (
            <Pressable
              key={i}
              accessibilityLabel={`Icon ${i}`}
              accessibilityRole="button"
              onPress={() => setIcon(i)}
              style={[styles.iconOption, icon === i && styles.selected]}
            >
              <Text style={styles.iconText}>{i}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Preview</Text>
        <View style={[styles.preview, { backgroundColor: colour }]}>
          <Text style={styles.previewText}>{icon} {name || 'Preview'}</Text>
        </View>

        <View style={styles.buttonRow}>
          <PrimaryButton label="Save Changes" onPress={handleSave} />
        </View>
        <View style={styles.buttonRow}>
          <PrimaryButton label="Delete Category" variant="danger" onPress={handleDelete} />
        </View>
        <View style={styles.buttonRow}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: 16 },
  loading: { color: C.textMuted, padding: 16 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: C.text },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4, color: C.text },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  colourSwatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surfaceAlt,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconText: { fontSize: 20 },
  selected: { borderColor: C.text },
  preview: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, marginTop: 4 },
  previewText: { color: C.textOnPrimary, fontWeight: '600', fontSize: 16 },
  buttonRow: { marginTop: 12 },
});