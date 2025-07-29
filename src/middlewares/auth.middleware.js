
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { comparePassword } from '../utils/hash.js';

const prisma = new PrismaClient();

export const register = async (data) => {
  return await prisma.user.create({ data });
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { token, user };
};

export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      location: true,
      address: true,
      phoneNumber: true,
      createdAt: true,
      updatedAt: true,
      // password: false (not selected)
    }
  });
  return user;
};

export default {
  register,
  login,
  getProfile
};