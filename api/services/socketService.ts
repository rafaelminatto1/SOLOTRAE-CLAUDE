/**
 * Socket.IO service for real-time notifications
 */
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../types/index.js';

interface AuthenticatedSocket extends Socket {
  user?: User;
}

// Function to get JWT secret dynamically
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'fisioflow-secret-key';
  console.log('[SOCKET.IO] JWT_SECRET from env:', process.env.JWT_SECRET);
  console.log('[SOCKET.IO] Using JWT_SECRET:', secret);
  return secret;
};

class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      console.log('Socket.IO auth attempt:', {
        hasToken: !!socket.handshake.auth.token,
        authKeys: Object.keys(socket.handshake.auth),
        tokenPreview: socket.handshake.auth.token ? socket.handshake.auth.token.substring(0, 20) + '...' : 'none'
      });
      
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('Socket.IO auth failed: No token provided');
        return next(new Error('Authentication error'));
      }

      try {
        const jwtSecret = getJwtSecret();
        
        const decoded = jwt.verify(token, jwtSecret) as any;
        console.log('JWT decoded successfully:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
        
        // Map JWT payload to expected user structure
        socket.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
        next();
      } catch (err) {
        console.log('Socket.IO auth failed: JWT verification error:', err.message);
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.user?.id} connected`);
      
      // Store user connection
      if (socket.user?.id) {
        this.connectedUsers.set(socket.user.id.toString(), socket.id);
        
        // Join user to their own room
        socket.join(`user_${socket.user.id}`);
        
        // Join role-based rooms
        if (socket.user.role) {
          socket.join(`role_${socket.user.role}`);
        }
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user?.id} disconnected`);
        if (socket.user?.id) {
          this.connectedUsers.delete(socket.user.id.toString());
        }
      });

      // Handle joining appointment rooms
      socket.on('join_appointment', (appointmentId: string) => {
        socket.join(`appointment_${appointmentId}`);
        console.log(`User ${socket.user?.id} joined appointment ${appointmentId}`);
      });

      // Handle leaving appointment rooms
      socket.on('leave_appointment', (appointmentId: string) => {
        socket.leave(`appointment_${appointmentId}`);
        console.log(`User ${socket.user?.id} left appointment ${appointmentId}`);
      });
    });
  }

  // Send notification to specific user
  public notifyUser(userId: string, notification: any) {
    this.io.to(`user_${userId}`).emit('notification', notification);
  }

  // Send notification to all users with specific role
  public notifyRole(role: string, notification: any) {
    this.io.to(`role_${role}`).emit('notification', notification);
  }

  // Send notification to appointment participants
  public notifyAppointment(appointmentId: string, notification: any) {
    this.io.to(`appointment_${appointmentId}`).emit('appointment_update', notification);
  }

  // Broadcast to all connected users
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is online
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get Socket.IO instance
  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default SocketService;