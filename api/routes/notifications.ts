/**
 * Notification routes
 */
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import NotificationService from '../services/notificationService.js';
import SocketService from '../services/socketService.js';

const router = express.Router();

// This will be injected when the routes are registered
let notificationService: NotificationService;

export function setNotificationService(service: NotificationService) {
  notificationService = service;
}

// Get user notifications
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user!.id.toString();
    const limit = parseInt(req.query.limit as string) || 50;
    
    const notifications = notificationService.getUserNotifications(userId, limit);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Get unread notifications count
router.get('/unread-count', authenticateToken, (req, res) => {
  try {
    const userId = req.user!.id.toString();
    const count = notificationService.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user!.id.toString();
    
    const success = notificationService.markAsRead(notificationId, userId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Notificação marcada como lida'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, (req, res) => {
  try {
    const userId = req.user!.id.toString();
    const count = notificationService.markAllAsRead(userId);
    
    res.json({
      success: true,
      message: `${count} notificações marcadas como lidas`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user!.id.toString();
    
    const success = notificationService.deleteNotification(notificationId, userId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Notificação excluída'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Create notification (admin only)
router.post('/', authenticateToken, (req, res) => {
  try {
    // Only admin can create notifications manually
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }
    
    const { userId, type, title, message, data } = req.body;
    
    // Validate required fields
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: userId, type, title, message'
      });
    }
    
    // Validate type
    const validTypes = ['appointment', 'reminder', 'system', 'treatment', 'progress'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de notificação inválido'
      });
    }
    
    const notification = notificationService.createNotification({
      userId,
      type,
      title,
      message,
      data
    });
    
    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notificação criada'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;