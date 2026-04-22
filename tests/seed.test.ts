import { db } from '../db/client';
import { seedDatabaseIfEmpty } from '../db/seed';

jest.mock('../db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

const mockDb = db as unknown as { select: jest.Mock; insert: jest.Mock };

describe('seedDatabaseIfEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts seed data when the database is empty', async () => {
    const mockReturning = jest.fn().mockResolvedValue([{ id: 1 }]);
    const mockFrom = jest.fn().mockResolvedValue([]);

    mockDb.select.mockReturnValue({ from: mockFrom });
    mockDb.insert.mockImplementation(() => ({
      values: jest.fn().mockImplementation(() => ({
        returning: mockReturning,
      })),
    }));

    await seedDatabaseIfEmpty();

    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('does nothing when users already exist', async () => {
    const mockFrom = jest.fn().mockResolvedValue([
      { id: 1, username: 'existing', password_hash: 'x', created_at: '2024-01-01' },
    ]);
    mockDb.select.mockReturnValue({ from: mockFrom });

    await seedDatabaseIfEmpty();

    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});