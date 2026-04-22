import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'current_user_id';

// Hash a password with a salt. Returns "salt:hash" string.
export async function hashPassword(password: string): Promise<string> {
  const salt = await Crypto.randomUUID();
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + password
  );
  return `${salt}:${hash}`;
}

// Verify a password against a stored "salt:hash".
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const testHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + password
  );
  return testHash === hash;
}

// Session storage
export async function saveSession(userId: number): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, userId.toString());
}

export async function getSession(): Promise<number | null> {
  const value = await SecureStore.getItemAsync(SESSION_KEY);
  return value ? parseInt(value, 10) : null;
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}