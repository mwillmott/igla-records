import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.SESSION_SECRET || 'igla-records-super-secret-key-32-chars-long-or-longer!';

export interface UserSession {
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
}

export function encryptSession(data: UserSession): string {
  const text = JSON.stringify(data);
  // Derive key using pbkdf2 or scrypt
  const key = crypto.scryptSync(SECRET, 'igla-salt', 32);
  const iv = crypto.randomBytes(12); // AES-GCM standard IV length is 12 bytes
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  
  // Return IV, tag, and ciphertext joined together
  return `${iv.toString('hex')}.${tag}.${encrypted}`;
}

export function decryptSession(token: string): UserSession | null {
  try {
    const [ivHex, tagHex, encryptedHex] = token.split('.');
    if (!ivHex || !tagHex || !encryptedHex) return null;
    
    const key = crypto.scryptSync(SECRET, 'igla-salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted) as UserSession;
  } catch (e) {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('igla_session');
  if (!sessionCookie || !sessionCookie.value) return null;
  return decryptSession(sessionCookie.value);
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === 'admin';
}
