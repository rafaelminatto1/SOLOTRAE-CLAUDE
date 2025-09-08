import React, { useState } from 'react';
import { Bell, Settings, Filter, Search, Check, CheckCheck, Trash2, Archive, Star, AlertCircle, Info, CheckCircle, Calendar, MessageSquare, CreditCard, Stethoscope, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'exercise' | 'payment' | 'system' | 'social' | 'achievement' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  archived: boolean;
  starred: boolean;
  timestamp: Date;
  actions?: Array<{
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    action: string;
  }>;
  metadata?: {
    userId?: string;
    userName?: string;
    appointmentId?: string;
    paymentId?: string;
    exerciseId?: string;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  starred: number;
  archived: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nova Consulta Agendada',
    message: 'João Silva agendou uma consulta para 15/01/2025 às 14:00',
    type: 'appointment',
    priority: 'high',
    read: false,
    archived: false,
    starred: true,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    actions: [
      { id: 'confirm', label: 'Confirmar', type: 'primary', action: 'confirm_appointment' },
      { id: 'reschedule', label: 'Reagendar', type: 'secondary', action: 'reschedule_appointment' }
    ],
    metadata: {
      userId: 'user_123',
      userName: 'João Silva',
      appointmentId: 'apt_456'
    }
  },
  {
    id: '2',
    title: 'Pagamento Recebido',
    message: 'Pagamento de R$ 150,00 de Maria Santos foi confirmado',
    type: 'payment',
    priority: 'medium',
    read: false,
    archived: false,
    starred: false,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    actions: [
      { id: 'receipt', label: 'Ver Recibo', type: 'primary', action: 'view_receipt' }
    ],
    metadata: {
      userId: 'user_789',
      userName: 'Maria Santos',
      paymentId: 'pay_321'
    }
  },
  {
    id: '3',
    title: 'Sistema de Backup Concluído',
    message: 'Backup automático dos dados foi realizado com sucesso às 02:00',
    type: 'system',
    priority: 'low',
    read: true,
    archived: false,
    starred: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    metadata: {}
  },
  {
    id: '4',
    title: 'Exercício Não Realizado',
    message: 'Carlos Lima não realizou os exercícios programados para hoje',
    type: 'exercise',
    priority: 'medium',
    read: false,
    archived: false,
    starred: false,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    actions: [
      { id: 'remind', label: 'Enviar Lembrete', type: 'primary', action: 'send_reminder' },
      { id: 'contact', label: 'Entrar em Contato', type: 'secondary', action: 'contact_patient' }
    ],
    metadata: {
      userId: 'user_456',
      userName: 'Carlos Lima',
      exerciseId: 'ex_789'
    }
  },
  {
    id: '5',
    title: 'Conquista Desbloqueada! 🏆',
    message: 'Ana Beatriz completou 30 dias consecutivos de exercícios',
    type: 'achievement',
    priority: 'medium',
    read: false,
    archived: false,
    starred: true,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    actions: [
      { id: 'congratulate', label: 'Parabenizar', type: 'primary', action: 'send_congratulations' }
    ],
    metadata: {
      userId: 'user_101',
      userName: 'Ana Beatriz'
    }
  },
  {
    id: '6',
    title: 'Falha na Sincronização',
    message: 'Erro ao sincronizar dados com o servidor. Tentativa automática em 5 minutos.',
    type: 'system',
    priority: 'urgent',
    read: false,
    archived: false,
    starred: false,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    actions: [
      { id: 'retry', label: 'Tentar Novamente', type: 'primary', action: 'retry_sync' },
      { id: 'details', label: 'Ver Detalhes', type: 'secondary', action: 'view_error_details' }
    ]
  },
  {
    id: '7',
    title: 'Nova Mensagem',
    message: 'Pedro Oliveira enviou uma mensagem sobre dúvidas nos exercícios',
    type: 'social',
    priority: 'medium',
    read: true,
    archived: false,
    starred: false,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    actions: [
      { id: 'reply', label: 'Responder', type: 'primary', action: 'reply_message' }
    ],
    metadata: {
      userId: 'user_202',
      userName: 'Pedro Oliveira'
    }
  },
  {
    id: '8',
    title: 'Lembrete de Consulta',
    message: 'Consulta com Fernanda Costa está marcada para amanhã às 10:30',
    type: 'reminder',
    priority: 'medium',
    read: true,
    archived: false,
    starred: false,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    metadata: {
      userId: 'user_303',
      userName: 'Fernanda Costa',
      appointmentId: 'apt_789'
    }
  }
];

const mockStats: NotificationStats = {
  total: mockNotifications.length,
  unread: mockNotifications.filter(n => !n.read).length,
  starred: mockNotifications.filter(n => n.starred).length,
  archived: mockNotifications.filter(n => n.archived).length,
  byType: {
    appointment: mockNotifications.filter(n => n.type === 'appointment').length,
    exercise: mockNotifications.filter(n => n.type === 'exercise').length,
    payment: mockNotifications.filter(n => n.type === 'payment').length,
    system: mockNotifications.filter(n => n.type === 'system').length,
    social: mockNotifications.filter(n => n.type === 'social').length,
    achievement: mockNotifications.filter(n => n.type === 'achievement').length,
    reminder: mockNotifications.filter(n => n.type === 'reminder').length,
  },
  byPriority: {
    urgent: mockNotifications.filter(n => n.priority === 'urgent').length,
    high: mockNotifications.filter(n => n.priority === 'high').length,
    medium: mockNotifications.filter(n => n.priority === 'medium').length,
    low: mockNotifications.filter(n => n.priority === 'low').length,
  }
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'exercise':
        return <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
      case 'social':
        return <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'achievement':
        return <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'exercise':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'payment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'system':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'social':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'reminder':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    // Filter by read/unread/starred/archived
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'starred' && !notification.starred) return false;
    if (filter === 'archived' && !notification.archived) return false;
    if (filter === 'all' && notification.archived) return false; // Don't show archived in 'all'
    
    // Filter by type
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    
    // Filter by search query
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAsUnread = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
    );
  };

  const handleToggleStar = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, starred: !n.starred } : n)
    );
  };

  const handleArchive = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, archived: true } : n)
    );
  };

  const handleDelete = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleBulkAction = (action: string) => {
    const selectedIds = Array.from(selectedNotifications);
    
    switch (action) {
      case 'read':
        setNotifications(prev => 
          prev.map(n => selectedIds.includes(n.id) ? { ...n, read: true } : n)
        );
        break;
      case 'unread':
        setNotifications(prev => 
          prev.map(n => selectedIds.includes(n.id) ? { ...n, read: false } : n)
        );
        break;
      case 'archive':
        setNotifications(prev => 
          prev.map(n => selectedIds.includes(n.id) ? { ...n, archived: true } : n)
        );
        break;
      case 'delete':
        setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
        break;
    }
    
    setSelectedNotifications(new Set());
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Central de Notificações
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Gerencie todas as notificações do sistema
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockStats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Não Lidas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockStats.unread}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Favoritas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockStats.starred}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center">
                <Archive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Arquivadas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockStats.archived}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <div className="flex bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'unread', label: 'Não Lidas' },
                  { key: 'starred', label: 'Favoritas' },
                  { key: 'archived', label: 'Arquivadas' }
                ].map(filterOption => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key as any)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      filter === filterOption.key
                        ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-dark-400 hover:text-gray-800 dark:hover:text-dark-200'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-sm"
              >
                <option value="all">Todos os Tipos</option>
                <option value="appointment">Consultas</option>
                <option value="exercise">Exercícios</option>
                <option value="payment">Pagamentos</option>
                <option value="system">Sistema</option>
                <option value="social">Social</option>
                <option value="achievement">Conquistas</option>
                <option value="reminder">Lembretes</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar notificações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.size > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
              <span className="text-sm text-gray-600 dark:text-dark-400">
                {selectedNotifications.size} selecionada(s)
              </span>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('read')}>
                <Check className="w-4 h-4 mr-1" />
                Marcar como Lida
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('unread')}>
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar como Não Lida
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('archive')}>
                <Archive className="w-4 h-4 mr-1" />
                Arquivar
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                <Trash2 className="w-4 h-4 mr-1" />
                Excluir
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-2">
        {/* Select All */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-800 rounded-lg">
          <input
            type="checkbox"
            checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
            onChange={handleSelectAll}
            className="rounded"
          />
          <span className="text-sm text-gray-600 dark:text-dark-400">
            Selecionar todas ({filteredNotifications.length})
          </span>
        </div>

        {/* Notification Items */}
        {filteredNotifications.map(notification => (
          <Card key={notification.id} className={`border transition-colors ${
            notification.read 
              ? 'border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800' 
              : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedNotifications.has(notification.id)}
                  onChange={() => handleSelectNotification(notification.id)}
                  className="mt-1 rounded"
                />
                
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center">
                    {getTypeIcon(notification.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white font-semibold'}`}>
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-dark-400 mb-2">
                        {notification.message}
                      </p>
                      {notification.metadata?.userName && (
                        <p className="text-xs text-gray-500 dark:text-dark-400 mb-2">
                          <Users className="w-3 h-3 inline mr-1" />
                          {notification.metadata.userName}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-gray-500 dark:text-dark-400">
                        {formatTime(notification.timestamp)}
                      </span>
                      {notification.starred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {notification.actions?.map(action => (
                      <Button
                        key={action.id}
                        size="sm"
                        variant={action.type === 'primary' ? 'default' : 'outline'}
                        className={action.type === 'danger' ? 'text-red-600 hover:text-red-700' : ''}
                      >
                        {action.label}
                      </Button>
                    ))}
                    
                    <div className="flex gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => notification.read ? handleMarkAsUnread(notification.id) : handleMarkAsRead(notification.id)}
                      >
                        {notification.read ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStar(notification.id)}
                      >
                        <Star className={`w-4 h-4 ${notification.starred ? 'text-yellow-500 fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(notification.id)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredNotifications.length === 0 && (
          <Card className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 dark:text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-500 dark:text-dark-400">
                Não há notificações que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedContainer>
  );
}