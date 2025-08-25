/**
 * Notification service for managing and sending notifications
 */
import SocketService from './socketService.js';
import { database } from '../database/index.js';

export interface Notification {
  id?: string;
  userId: string;
  type: 'appointment' | 'reminder' | 'system' | 'treatment' | 'progress';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

class NotificationService {
  private socketService: SocketService;

  constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  // Create and send notification
  public async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString()
    };

    // Save to database
    const stmt = database.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, data, read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      newNotification.id,
      newNotification.userId,
      newNotification.type,
      newNotification.title,
      newNotification.message,
      JSON.stringify(newNotification.data || {}),
      newNotification.read ? 1 : 0,
      newNotification.createdAt
    );

    // Send real-time notification
    this.socketService.notifyUser(newNotification.userId, newNotification);

    return newNotification;
  }

  // Get user notifications
  public getUserNotifications(userId: string, limit: number = 50): Notification[] {
    const stmt = database.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    
    const rows = stmt.all(userId, limit) as any[];
    
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      data: JSON.parse(row.data || '{}'),
      read: Boolean(row.read),
      createdAt: row.created_at
    }));
  }

  // Mark notification as read
  public markAsRead(notificationId: string, userId: string): boolean {
    const stmt = database.prepare(`
      UPDATE notifications 
      SET read = 1 
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(notificationId, userId);
    return result.changes > 0;
  }

  // Mark all notifications as read for user
  public markAllAsRead(userId: string): number {
    const stmt = database.prepare(`
      UPDATE notifications 
      SET read = 1 
      WHERE user_id = ? AND read = 0
    `);
    
    const result = stmt.run(userId);
    return result.changes;
  }

  // Get unread count
  public getUnreadCount(userId: string): number {
    const stmt = database.prepare(`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND read = 0
    `);
    
    const result = stmt.get(userId) as any;
    return result.count;
  }

  // Delete notification
  public deleteNotification(notificationId: string, userId: string): boolean {
    const stmt = database.prepare(`
      DELETE FROM notifications 
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(notificationId, userId);
    return result.changes > 0;
  }

  // Notification templates for common scenarios
  public async notifyAppointmentCreated(appointmentId: string, patientId: string, physiotherapistId: string, appointmentDate: string) {
    // Notify patient
    await this.createNotification({
      userId: patientId,
      type: 'appointment',
      title: 'Agendamento Confirmado',
      message: `Seu agendamento foi confirmado para ${new Date(appointmentDate).toLocaleString('pt-BR')}`,
      data: { appointmentId, type: 'created' }
    });

    // Notify physiotherapist
    await this.createNotification({
      userId: physiotherapistId,
      type: 'appointment',
      title: 'Novo Agendamento',
      message: `Você tem um novo agendamento para ${new Date(appointmentDate).toLocaleString('pt-BR')}`,
      data: { appointmentId, type: 'created' }
    });
  }

  public async notifyAppointmentCancelled(appointmentId: string, patientId: string, physiotherapistId: string, appointmentDate: string) {
    // Notify patient
    await this.createNotification({
      userId: patientId,
      type: 'appointment',
      title: 'Agendamento Cancelado',
      message: `Seu agendamento de ${new Date(appointmentDate).toLocaleString('pt-BR')} foi cancelado`,
      data: { appointmentId, type: 'cancelled' }
    });

    // Notify physiotherapist
    await this.createNotification({
      userId: physiotherapistId,
      type: 'appointment',
      title: 'Agendamento Cancelado',
      message: `O agendamento de ${new Date(appointmentDate).toLocaleString('pt-BR')} foi cancelado`,
      data: { appointmentId, type: 'cancelled' }
    });
  }

  public async notifyAppointmentReminder(appointmentId: string, userId: string, appointmentDate: string) {
    await this.createNotification({
      userId,
      type: 'reminder',
      title: 'Lembrete de Agendamento',
      message: `Você tem um agendamento em 1 hora: ${new Date(appointmentDate).toLocaleString('pt-BR')}`,
      data: { appointmentId, type: 'reminder' }
    });
  }

  public async notifyTreatmentPlanUpdated(planId: string, patientId: string) {
    await this.createNotification({
      userId: patientId,
      type: 'treatment',
      title: 'Plano de Tratamento Atualizado',
      message: 'Seu plano de tratamento foi atualizado. Confira os novos exercícios!',
      data: { planId, type: 'updated' }
    });
  }

  public async notifyProgressMilestone(patientId: string, milestone: string) {
    await this.createNotification({
      userId: patientId,
      type: 'progress',
      title: 'Parabéns! Meta Alcançada',
      message: `Você alcançou uma nova meta: ${milestone}`,
      data: { milestone, type: 'achievement' }
    });
  }
}

export default NotificationService;