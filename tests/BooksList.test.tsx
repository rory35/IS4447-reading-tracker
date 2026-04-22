import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import BooksScreen from '../app/(tabs)/index';
import { AppContext } from '../app/_layout';

jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useFocusEffect: (cb: any) => cb(),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

const mockBook = {
  user_books: { id: 1, user_id: 1, book_id: 1, category_id: 1 },
  books: { id: 1, title: 'Test Book', author: 'Test Author', total_pages: 200, isbn: null },
  categories: { id: 1, name: 'Fiction', colour: '#E63946', icon: '📖' },
};

const mockCategory = {
  id: 1, name: 'Fiction', colour: '#E63946', icon: '📖', user_id: 1,
};

describe('BooksScreen', () => {
  it('renders the seeded book and add button', async () => {
    const { getByText } = render(
      <AppContext.Provider
        value={{
          currentUserId: 1,
          setCurrentUserId: jest.fn(),
          logout: jest.fn(),
          books: [mockBook],
          categories: [mockCategory],
          refreshBooks: jest.fn(),
          refreshCategories: jest.fn(),
        }}
      >
        <BooksScreen />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Test Book')).toBeTruthy();
      expect(getByText('Test Author')).toBeTruthy();
      expect(getByText('+ Add Book')).toBeTruthy();
    });
  });
});