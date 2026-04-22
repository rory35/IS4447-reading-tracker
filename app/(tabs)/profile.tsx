import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.userCard}>
          <Text style={styles.username}>demo</Text>
          <Text style={styles.userMeta}>Signed in</Text>
        </View>

        <Text style={styles.sectionHeading}>Manage</Text>

        <Pressable style={styles.row} onPress={() => router.push('/categories')}>
          <Text style={styles.rowLabel}>Categories</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable style={styles.row} onPress={() => router.push('/targets')}>
          <Text style={styles.rowLabel}>Targets</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Text style={styles.sectionHeading}>Account</Text>

        <Pressable style={styles.row}>
          <Text style={styles.rowLabel}>Log out</Text>
        </Pressable>

        <Pressable style={[styles.row, styles.danger]}>
          <Text style={[styles.rowLabel, styles.dangerText]}>Delete profile</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  userCard: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, marginBottom: 24 },
  username: { fontSize: 20, fontWeight: '600' },
  userMeta: { fontSize: 14, color: '#666', marginTop: 2 },
  sectionHeading: { fontSize: 14, fontWeight: '600', color: '#666', textTransform: 'uppercase', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowLabel: { fontSize: 16 },
  chevron: { fontSize: 20, color: '#999' },
  danger: { marginTop: 16 },
  dangerText: { color: '#E63946' },
});