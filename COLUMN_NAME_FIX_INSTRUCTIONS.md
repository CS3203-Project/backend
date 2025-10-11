# Column Name Case-Sensitivity Fix - Instructions

This document provides instructions for fixing the PostgreSQL column name case-sensitivity error: `column s.postalcode does not exist` (Code: 42703)

## Problem

PostgreSQL is case-sensitive with column names when they are enclosed in double quotes in SQL queries. The error occurs because some of our column references are not properly quoted in SQL queries.

## Fix Instructions

1. Open the file:
   ```
   /media/k-indunil/New Volume/Zia/backend/src/services/serviceRequest.service.ts
   ```

2. Find the `findMatchingServices` function

3. Replace both SQL query sections with the properly quoted versions:

   For the first query with category filter:
   ```typescript
   matchingServices = await prisma.$queryRaw`
     SELECT 
       s."id", 
       s."title", 
       s."description", 
       s."price", 
       s."currency",
       s."address",
       s."city",
       s."state",
       s."country",
       s."postalCode",
       s."providerId",
       s."createdAt",
       1 - (s."combinedEmbedding" <=> ${serviceRequest.combinedEmbedding}) as similarity
     FROM "Service" s
     WHERE s."isActive" = true
     AND s."categoryId" = ${serviceRequest.categoryId}
     ORDER BY similarity DESC
     LIMIT ${limit}
     OFFSET ${skip}
   `;
   ```

   For the second query without category filter:
   ```typescript
   matchingServices = await prisma.$queryRaw`
     SELECT 
       s."id", 
       s."title", 
       s."description", 
       s."price", 
       s."currency",
       s."address",
       s."city",
       s."state",
       s."country",
       s."postalCode",
       s."providerId",
       s."createdAt",
       1 - (s."combinedEmbedding" <=> ${serviceRequest.combinedEmbedding}) as similarity
     FROM "Service" s
     WHERE s."isActive" = true
     ORDER BY similarity DESC
     LIMIT ${limit}
     OFFSET ${skip}
   `;
   ```

4. Also update the count queries with the same pattern:
   ```typescript
   countResult = await prisma.$queryRaw`
     SELECT COUNT(*) as total
     FROM "Service" s
     WHERE s."isActive" = true
     AND s."categoryId" = ${serviceRequest.categoryId}
   `;
   ```

   And:
   ```typescript
   countResult = await prisma.$queryRaw`
     SELECT COUNT(*) as total
     FROM "Service" s
     WHERE s."isActive" = true
   `;
   ```

## Key changes:
- Add double quotes around every column reference: `s.id` becomes `s."id"`
- Ensure consistent quoting throughout all SQL queries
- This ensures PostgreSQL treats the column names exactly as they are defined in the schema

## Testing
After making these changes, restart the server and test the service matching functionality again. The error should be resolved.

## Reference
A complete fixed version of the `findMatchingServices` function is available at:
`/media/k-indunil/New Volume/Zia/backend/src/services/fixed-findMatchingServices.js`