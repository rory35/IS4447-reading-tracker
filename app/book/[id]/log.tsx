import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '@/db/client';
import { reading_logs } from '@/db/schema';

export default function LogReadingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [pagesRead, setPagesRead] = useState('');
  const [notes, setNotes] = useState('');

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
        <Text style={styles.heading}>Log Reading Session</Text>

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-04-22" />

        <Text style={styles.label}>Pages Read</Text>
        <TextInput
          style={styles.input}
          value={pagesRead}
          onChangeText={setPagesRead}
          placeholder="e.g. 30"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="How was it?"
          multiline
        />

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Log</Text>
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#2A9D8F', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#666' },
});