import { useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppContext } from '../_layout';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';

const COLOUR_OPTIONS = [
  '#E63946', '#F4A261', '#E9C46A', '#2A9D8F',
  '#457B9D', '#6D597A', '#B5838D', '#264653',
];

const ICON_OPTIONS = ['📖', '📚', '🚀', '👤', '💡', '🎭', '🔬', '🗺️', '❤️', '⚔️'];

export default function AddCategoryScreen() {
  const router = useRouter();
  const { currentUserId, refreshCategories } = useContext(AppContext);

  const [name, setName] = useState('');
  const [colour, setColour] = useState(COLOUR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing info', 'Please enter a category name.');
      return;
    }

    try {
      await db.insert(categories).values({
        name: name.trim(),
        colour,
        icon,
        user_id: currentUserId,
      });
      await refreshCategories();
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save category.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">Add Category</Text>

        <FormField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Mystery"
        />

        <Text style={styles.label}>Colour</Text>
        <View style={styles.optionRow}>
          {COLOUR_OPTIONS.map((c) => (
            <Pressable
              key={c}
              accessibilityLabel={`Colour ${c}`}
              accessibilityRole="button"
              onPress={() => setColour(c)}
              style={[
                styles.colourSwatch,
                { backgroundColor: c },
                colour === c && styles.selected,
              ]}
            />
          ))}
        </View>

        <Text style={styles.label}>Icon</Text>
        <View style={styles.optionRow}>
          {ICON_OPTIONS.map((i) => (
            <Pressable
              key={i}
              accessibilityLabel={`Icon ${i}`}
              accessibilityRole="button"
              onPress={() => setIcon(i)}
              style={[
                styles.iconOption,
                icon === i && styles.selected,
              ]}
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
          <PrimaryButton label="Save Category" onPress={handleSave} />
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
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  colourSwatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
  iconOption: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderWidth: 2, borderColor: 'transparent' },
  iconText: { fontSize: 20 },
  selected: { borderColor: '#000' },
  preview: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, marginTop: 4 },
  previewText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  buttonRow: { marginTop: 12 },
});