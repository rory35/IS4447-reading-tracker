import { useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppContext } from '../_layout';
import { db } from '@/db/client';
import { targets } from '@/db/schema';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';

export default function AddTargetScreen() {
  const router = useRouter();
  const { currentUserId, categories } = useContext(AppContext);

  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [pagesGoal, setPagesGoal] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const isValid = pagesGoal.trim().length > 0 && !isNaN(parseInt(pagesGoal, 10)) && parseInt(pagesGoal, 10) > 0;

  const handleSave = async () => {
    const goal = parseInt(pagesGoal, 10);

    try {
      await db.insert(targets).values({
        period,
        pages_goal: goal,
        category_id: categoryId,
        user_id: currentUserId,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save target.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">Add Target</Text>

        <Text style={styles.label}>Period</Text>
        <View style={styles.row}>
          <Pressable
            accessibilityLabel="Weekly period"
            accessibilityRole="button"
            onPress={() => setPeriod('weekly')}
            style={[styles.periodChip, period === 'weekly' && styles.periodChipSelected]}
          >
            <Text style={[styles.periodText, period === 'weekly' && styles.periodTextSelected]}>Weekly</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Monthly period"
            accessibilityRole="button"
            onPress={() => setPeriod('monthly')}
            style={[styles.periodChip, period === 'monthly' && styles.periodChipSelected]}
          >
            <Text style={[styles.periodText, period === 'monthly' && styles.periodTextSelected]}>Monthly</Text>
          </Pressable>
        </View>

        <FormField
          label="Pages Goal"
          value={pagesGoal}
          onChangeText={setPagesGoal}
          placeholder="e.g. 200"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Category (leave empty for global)</Text>
        <View style={styles.categoryRow}>
          <Pressable
            accessibilityLabel="All categories"
            accessibilityRole="button"
            onPress={() => setCategoryId(null)}
            style={[styles.categoryChip, styles.allChip, categoryId === null && styles.categoryChipSelected]}
          >
            <Text style={styles.categoryText}>All</Text>
          </Pressable>
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
          <PrimaryButton label="Save Target" onPress={handleSave} disabled={!isValid} />
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
  row: { flexDirection: 'row', gap: 8 },
  periodChip: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  periodChipSelected: { backgroundColor: '#0F766E' },
  periodText: { fontSize: 14, fontWeight: '600', color: '#333' },
  periodTextSelected: { color: '#fff' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, opacity: 0.6 },
  allChip: { backgroundColor: '#444' },
  categoryChipSelected: { opacity: 1, borderWidth: 2, borderColor: '#000' },
  categoryText: { color: '#fff', fontWeight: '600' },
  buttonRow: { marginTop: 12 },
});