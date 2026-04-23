import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { db } from '@/db/client';
import { reading_logs } from '@/db/schema';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { useTheme } from '@/hooks/use-theme';

export default function LogReadingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { C } = useTheme();

  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [pagesRead, setPagesRead] = useState('');
  const [notes, setNotes] = useState('');

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    content: { padding: 16 },
    heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: C.text },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    buttonRow: { marginTop: 12 },
  }), [C]);

  const handleSave = async () => {
    if (!date.trim() || !pagesRead.trim()) {
      Alert.alert('Missing info', 'Please enter a date and pages read.');
      return;
    }

    const pages = parseInt(pagesRead, 10);
    if (isNaN(pages) || pages <= 0) {
      Alert.alert('Invalid pages', 'Pages read must be a positive number.');
      return;
    }

    try {
      await db.insert(reading_logs).values({
        user_book_id: Number(id),
        date: date.trim(),
        pages_read: pages,
        notes: notes.trim() || null,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save log.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">Log Reading Session</Text>

        <FormField
          label="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          placeholder="2026-04-22"
        />

        <FormField
          label="Pages Read"
          value={pagesRead}
          onChangeText={setPagesRead}
          placeholder="e.g. 30"
          keyboardType="number-pad"
        />

        <FormField
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="How was it?"
          multiline
          style={styles.textArea}
        />

        <View style={styles.buttonRow}>
          <PrimaryButton label="Save Log" onPress={handleSave} />
        </View>
        <View style={styles.buttonRow}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}