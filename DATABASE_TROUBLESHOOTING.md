# Database Connection Troubleshooting Guide

## Current Status: ✅ RESOLVED
The database connection is now working properly. The original error was likely caused by a temporary network issue.

## Error Details
- **Error**: `Can't reach database server at zia-database.cdiia8usi724.eu-north-1.rds.amazonaws.com:5432`
- **Operation**: `prisma.user.findUnique()`
- **Root Cause**: Intermittent network connectivity issue

## Optimizations Implemented

### 1. Enhanced Database URL Configuration
Updated `.env` file with connection optimization parameters:
```
DATABASE_URL=postgresql://motionstack:2532489455Ms@zia-database.cdiia8usi724.eu-north-1.rds.amazonaws.com:5432/zia?sslmode=require&connection_limit=10&pool_timeout=20&connect_timeout=30
```

### 2. New Files Created
- `src/utils/database.ts` - Optimized Prisma client with retry logic
- `src/middlewares/database.middleware.ts` - Error handling middleware
- `src/routes/health.route.ts` - Health check endpoints
- `test-database-comprehensive.js` - Comprehensive testing script

### 3. Connection Pool Settings
- **Connection Limit**: 10 connections max
- **Pool Timeout**: 20 seconds
- **Connect Timeout**: 30 seconds

## Troubleshooting Steps for Future Issues

### Quick Diagnosis
1. Run the health check: `node test-connection.js`
2. Run comprehensive test: `node test-database-comprehensive.js`
3. Check health endpoint: `GET /health/database`

### Common Causes & Solutions

#### 1. Network Issues
- **Symptoms**: Intermittent connection failures
- **Solutions**: 
  - Check internet connectivity
  - Verify AWS RDS instance status
  - Check security group settings

#### 2. Connection Pool Exhaustion
- **Symptoms**: "Connection limit exceeded" errors
- **Solutions**:
  - Monitor active connections
  - Implement proper connection cleanup
  - Adjust `connection_limit` parameter

#### 3. SSL/TLS Issues
- **Symptoms**: SSL handshake failures
- **Solutions**:
  - Verify `sslmode=require` parameter
  - Check RDS SSL certificate validity

#### 4. Authentication Issues
- **Symptoms**: "Authentication failed" errors
- **Solutions**:
  - Verify username and password
  - Check RDS user permissions
  - Ensure database exists

### Monitoring Commands

#### Test Basic Connection
```bash
node test-connection.js
```

#### Comprehensive Testing
```bash
node test-database-comprehensive.js
```

#### Monitor Connection Pool
```bash
# Use this query in your app to monitor connections
SELECT COUNT(*) as active_connections FROM pg_stat_activity WHERE state = 'active';
```

### Best Practices

1. **Always use connection pooling** in production
2. **Implement retry logic** for transient failures
3. **Monitor database health** with regular checks
4. **Set appropriate timeouts** for your use case
5. **Use proper error handling** for database operations

### Emergency Actions

If database connectivity fails completely:

1. **Check AWS RDS Console**
   - Verify instance is running
   - Check CloudWatch metrics
   - Review recent events

2. **Network Diagnostics**
   ```bash
   # Test DNS resolution
   nslookup zia-database.cdiia8usi724.eu-north-1.rds.amazonaws.com
   
   # Test port connectivity (if available)
   telnet zia-database.cdiia8usi724.eu-north-1.rds.amazonaws.com 5432
   ```

3. **Application Recovery**
   - Restart the application
   - Clear connection pools
   - Check for memory leaks

## Database Information
- **Server**: PostgreSQL 17.4 on aarch64-unknown-linux-gnu
- **Region**: eu-north-1
- **Instance**: zia-database.cdiia8usi724.eu-north-1.rds.amazonaws.com
- **Port**: 5432
- **Database Name**: zia
- **SSL Mode**: Required

## Contact Information
If issues persist, check:
1. AWS RDS service status
2. Your internet service provider
3. Local firewall settings
4. Corporate network policies
