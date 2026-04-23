import { useContext, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

import { AppContext } from '../_layout';
import { db } from '@/db/client';
import { users, categories } from '@/db/schema';
import { hashPassword, saveSession } from '../../lib/auth';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { Colors } from '@/constants/theme';

const C = Colors.light;

export default function RegisterScreen() {
  const router = useRouter();
  const { setCurrentUserId } = useContext(AppContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValid =
    username.trim().length >= 3 &&
    password.length >= 4 &&
    password === confirm;

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      const trimmed = username.trim();

      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.username, trimmed));

      if (existing) {
        Alert.alert('Username taken', 'Please choose a different username.');
        setSubmitting(false);
        return;
      }

      const hash = await hashPassword(password);
      const [newUser] = await db.insert(users).values({
        username: trimmed,
        password_hash: hash,
      }).returning();

      await db.insert(categories).values([
        { name: 'Fiction',     colour: '#E63946', icon: '📖', user_id: newUser.id },
        { name: 'Non-Fiction', colour: '#2A9D8F', icon: '📚', user_id: newUser.id },
        { name: 'Sci-Fi',      colour: '#457B9D', icon: '🚀', user_id: newUser.id },
        { name: 'Biography',   colour: '#F4A261', icon: '👤', user_id: newUser.id },
      ]);

      await saveSession(newUser.id);
      setCurrentUserId(newUser.id);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not create account.');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">Create Account</Text>
        <Text style={styles.subheading}>Start tracking your reading.</Text>

        <FormField
          label="Username (min 3 chars)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="Your username"
        />

        <FormField
          label="Password (min 4 chars)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
        />

        <FormField
          label="Confirm Password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="Confirm password"
        />

        {password.length > 0 && confirm.length > 0 && password !== confirm && (
          <Text style={styles.error}>Passwords do not match.</Text>
        )}

        <View style={styles.buttonRow}>
          <PrimaryButton
            label={submitting ? 'Creating...' : 'Create Account'}
            onPress={handleRegister}
            disabled={!isValid || submitting}
          />
        </View>

        <View style={styles.buttonRow}>
          <PrimaryButton
            label="Back to Login"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: 16 },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 4, color: C.text },
  subheading: { fontSize: 14, color: C.textMuted, marginBottom: 16 },
  buttonRow: { marginTop: 12 },
  error: { color: C.danger, marginTop: 8, fontSize: 13 },
});