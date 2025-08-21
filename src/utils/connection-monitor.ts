import { prisma } from './database.js';

interface ConnectionPoolStats {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  timestamp: string;
}

export class ConnectionPoolMonitor {
  private static logInterval: NodeJS.Timeout | null = null;

  /**
   * Start monitoring connection pool status
   * @param intervalMs - Monitoring interval in milliseconds (default: 30000ms = 30s)
   */
  static startMonitoring(intervalMs: number = 30000): void {
    if (this.logInterval) {
      console.log('⚠️ Connection pool monitoring is already running');
      return;
    }

    console.log(`📊 Starting connection pool monitoring (every ${intervalMs/1000}s)`);
    
    this.logInterval = setInterval(async () => {
      try {
        const stats = await this.getConnectionStats();
        console.log(`📊 Pool Stats: Active: ${stats.activeConnections}, Idle: ${stats.idleConnections}, Total: ${stats.totalConnections}`);
        
        // Warn if pool is getting full
        if (stats.totalConnections > 15) {
          console.warn(`⚠️ Connection pool usage high: ${stats.totalConnections}/20 connections`);
        }
      } catch (error) {
        console.error('❌ Failed to get connection pool stats:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop monitoring connection pool status
   */
  static stopMonitoring(): void {
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = null;
      console.log('📊 Connection pool monitoring stopped');
    }
  }

  /**
   * Get current connection pool statistics
   */
  static async getConnectionStats(): Promise<ConnectionPoolStats> {
    try {
      const result = await prisma.$queryRaw<Array<{ count: number; state: string }>>`
        SELECT COUNT(*) as count, state 
        FROM pg_stat_activity 
        WHERE datname = current_database() 
        GROUP BY state
      `;

      let activeConnections = 0;
      let idleConnections = 0;
      let totalConnections = 0;

      result.forEach((row: any) => {
        const count = parseInt(row.count.toString());
        totalConnections += count;
        
        if (row.state === 'active') {
          activeConnections = count;
        } else if (row.state === 'idle') {
          idleConnections = count;
        }
      });

      return {
        activeConnections,
        idleConnections,
        totalConnections,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get connection stats:', error);
      return {
        activeConnections: -1,
        idleConnections: -1,
        totalConnections: -1,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Force close idle connections (use with caution)
   */
  static async closeIdleConnections(): Promise<void> {
    try {
      await prisma.$queryRaw`
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = current_database() 
        AND state = 'idle' 
        AND query_start < NOW() - INTERVAL '5 minutes'
      `;
      console.log('✅ Closed idle connections older than 5 minutes');
    } catch (error) {
      console.error('❌ Failed to close idle connections:', error);
    }
  }
}

// Export for easy access
export type { ConnectionPoolStats };
