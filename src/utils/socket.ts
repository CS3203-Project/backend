import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

class SocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        socket.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Add socket to user's socket list
      if (socket.userId) {
        const userSockets = this.userSockets.get(socket.userId) || [];
        userSockets.push(socket.id);
        this.userSockets.set(socket.userId, userSockets);

        // Join user to their personal room
        socket.join(`user:${socket.userId}`);
      }

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        
        // Remove socket from user's socket list
        if (socket.userId) {
          const userSockets = this.userSockets.get(socket.userId) || [];
          const updatedSockets = userSockets.filter(id => id !== socket.id);
          
          if (updatedSockets.length === 0) {
            this.userSockets.delete(socket.userId);
          } else {
            this.userSockets.set(socket.userId, updatedSockets);
          }
        }
      });

      // Handle service-related messages
      socket.on('service-inquiry', (data: { serviceId: string, message: string }) => {
        // Emit to service provider
        socket.to(`service:${data.serviceId}`).emit('new-inquiry', data);
      });

      socket.on('join-service', (serviceId: string) => {
        socket.join(`service:${serviceId}`);
      });

      socket.on('leave-service', (serviceId: string) => {
        socket.leave(`service:${serviceId}`);
      });
    });
  }

  // Public methods for emitting events
  public emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public emitToService(serviceId: string, event: string, data: any) {
    this.io.to(`service:${serviceId}`).emit(event, data);
  }

  public emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Service-related broadcasting methods
  public broadcastServiceUpdate(service: any) {
    if (service.id) {
      this.emitToService(service.id, 'service-updated', service);
    }
  }

  public broadcastBookingUpdate(booking: any) {
    // Emit to both customer and provider
    if (booking.userId) {
      this.emitToUser(booking.userId, 'booking-updated', booking);
    }
    if (booking.providerId) {
      this.emitToUser(booking.providerId, 'booking-updated', booking);
    }
  }

  public getIO() {
    return this.io;
  }
}

export default SocketService;