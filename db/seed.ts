import { db } from './client';
import { users, categories, books, user_books, reading_logs, targets } from './schema';

export async function seedDatabaseIfEmpty() {
  const existing = await db.select().from(users);
  if (existing.length > 0) return;

  // 1. User
  const [demoUser] = await db.insert(users).values({
    username: 'demo',
    password_hash: 'seeded_hash_placeholder',
  }).returning();

  // 2. Categories
  const [fiction] = await db.insert(categories).values({
    name: 'Fiction', colour: '#E63946', icon: '📖', user_id: demoUser.id,
  }).returning();

  const [nonFiction] = await db.insert(categories).values({
    name: 'Non-Fiction', colour: '#2A9D8F', icon: '📚', user_id: demoUser.id,
  }).returning();

  const [sciFi] = await db.insert(categories).values({
    name: 'Sci-Fi', colour: '#457B9D', icon: '🚀', user_id: demoUser.id,
  }).returning();

  const [biography] = await db.insert(categories).values({
    name: 'Biography', colour: '#F4A261', icon: '👤', user_id: demoUser.id,
  }).returning();

  // 3. Books
  const [dune] = await db.insert(books).values({
    title: 'Dune', author: 'Frank Herbert', total_pages: 688, isbn: '9780441172719',
  }).returning();

  const [atomicHabits] = await db.insert(books).values({
    title: 'Atomic Habits', author: 'James Clear', total_pages: 320, isbn: '9780735211292',
  }).returning();

  const [sapiens] = await db.insert(books).values({
    title: 'Sapiens', author: 'Yuval Noah Harari', total_pages: 443, isbn: '9780062316097',
  }).returning();

  const [steveJobs] = await db.insert(books).values({
    title: 'Steve Jobs', author: 'Walter Isaacson', total_pages: 656, isbn: '9781451648539',
  }).returning();

  // 4. User-books (demo user's personal reading list)
  const [ub1] = await db.insert(user_books).values({
    user_id: demoUser.id, book_id: dune.id, category_id: sciFi.id,
  }).returning();

  const [ub2] = await db.insert(user_books).values({
    user_id: demoUser.id, book_id: atomicHabits.id, category_id: nonFiction.id,
  }).returning();

  const [ub3] = await db.insert(user_books).values({
    user_id: demoUser.id, book_id: sapiens.id, category_id: nonFiction.id,
  }).returning();

  const [ub4] = await db.insert(user_books).values({
    user_id: demoUser.id, book_id: steveJobs.id, category_id: biography.id,
  }).returning();

  // 5. Reading logs — spread across last 3 weeks
  const today = new Date();
  const dateDaysAgo = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  await db.insert(reading_logs).values([
    { user_book_id: ub1.id, date: dateDaysAgo(0),  pages_read: 35, notes: 'Great opening' },
    { user_book_id: ub1.id, date: dateDaysAgo(1),  pages_read: 28, notes: null },
    { user_book_id: ub1.id, date: dateDaysAgo(3),  pages_read: 42, notes: null },
    { user_book_id: ub2.id, date: dateDaysAgo(1),  pages_read: 22, notes: 'Chapter on habits' },
    { user_book_id: ub2.id, date: dateDaysAgo(2),  pages_read: 30, notes: null },
    { user_book_id: ub2.id, date: dateDaysAgo(4),  pages_read: 25, notes: null },
    { user_book_id: ub3.id, date: dateDaysAgo(5),  pages_read: 40, notes: 'Dense but good' },
    { user_book_id: ub3.id, date: dateDaysAgo(7),  pages_read: 33, notes: null },
    { user_book_id: ub3.id, date: dateDaysAgo(8),  pages_read: 28, notes: null },
    { user_book_id: ub4.id, date: dateDaysAgo(9),  pages_read: 45, notes: null },
    { user_book_id: ub4.id, date: dateDaysAgo(10), pages_read: 38, notes: null },
    { user_book_id: ub4.id, date: dateDaysAgo(12), pages_read: 50, notes: 'Childhood section' },
    { user_book_id: ub1.id, date: dateDaysAgo(14), pages_read: 30, notes: null },
    { user_book_id: ub2.id, date: dateDaysAgo(15), pages_read: 20, notes: null },
    { user_book_id: ub3.id, date: dateDaysAgo(17), pages_read: 35, notes: null },
    { user_book_id: ub4.id, date: dateDaysAgo(19), pages_read: 42, notes: null },
  ]);

  // 6. Targets
  await db.insert(targets).values([
    { period: 'weekly',  pages_goal: 200, category_id: null,          user_id: demoUser.id },
    { period: 'monthly', pages_goal: 800, category_id: null,          user_id: demoUser.id },
    { period: 'weekly',  pages_goal: 100, category_id: nonFiction.id, user_id: demoUser.id },
  ]);
}