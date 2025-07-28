

## Setup Guide

## 1. Environment Variables (.env)

Create a `.env` file in your project root with the following format:

```
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>"
```
Example:
```
DATABASE_URL="postgresql://postgres:253248@localhost:5432/Zia"
```

## 2. Initialize Database & Migrations

To set up your database tables for the first time, run:
```
npx prisma migrate dev --name init
```
This will:
- Create the initial migration based on your Prisma schema
- Apply the migration to your database
- Generate the Prisma Client for your models

## 3. Generate Prisma Client

If you change your schema or want to regenerate the client, run:
```
npx prisma generate
```
This will generate the Prisma Client in `node_modules/@prisma/client` for use in your code.

## 4. Seeding the Database

To insert initial data (seed), run:
```
npx prisma db seed
```
This will execute the seed script defined in your `package.json` (usually `prisma/seed.js` or `prisma/seed.ts`).

## 5. Updating the Database After Schema Changes

If you edit your Prisma model in `prisma/schema.prisma`, you must create and apply a new migration:
```
npx prisma migrate dev --name <migration-name>
```
Replace `<migration-name>` with a descriptive name for your change (e.g., add-user-age).
This will:
- Create a migration file for your changes
- Apply the migration to your database
- Update the Prisma Client

## Summary of Commands

- **Initialize database:**
  ```
  npx prisma migrate dev --name init
  ```
- **Generate Prisma Client:**
  ```
  npx prisma generate
  ```
- **Seed database:**
  ```
  npx prisma db seed
  ```
- **Apply schema changes:**
  ```
  npx prisma migrate dev --name <migration-name>
  ```

## Notes
- Always update your `.env` file with the correct database connection string before running migrations or seeds.
- After editing your schema, always run a migration and regenerate the Prisma Client.

