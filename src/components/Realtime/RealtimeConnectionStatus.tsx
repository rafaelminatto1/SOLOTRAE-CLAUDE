import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useRealtimeContext } from '../../contexts/RealtimeContext';

export function RealtimeConnectionStatus() {
  const { connectionStatus } = useRealtimeContext();

  if (connectionStatus === 'connected') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-3 py-2 rounded-lg shadow-lg border border-green-200 dark:border-green-800">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Conectado</span>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'disconnected') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-3 py-2 rounded-lg shadow-lg border border-red-200 dark:border-red-800">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Desconectado</span>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'connecting') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-lg shadow-lg border border-yellow-200 dark:border-yellow-800">
          <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Conectando...</span>
        </div>
      </div>
    );
  }

  return null;
}