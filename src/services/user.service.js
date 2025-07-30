
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { comparePassword, hashPassword } from '../utils/hash.js';

const prisma = new PrismaClient();

export const register = async ({ email, firstName, lastName, password, imageUrl, location, address, phoneNumber }) => {
  const hashedPassword = await hashPassword(password);
  return await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      password: hashedPassword,
      imageUrl,
      location,
      address,
      phoneNumber,
    },
  });
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
    },
  });
  if (!user) throw new Error('User not found');
  return user;
}

export const updateProfile = async (userId, data) => {
  const updatedData = {};
  if (data.firstName) updatedData.firstName = data.firstName;
  if (data.lastName) updatedData.lastName = data.lastName;
  if (data.imageUrl) updatedData.imageUrl = data.imageUrl;
  if (data.location) updatedData.location = data.location;
  if (data.address) updatedData.address = data.address;
  if (data.phoneNumber) updatedData.phoneNumber = data.phoneNumber;

  return await prisma.user.update({
    where: { id: userId },
    data: updatedData,
  });
}

export const deleteProfile = async (userId) => {
  await prisma.user.delete({
    where: { id: userId },
  });
}