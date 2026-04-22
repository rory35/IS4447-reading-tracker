import { useCallback, useContext, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { eq, gte, and } from 'drizzle-orm';

import { AppContext } from '../_layout';
import { db } from '@/db/client';
import { reading_logs, user_books, books, targets } from '@/db/schema';

type Period = 'week' | 'month' | 'year';

export default function InsightsScreen() {
  const { currentUserId, categories } = useContext(AppContext);
  const [period, setPeriod] = useState<Period>('week');
  const [logs, setLogs] = useState<any[]>([]);
  const [booksReadCount, setBooksReadCount] = useState(0);
  const [userTargets, setUserTargets] = useState<any[]>([]);
  const [targetProgress, setTargetProgress] = useState<Record<number, number>>({});

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (currentUserId === null) return;

        const now = new Date();
        const since = new Date(now);
        if (period === 'week') since.setDate(now.getDate() - 6);
        if (period === 'month') since.setDate(now.getDate() - 29);
        if (period === 'year') since.setDate(now.getDate() - 364);
        const sinceStr = since.toISOString().split('T')[0];

        // Logs for the stats/pie
        const rows = await db
          .select()
          .from(reading_logs)
          .innerJoin(user_books, eq(reading_logs.user_book_id, user_books.id))
          .where(and(
            eq(user_books.user_id, currentUserId),
            gte(reading_logs.date, sinceStr),
          ));
        setLogs(rows);

        // Books read: books where cumulative pages read >= total_pages
        const allUserBooks = await db
          .select()
          .from(user_books)
          .innerJoin(books, eq(user_books.book_id, books.id))
          .where(eq(user_books.user_id, currentUserId));

        let finished = 0;
        for (const ub of allUserBooks) {
          const allLogs = await db
            .select()
            .from(reading_logs)
            .where(eq(reading_logs.user_book_id, ub.user_books.id));
          const totalRead = allLogs.reduce((sum, l) => sum + l.pages_read, 0);
          if (totalRead >= ub.books.total_pages) finished++;
        }
        setBooksReadCount(finished);

        // Targets and their progress
        const allTargets = await db.select().from(targets).where(eq(targets.user_id, currentUserId));
        setUserTargets(allTargets);

        const progress: Record<number, number> = {};
        for (const t of allTargets) {
          const windowStart = new Date(now);
          windowStart.setDate(now.getDate() - (t.period === 'weekly' ? 6 : 29));
          const windowStartStr = windowStart.toISOString().split('T')[0];

          let tLogs;
          if (t.category_id === null) {
            tLogs = await db
              .select()
              .from(reading_logs)
              .innerJoin(user_books, eq(reading_logs.user_book_id, user_books.id))
              .where(and(eq(user_books.user_id, currentUserId), gte(reading_logs.date, windowStartStr)));
          } else {
            tLogs = await db
              .select()
              .from(reading_logs)
              .innerJoin(user_books, eq(reading_logs.user_book_id, user_books.id))
              .where(and(
                eq(user_books.user_id, currentUserId),
                eq(user_books.category_id, t.category_id),
                gte(reading_logs.date, windowStartStr),
              ));
          }
          progress[t.id] = tLogs.reduce((sum: number, l: any) => sum + l.reading_logs.pages_read, 0);
        }
        setTargetProgress(progress);
      })();
    }, [period, currentUserId])
  );

  // Stats
  const totalPages = logs.reduce((sum: number, l: any) => sum + l.reading_logs.pages_read, 0);
  const daysWithReading = new Set(logs.map((l: any) => l.reading_logs.date)).size;
  const avgPerDay = daysWithReading > 0 ? Math.round(totalPages / daysWithReading) : 0;

  // Pie data
  const pieData = categories.map((cat) => {
    const pages = logs
      .filter((l: any) => l.user_books.category_id === cat.id)
      .reduce((sum: number, l: any) => sum + l.reading_logs.pages_read, 0);
    return {
      name: cat.name,
      pages,
      color: cat.colour,
      legendFontColor: '#333',
      legendFontSize: 12,
    };
  }).filter(d => d.pages > 0);

  const screenWidth = Dimensions.get('window').width - 32;
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
    labelColor: () => '#333',
    decimalPlaces: 0,
  };

  // Target ahead/behind logic
  const now = new Date();
  const getTargetStatus = (t: any) => {
    const totalDays = t.period === 'weekly' ? 7 : 30;
    const start = new Date(now);
    start.setDate(now.getDate() - (totalDays - 1));
    const daysElapsed = Math.min(totalDays, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const expected = Math.round((t.pages_goal / totalDays) * daysElapsed);
    const actual = targetProgress[t.id] ?? 0;
    const diff = actual - expected;
    const percent = Math.min(100, Math.round((actual / t.pages_goal) * 100));
    const met = actual >= t.pages_goal;

    return { expected, actual, diff, percent, met };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">Reading Stats</Text>

        <View style={styles.periodRow}>
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <Pressable
              key={p}
              accessibilityLabel={`View last ${p}`}
              accessibilityRole="button"
              onPress={() => setPeriod(p)}
              style={[styles.periodChip, period === p && styles.periodChipSelected]}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextSelected]}>
                {p === 'week' ? 'Last 7 days' : p === 'month' ? 'Last 30 days' : 'Last year'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalPages}</Text>
            <Text style={styles.statLabel}>Pages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{daysWithReading}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avgPerDay}</Text>
            <Text style={styles.statLabel}>Avg/day</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{booksReadCount}</Text>
            <Text style={styles.statLabel}>Books read</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading} accessibilityRole="header">Pages by Category</Text>

        {pieData.length === 0 ? (
          <Text style={styles.empty}>No category data yet.</Text>
        ) : (
          <PieChart
            data={pieData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="pages"
            backgroundColor="transparent"
            paddingLeft="12"
            style={styles.chart}
          />
        )}

        <Text style={styles.sectionHeading} accessibilityRole="header">Targets</Text>

        {userTargets.length === 0 ? (
          <Text style={styles.empty}>No targets set. Create one in your profile.</Text>
        ) : (
          userTargets.map((t) => {
            const cat = categories.find(c => c.id === t.category_id);
            const { expected, actual, diff, percent, met } = getTargetStatus(t);
            const statusLabel = met
              ? 'Goal met!'
              : diff > 0
                ? `+${diff} pages ahead`
                : diff < 0
                  ? `${Math.abs(diff)} pages behind`
                  : 'On track';
            const statusColour = met
              ? '#2A9D8F'
              : diff >= 0
                ? '#2A9D8F'
                : '#E63946';

            return (
              <View key={t.id} style={styles.targetCard}>
                <View style={styles.targetHead}>
                  <Text style={styles.targetTitle}>
                    {t.period === 'weekly' ? 'Weekly' : 'Monthly'} · {cat?.name ?? 'All'}
                  </Text>
                  <Text style={[styles.targetStatus, { color: statusColour }]}>{statusLabel}</Text>
                </View>
                <Text style={styles.targetProgressText}>
                  {actual} / {t.pages_goal} pages (expected {expected} by now)
                </Text>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${percent}%`,
                        backgroundColor: met ? '#2A9D8F' : (cat?.colour ?? '#457B9D'),
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodChip: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  periodChipSelected: { backgroundColor: '#0F766E' },
  periodText: { fontSize: 12, fontWeight: '600', color: '#333' },
  periodTextSelected: { color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#f5f5f5', padding: 10, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#0F766E' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 2, textAlign: 'center' },
  sectionHeading: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  chart: { borderRadius: 12 },
  empty: { textAlign: 'center', color: '#666', padding: 20 },
  targetCard: { backgroundColor: '#f9f9f9', padding: 14, borderRadius: 12, marginBottom: 10 },
  targetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  targetTitle: { fontSize: 16, fontWeight: '600' },
  targetStatus: { fontSize: 12, fontWeight: '700' },
  targetProgressText: { color: '#444', marginBottom: 6, fontSize: 13 },
  barBg: { height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
});