import { hash as _hash, compare } from 'bcrypt';

export async function hashPassword(plainText) {
  return await _hash(plainText, 10);
}

export async function comparePassword(plainText, hash) {
  return await compare(plainText, hash);
}
