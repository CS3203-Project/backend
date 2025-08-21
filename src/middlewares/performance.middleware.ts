import { Request, Response, NextFunction } from 'express';

interface RequestWithTiming extends Request {
  startTime?: number;
}

export const performanceMonitor = (req: RequestWithTiming, res: Response, next: NextFunction) => {
  req.startTime = Date.now();
  
  // Override the end method to capture response time
  const originalEnd = res.end;
  
  res.end = function(this: Response, ...args: any[]) {
    const responseTime = Date.now() - (req.startTime || 0);
    
    // Log slow requests (over 1 second)
    if (responseTime > 1000) {
      console.warn(`🐌 Slow request: ${req.method} ${req.path} - ${responseTime}ms`);
    }
    
    // Set header if response hasn't been sent yet
    if (!this.headersSent) {
      try {
        this.set('X-Response-Time', `${responseTime}ms`);
      } catch (error) {
        // Ignore if headers are already sent
        console.debug('Could not set response time header:', error.message);
      }
    }
    
    // Call the original end method
    return originalEnd.apply(this, args);
  };
  
  next();
};

// Log memory usage periodically
export const logMemoryUsage = () => {
  const used = process.memoryUsage();
  const memoryInfo = {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100
  };
  
  console.log(`📊 Memory Usage: RSS: ${memoryInfo.rss}MB, Heap: ${memoryInfo.heapUsed}/${memoryInfo.heapTotal}MB, External: ${memoryInfo.external}MB`);
};

// Start memory monitoring (every 5 minutes)
setInterval(logMemoryUsage, 5 * 60 * 1000);
