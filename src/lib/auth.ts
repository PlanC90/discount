import { supabase } from './supabase';
// lib/auth.js dosyasında
export const hashPassword = async (password: string): Promise<string> => {
  // Basit bir hash örneği (gerçek uygulamada bcrypt gibi daha güçlü bir çözüm kullanın)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};
