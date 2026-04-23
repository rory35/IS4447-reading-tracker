import { useContext, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

import { AppContext } from '../_layout';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { verifyPassword, saveSession } from '../../lib/auth';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { Colors } from '@/constants/theme';

const C = Colors.light;

export default function LoginScreen() {
  const router = useRouter();
  const { setCurrentUserId } = useContext(AppContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValid = username.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username.trim()));

      if (!user) {
        Alert.alert('Login failed', 'No user found with that username.');
        setSubmitting(false);
        return;
      }

      const ok = await verifyPassword(password, user.password_hash);
      if (!ok) {
        Alert.alert('Login failed', 'Incorrect password.');
        setSubmitting(false);
        return;
      }

      await saveSession(user.id);
      setCurrentUserId(user.id);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not log in.');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Pagemark logo"
          />
          <Text style={styles.appName}>Pagemark</Text>
          <Text style={styles.tagline}>Track what you read.</Text>
        </View>

        <FormField
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="demo"
        />

        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="demo"
        />

        <View style={styles.buttonRow}>
          <PrimaryButton
            label={submitting ? 'Logging in...' : 'Log In'}
            onPress={handleLogin}
            disabled={!isValid || submitting}
          />
        </View>

        <View style={styles.buttonRow}>
          <PrimaryButton
            label="Create Account"
            variant="secondary"
            onPress={() => router.push('/(auth)/register')}
          />
        </View>

        <Text style={styles.hint}>
          Demo user: username <Text style={styles.bold}>demo</Text>, password <Text style={styles.bold}>demo</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: 16, paddingTop: 40 },
  brand: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 140, height: 100, marginBottom: 12 },
  appName: { fontSize: 32, fontWeight: 'bold', color: C.text },
  tagline: { fontSize: 14, color: C.textMuted, marginTop: 4 },
  buttonRow: { marginTop: 12 },
  hint: { fontSize: 12, color: C.textMuted, marginTop: 24, textAlign: 'center' },
  bold: { fontWeight: '700', color: C.text },
});