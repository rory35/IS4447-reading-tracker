import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';


export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  password_hash: text('password_hash').notNull(),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  colour: text('colour').notNull(),
  icon: text('icon').notNull(),
  user_id: integer('user_id').notNull().references(() => users.id),
});

export const books = sqliteTable('books', {
    id: integer('id').primaryKey({ autoIncrement: true}),
    title: text('title').notNull(),
    author: text('author').notNull(),
    total_pages: integer('total_pages').notNull(),
    isbn: text('isbn').unique(),
   });

export const user_books = sqliteTable('user_books', {
    id: integer('id').primaryKey({ autoIncrement: true}),
    user_id: integer('user_id').notNull().references(() => users.id),
    book_id: integer('book_id').notNull().references(() => books.id),
    category_id: integer('category_id').notNull().references(() => categories.id),
    created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    })

export const reading_logs = sqliteTable('reading_logs',{
    id: integer('id').primaryKey({ autoIncrement: true}),
    user_book_id: integer('user_book_id').notNull().references(() => user_books.id),
    date: text('date').notNull(),
    pages_read: integer('pages_read').notNull(),
    notes: text('notes'),
    })

export const targets = sqliteTable('targets',{
    id: integer('id').primaryKey({ autoIncrement: true}),
    period: text('period').notNull(),
    pages_goal: integer('pages_goal').notNull(),
    category_id: integer('category_id').references(() => categories.id),
    user_id: integer('user_id').notNull().references(() => users.id),
    })



