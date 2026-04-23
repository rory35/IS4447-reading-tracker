import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

import { AppContext } from '../_layout';
import { db } from '@/db/client';
import { users, categories, user_books, reading_logs, targets } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUserId, logout } = useContext(AppContext);
  const { C, themeMode, toggleTheme } = useTheme();
  const [username, setUsername] = useState<string>('');

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    content: { padding: 16 },
    heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: C.text },
    userCard: { backgroundColor: C.surfaceAlt, padding: 16, borderRadius: 12, marginBottom: 24 },
    username: { fontSize: 20, fontWeight: '600', color: C.text },
    userMeta: { fontSize: 14, color: C.textMuted, marginTop: 2 },
    sectionHeading: {
      fontSize: 14,
      fontWeight: '600',
      color: C.textMuted,
      textTransform: 'uppercase',
      marginTop: 16,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    pressed: { opacity: 0.6 },
    rowLabel: { fontSize: 16, color: C.text },
    chevron: { fontSize: 20, color: C.textLight },
    danger: { marginTop: 16 },
    dangerText: { color: C.danger },
  }), [C]);

  useEffect(() => {
    (async () => {
      if (currentUserId === null) return;
      const [user] = await db.select().from(users).where(eq(users.id, currentUserId));
      if (user) setUsername(user.username);
    })();
  }, [currentUserId]);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'This will permanently delete your account and all your reading data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (currentUserId === null) return;
            try {
              const userBookRows = await db.select().from(user_books).where(eq(user_books.user_id, currentUserId));
              for (const ub of userBookRows) {
                await db.delete(reading_logs).where(eq(reading_logs.user_book_id, ub.id));
              }
              await db.delete(user_books).where(eq(user_books.user_id, currentUserId));
              await db.delete(targets).where(eq(targets.user_id, currentUserId));
              await db.delete(categories).where(eq(categories.user_id, currentUserId));
              await db.delete(users).where(eq(users.id, currentUserId));

              await logout();
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Could not delete profile.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">Profile</Text>

        <View style={styles.userCard}>
          <Text style={styles.username}>{username || '...'}</Text>
          <Text style={styles.userMeta}>Signed in</Text>
        </View>

        <Text style={styles.sectionHeading} accessibilityRole="header">Manage</Text>

        <Pressable
          accessibilityLabel="Manage categories"
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() => router.push('/categories')}
        >
          <Text style={styles.rowLabel}>Categories</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Manage targets"
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() => router.push('/targets')}
        >
          <Text style={styles.rowLabel}>Targets</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Text style={styles.sectionHeading} accessibilityRole="header">Appearance</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Dark mode</Text>
          <Switch
            accessibilityLabel="Toggle dark mode"
            value={themeMode === 'dark'}
            onValueChange={toggleTheme}
          />
        </View>

        <Text style={styles.sectionHeading} accessibilityRole="header">Account</Text>

        <Pressable
          accessibilityLabel="Log out"
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={handleLogout}
        >
          <Text style={styles.rowLabel}>Log out</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Delete profile"
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, styles.danger, pressed && styles.pressed]}
          onPress={handleDeleteProfile}
        >
          <Text style={[styles.rowLabel, styles.dangerText]}>Delete profile</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}