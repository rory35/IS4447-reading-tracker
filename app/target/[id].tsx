import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

import { AppContext } from '../_layout';
import { db } from '@/db/client';
import { targets } from '@/db/schema';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { useTheme } from '@/hooks/use-theme';

export default function EditTargetScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { categories } = useContext(AppContext);
  const { C } = useTheme();

  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [pagesGoal, setPagesGoal] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    content: { padding: 16 },
    loading: { color: C.textMuted, padding: 16 },
    heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: C.text },
    label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4, color: C.text },
    row: { flexDirection: 'row', gap: 8 },
    periodChip: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: C.surfaceAlt, alignItems: 'center' },
    periodChipSelected: { backgroundColor: C.primary },
    periodText: { fontSize: 14, fontWeight: '600', color: C.text },
    periodTextSelected: { color: C.textOnPrimary },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, opacity: 0.6 },
    allChip: { backgroundColor: '#444' },
    categoryChipSelected: { opacity: 1, borderWidth: 2, borderColor: C.text },
    categoryText: { color: C.textOnPrimary, fontWeight: '600' },
    buttonRow: { marginTop: 12 },
  }), [C]);

  useEffect(() => {
    (async () => {
      const [row] = await db.select().from(targets).where(eq(targets.id, Number(id)));
      if (row) {
        setPeriod(row.period as 'weekly' | 'monthly');
        setPagesGoal(row.pages_goal.toString());
        setCategoryId(row.category_id);
      }
      setLoaded(true);
    })();
  }, [id]);

  const isValid = pagesGoal.trim().length > 0 && !isNaN(parseInt(pagesGoal, 10)) && parseInt(pagesGoal, 10) > 0;

  const handleSave = async () => {
    const goal = parseInt(pagesGoal, 10);

    try {
      await db.update(targets)
        .set({ period, pages_goal: goal, category_id: categoryId })
        .where(eq(targets.id, Number(id)));
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not update target.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Target',
      'Are you sure you want to delete this target?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await db.delete(targets).where(eq(targets.id, Number(id)));
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
        <Text style={styles.heading} accessibilityRole="header">Edit Target</Text>

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
          <PrimaryButton label="Save Changes" onPress={handleSave} disabled={!isValid} />
        </View>
        <View style={styles.buttonRow}>
          <PrimaryButton label="Delete Target" variant="danger" onPress={handleDelete} />
        </View>
        <View style={styles.buttonRow}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}