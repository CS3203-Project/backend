
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/hash.js";

const prisma = new PrismaClient();

async function seed() {
  const adminPassword = await hashPassword("admin123");
  const userPassword = await hashPassword("user123");
  await prisma.user.createMany({
    data: []
  });
}

seed()
  .then(() => {
    console.log("Seeding completed successfully.");
  })
  .catch((error) => {
    console.error("Error during seeding:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });