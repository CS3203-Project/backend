
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/hash.js";

const prisma = new PrismaClient();

async function seed() {
  const adminPassword = await hashPassword("admin123");
  const userPassword = await hashPassword("user123");
  await prisma.user.createMany({
    data: [
      {
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
        password: adminPassword,
        imageUrl: "https://example.com/avatar.png",
        location: "New York",
        phoneNumber: "1234567890"
      },
      {
        email: "user@example.com",
        firstName: "Regular",
        lastName: "User",
        password: userPassword,
        imageUrl: "https://example.com/avatar2.png",
        location: "Los Angeles",
        phoneNumber: "0987654321"
      }
    ]
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