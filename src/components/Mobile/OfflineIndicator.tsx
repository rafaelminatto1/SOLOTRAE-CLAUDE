import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CloudOff, Cloud, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OfflineData {
  type: 'appointment' | 'patient' | 'exercise' | 'payment';
  id: string;
  title: string;
  timestamp: Date;
  data: any;
}

interface SyncStatus {
  isSyncing: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  failedChanges: number;
}

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDetails, setShowDetails] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    pendingChanges: 3,
    failedChanges: 1
  });
  const [offlineData] = useState<OfflineData[]>([
    {
      type: 'appointment',
      id: '1',
      title: 'Consulta com João Silva',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      data: { patientId: '123', date: '2025-01-10', time: '14:00' }
    },
    {
      type: 'patient',
      id: '2',
      title: 'Novo paciente: Maria Santos',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      data: { name: 'Maria Santos', phone: '11999999999' }
    },
    {
      type: 'exercise',
      id: '3',
      title: 'Exercício concluído por Carlos',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      data: { exerciseId: '456', patientId: '789', completed: true }
    }
  ]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Simulate sync when coming back online
      if (syncStatus.pendingChanges > 0) {
        handleSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncStatus.pendingChanges]);

  const handleSync = async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        pendingChanges: Math.max(0, prev.pendingChanges - 2),
        failedChanges: Math.max(0, prev.failedChanges - 1)
      }));
    }, 2000);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'patient':
        return '👤';
      case 'exercise':
        return '💪';
      case 'payment':
        return '💳';
      default:
        return '📄';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'Agendamento';
      case 'patient':
        return 'Paciente';
      case 'exercise':
        return 'Exercício';
      case 'payment':
        return 'Pagamento';
      default:
        return 'Dados';
    }
  };

  return (
    <>
      {/* Main Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatedContainer>
          <div
            onClick={() => setShowDetails(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all duration-300 shadow-lg ${
              isOnline
                ? syncStatus.pendingChanges > 0
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isOnline ? (
              syncStatus.isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : syncStatus.pendingChanges > 0 ? (
                <CloudOff className="w-4 h-4" />
              ) : (
                <Cloud className="w-4 h-4" />
              )
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            
            <span className="text-sm font-medium">
              {isOnline ? (
                syncStatus.isSyncing ? 'Sincronizando...' :
                syncStatus.pendingChanges > 0 ? `${syncStatus.pendingChanges} pendente(s)` :
                'Sincronizado'
              ) : (
                'Offline'
              )}
            </span>
            
            {syncStatus.pendingChanges > 0 && (
              <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{syncStatus.pendingChanges}</span>
              </div>
            )}
          </div>
        </AnimatedContainer>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <AnimatedContainer>
            <Card className="w-full max-w-md bg-white dark:bg-dark-800 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-500" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Status de Conectividade
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ×
                </button>
              </div>

              <CardContent className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {/* Connection Status */}
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  isOnline
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className={`font-medium ${
                      isOnline ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
                    }`}>
                      {isOnline ? 'Conectado' : 'Desconectado'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-dark-400">
                      {isOnline 
                        ? 'Aplicativo sincronizado com o servidor'
                        : 'Trabalhando no modo offline'
                      }
                    </p>
                  </div>
                </div>

                {/* Sync Status */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Status de Sincronização
                  </h4>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-dark-300">
                        Última sincronização
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {syncStatus.lastSync ? formatTime(syncStatus.lastSync) : 'Nunca'}
                    </span>
                  </div>

                  {syncStatus.pendingChanges > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CloudOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm text-yellow-800 dark:text-yellow-400">
                          Alterações pendentes
                        </span>
                      </div>
                      <span className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                        {syncStatus.pendingChanges}
                      </span>
                    </div>
                  )}

                  {syncStatus.failedChanges > 0 && (
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-red-800 dark:text-red-400">
                          Falhas na sincronização
                        </span>
                      </div>
                      <span className="text-sm font-medium text-red-900 dark:text-red-300">
                        {syncStatus.failedChanges}
                      </span>
                    </div>
                  )}
                </div>

                {/* Offline Data */}
                {!isOnline && offlineData.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Dados Salvos Localmente
                    </h4>
                    
                    <div className="space-y-2">
                      {offlineData.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-dark-700 rounded-lg">
                          <span className="text-lg">{getTypeIcon(item.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-400">
                              <span>{getTypeLabel(item.type)}</span>
                              <span>•</span>
                              <span>{formatTime(item.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {isOnline && syncStatus.pendingChanges > 0 && (
                    <Button
                      onClick={handleSync}
                      disabled={syncStatus.isSyncing}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {syncStatus.isSyncing ? (
                        <>
                          <Sync className="w-4 h-4 mr-2 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <Sync className="w-4 h-4 mr-2" />
                          Sincronizar Agora
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                    className="flex-1"
                  >
                    Fechar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>
      )}
    </>
  );
}

// Compact version for header
export function OfflineIndicatorCompact() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
      isOnline
        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }`}>
      {isOnline ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}