
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/hash.js";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function seed() {
  console.log("Starting seed process...");

  // Read category data from JSON file
  const categoryDataPath = path.join(process.cwd(), "category_dataset.json");
  const categoryData = JSON.parse(fs.readFileSync(categoryDataPath, "utf8"));

  console.log("Seeding categories...");

  // Create main categories first
  for (const category of categoryData.categories) {
    const mainCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: null,
      },
    });

    console.log(`Created main category: ${mainCategory.name}`);

    // Create subcategories
    if (category.subcategories) {
      for (const subCategory of category.subcategories) {
        const createdSubCategory = await prisma.category.upsert({
          where: { slug: subCategory.slug },
          update: {},
          create: {
            name: subCategory.name,
            slug: subCategory.slug,
            description: subCategory.description,
            parentId: mainCategory.id,
          },
        });
        console.log(`  Created subcategory: ${createdSubCategory.name}`);
      }
    }
  }
  console.log("Seed process completed successfully!");
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