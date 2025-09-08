import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface PWAInstallerProps {
  appName?: string;
  appIcon?: string;
  shortDescription?: string;
  features?: string[];
  onInstall?: () => void;
  onDismiss?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function PWAInstaller({
  appName = 'FisioFlow',
  appIcon = '/icon-192x192.png',
  shortDescription = 'Sistema de gestão para clínicas de fisioterapia',
  features = [
    'Acesso offline aos seus dados',
    'Notificações push em tempo real',
    'Interface otimizada para mobile',
    'Sincronização automática',
    'Menor uso de bateria'
  ],
  onInstall,
  onDismiss
}: PWAInstallerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'other'>('other');

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else if (/windows|mac|linux/.test(userAgent) && !/mobile/.test(userAgent)) {
      setPlatform('desktop');
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install banner after a delay, unless already dismissed
      const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
      if (!isDismissed && !isStandalone) {
        setTimeout(() => {
          setShowInstallBanner(true);
        }, 5000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone, onInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA install');
        setShowInstallBanner(false);
        onInstall?.();
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  const getInstallInstructions = () => {
    switch (platform) {
      case 'ios':
        return {
          icon: Share,
          title: 'Instalar no iOS',
          steps: [
            'Toque no botão de compartilhar',
            'Role para baixo e toque em "Adicionar à Tela de Início"',
            'Toque em "Adicionar" para confirmar'
          ]
        };
      case 'android':
        return {
          icon: Download,
          title: 'Instalar no Android',
          steps: [
            'Toque em "Instalar App" abaixo',
            'Confirme a instalação quando solicitado',
            'O app aparecerá na sua tela inicial'
          ]
        };
      case 'desktop':
        return {
          icon: Monitor,
          title: 'Instalar no Desktop',
          steps: [
            'Clique em "Instalar App" abaixo',
            'Confirme a instalação na janela que aparecer',
            'O app será adicionado aos seus programas'
          ]
        };
      default:
        return {
          icon: Smartphone,
          title: 'Instalar App',
          steps: [
            'Clique no botão de instalação do navegador',
            'Siga as instruções na tela',
            'Aproveite a experiência nativa!'
          ]
        };
    }
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  const instructions = getInstallInstructions();
  const InstructionIcon = instructions.icon;

  return (
    <>
      {/* Install Banner */}
      {showInstallBanner && (
        <AnimatedContainer className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
          <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <img 
                  src={appIcon} 
                  alt={`${appName} icon`}
                  className="w-12 h-12 rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Instalar {appName}
                    </h3>
                    <button 
                      onClick={handleDismiss}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-dark-400 mt-1">
                    {shortDescription}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      onClick={handleInstallClick}
                      disabled={!deferredPrompt || isInstalling}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      {isInstalling ? 'Instalando...' : 'Instalar'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleDismiss}
                      className="text-xs"
                    >
                      Agora não
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}

      {/* Install Modal/Instructions (can be triggered manually) */}
    </>
  );
}

// Manual Install Instructions Component
export function PWAInstallInstructions({ onClose }: { onClose?: () => void }) {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'other'>('other');

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else if (/windows|mac|linux/.test(userAgent) && !/mobile/.test(userAgent)) {
      setPlatform('desktop');
    }
  }, []);

  const getInstructions = () => {
    switch (platform) {
      case 'ios':
        return {
          icon: Share,
          title: 'Como instalar no Safari (iOS)',
          steps: [
            'Toque no botão de compartilhar na barra de navegação',
            'Role para baixo e procure por "Adicionar à Tela de Início"',
            'Toque na opção e depois em "Adicionar"',
            'O app aparecerá na sua tela inicial como um aplicativo nativo'
          ],
          note: 'O Safari é o único navegador no iOS que suporta instalação de PWA.'
        };
      case 'android':
        return {
          icon: Download,
          title: 'Como instalar no Android',
          steps: [
            'Procure pelo ícone "Instalar" na barra de endereços',
            'Toque no ícone e confirme a instalação',
            'Ou vá no menu do navegador > "Adicionar à tela inicial"',
            'O app será instalado como um aplicativo normal'
          ],
          note: 'Funciona no Chrome, Edge, Firefox e outros navegadores modernos.'
        };
      case 'desktop':
        return {
          icon: Monitor,
          title: 'Como instalar no Desktop',
          steps: [
            'Procure pelo ícone de instalação na barra de endereços',
            'Clique no ícone e confirme a instalação',
            'Ou vá em Menu > "Instalar FisioFlow"',
            'O app aparecerá na lista de programas e na área de trabalho'
          ],
          note: 'Disponível no Chrome, Edge, Opera e outros navegadores baseados em Chromium.'
        };
      default:
        return {
          icon: Smartphone,
          title: 'Como instalar o App',
          steps: [
            'Procure por opções de instalação no seu navegador',
            'Geralmente há um ícone na barra de endereços',
            'Siga as instruções do navegador para instalar',
            'O app funcionará como um aplicativo nativo'
          ],
          note: 'As instruções podem variar dependendo do navegador usado.'
        };
    }
  };

  const instructions = getInstructions();
  const InstructionIcon = instructions.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-dark-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <InstructionIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {instructions.title}
              </h3>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="space-y-3 mb-4">
            {instructions.steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                    {index + 1}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-dark-300 text-sm">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-dark-400">
              <strong>Nota:</strong> {instructions.note}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// PWA Status Component
export function PWAStatus() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isStandalone) return null;

  return (
    <div className="fixed top-4 left-4 z-40">
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
        isOnline 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      }`}>
        {isOnline ? 'Online' : 'Modo Offline'}
      </div>
    </div>
  );
}