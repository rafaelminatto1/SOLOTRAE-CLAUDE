/**
 * local server entry file, for local development
 */
// Load environment variables first, before any imports
import * as dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './app.js';
import SocketService from './services/socketService.js';
import NotificationService from './services/notificationService.js';
import { setNotificationService } from './routes/notifications.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const socketService = new SocketService(server);
const notificationService = new NotificationService(socketService);

// Set notification service for routes
setNotificationService(notificationService);

// Start server
server.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time notifications`);
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;