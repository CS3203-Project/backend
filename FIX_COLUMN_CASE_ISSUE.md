# Fix for PostgreSQL Column Case Sensitivity Issue

## Problem Identified
PostgreSQL error: `column s.postalcode does not exist` (Code: 42703)

This is happening because PostgreSQL is case-sensitive when it comes to column names enclosed in double quotes. In our database schema, the column is defined as `postalCode` with a capital "C", but in our SQL queries, we're referencing it inconsistently.

## Fix Plan

1. **Replace all occurrences of `s.postalCode` in queries with `s."postalCode"`**
   - PostgreSQL treats quoted identifiers as case-sensitive
   - The schema defines the column as `postalCode` (capital "C")
   - Using double quotes ensures exact case matching

2. **Implementation Steps**
   - Modify the SQL queries in the `findMatchingServices` function in `serviceRequest.service.ts`
   - Add quotes to all column names that use camelCase to be consistent
   - Test the matching services API endpoint after making these changes

3. **Terminal Command to Execute Fix**
```bash
cd "/media/k-indunil/New Volume/Zia/backend"
sed -i 's/s\.postalCode/s."postalCode"/g' src/services/serviceRequest.service.ts
```

4. **Verification Steps**
   - Test the matching services API after the fix is applied
   - Monitor the server logs for any related errors
   - Ensure the query is executed successfully with proper column names

## Best Practices Going Forward
- Always use double quotes for column names in PostgreSQL when using camelCase naming
- Be consistent with quoting style across all database queries
- For commonly used schemas, consider creating helper functions that generate the correctly formatted column references

## Notes for Future Development
- We may need to review other SQL queries for similar issues
- Consider adding a global utility function for generating consistent column references in SQL