import { useCallback, useContext, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { eq, gte, and } from 'drizzle-orm';

import { AppContext } from './_layout';
import { db } from '@/db/client';
import { targets, reading_logs, user_books } from '@/db/schema';
import PrimaryButton from '@/components/ui/primary-button';
import { Colors } from '@/constants/theme';

const C = Colors.light;

type TargetRow = {
  id: number;
  period: string;
  pages_goal: number;
  category_id: number | null;
  categoryName: string | null;
  categoryColour: string | null;
  progress: number;
};

export default function TargetsScreen() {
  const router = useRouter();
  const { currentUserId, categories } = useContext(AppContext);
  const [rows, setRows] = useState<TargetRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (currentUserId === null) return;
        const allTargets = await db.select().from(targets).where(eq(targets.user_id, currentUserId));

        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        const monthStart = new Date(now);
        monthStart.setDate(now.getDate() - 30);

        const results: TargetRow[] = [];

        for (const t of allTargets) {
          const since = (t.period === 'weekly' ? weekStart : monthStart).toISOString().split('T')[0];

          let logs;
          if (t.category_id === null) {
            logs = await db
              .select()
              .from(reading_logs)
              .innerJoin(user_books, eq(reading_logs.user_book_id, user_books.id))
              .where(and(eq(user_books.user_id, currentUserId), gte(reading_logs.date, since)));
          } else {
            logs = await db
              .select()
              .from(reading_logs)
              .innerJoin(user_books, eq(reading_logs.user_book_id, user_books.id))
              .where(and(
                eq(user_books.user_id, currentUserId),
                eq(user_books.category_id, t.category_id),
                gte(reading_logs.date, since),
              ));
          }

          const progress = logs.reduce((sum: number, l: any) => sum + l.reading_logs.pages_read, 0);
          const cat = categories.find(c => c.id === t.category_id);

          results.push({
            id: t.id,
            period: t.period,
            pages_goal: t.pages_goal,
            category_id: t.category_id,
            categoryName: cat?.name ?? null,
            categoryColour: cat?.colour ?? null,
            progress,
          });
        }

        setRows(results);
      })();
    }, [categories, currentUserId])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading} accessibilityRole="header">Targets</Text>

      <PrimaryButton
        label="+ Add Target"
        onPress={() => router.push('/target/add')}
      />

      {rows.length === 0 ? (
        <Text style={styles.empty}>No targets yet.</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          renderItem={({ item }) => {
            const percent = Math.min(100, Math.round((item.progress / item.pages_goal) * 100));
            const met = item.progress >= item.pages_goal;
            const summary = `${item.period} target, ${item.categoryName ?? 'all categories'}, ${item.progress} of ${item.pages_goal} pages, ${met ? 'met' : percent + ' percent'}`;

            return (
              <Pressable
                accessibilityLabel={`${summary}, edit`}
                accessibilityRole="button"
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => router.push(`/target/${item.id}`)}
              >
                <View style={styles.cardHead}>
                  <Text style={styles.cardTitle}>
                    {item.period === 'weekly' ? 'Weekly' : 'Monthly'}
                    {item.categoryName ? ` · ${item.categoryName}` : ' · All'}
                  </Text>
                  <Text style={[styles.status, met ? styles.statusMet : styles.statusUnmet]}>
                    {met ? 'MET' : `${percent}%`}
                  </Text>
                </View>

                <Text style={styles.progressText}>
                  {item.progress} / {item.pages_goal} pages
                </Text>

                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${percent}%`,
                        backgroundColor: met ? C.success : (item.categoryColour ?? C.primary),
                      },
                    ]}
                  />
                </View>

                {!met && (
                  <Text style={styles.remaining}>
                    {item.pages_goal - item.progress} pages remaining
                  </Text>
                )}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: C.background },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: C.text },
  list: { marginTop: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: C.textMuted },
  card: { backgroundColor: C.surface, padding: 14, borderRadius: 12, marginBottom: 10 },
  pressed: { opacity: 0.7 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: C.text },
  status: { fontSize: 12, fontWeight: '700' },
  statusMet: { color: C.success },
  statusUnmet: { color: C.textMuted },
  progressText: { color: C.textMuted, marginBottom: 6 },
  barBg: { height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  remaining: { fontSize: 12, color: C.textMuted, marginTop: 6 },
});