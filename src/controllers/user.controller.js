import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createUser = async (req, res) => {
  const { email, firstName, lastName, password, imageUrl, location, address, phoneNumber } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password,
        imageUrl,
        location,
        address,
        phoneNumber,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};
