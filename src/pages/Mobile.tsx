import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, Hand, Download, Wifi, Layout } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import MobileNavigation from '@/components/Mobile/MobileNavigation';
import SwipeableCard, { SwipeActions, SwipeableCardExample } from '@/components/Mobile/SwipeableCard';
import TouchGestures, { TouchGesturesExample } from '@/components/Mobile/TouchGestures';
import PWAInstaller, { PWAInstallInstructions, PWAStatus } from '@/components/Mobile/PWAInstaller';
import OfflineIndicator, { OfflineIndicatorCompact } from '@/components/Mobile/OfflineIndicator';
import ResponsiveLayout, { ResponsiveGrid, ResponsiveCard, useBreakpoint, ResponsiveLayoutExample } from '@/components/Mobile/ResponsiveLayout';

export default function Mobile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'navigation' | 'gestures' | 'pwa' | 'offline' | 'responsive'>('overview');
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showPWAInstructions, setShowPWAInstructions] = useState(false);
  const { breakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();

  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: Monitor,
      description: 'Funcionalidades mobile implementadas'
    },
    {
      id: 'navigation',
      label: 'Navegação',
      icon: Layout,
      description: 'Menu e navegação mobile'
    },
    {
      id: 'gestures',
      label: 'Gestos Touch',
      icon: Hand,
      description: 'Interações com toque e gestos'
    },
    {
      id: 'pwa',
      label: 'PWA',
      icon: Download,
      description: 'Progressive Web App'
    },
    {
      id: 'offline',
      label: 'Modo Offline',
      icon: Wifi,
      description: 'Funcionalidades offline'
    },
    {
      id: 'responsive',
      label: 'Layout Responsivo',
      icon: Tablet,
      description: 'Adaptação para diferentes telas'
    }
  ];

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Funcionalidades Mobile-First
        </h2>
        <p className="text-gray-600 dark:text-dark-400 max-w-2xl mx-auto">
          O FisioFlow foi desenvolvido com foco na experiência mobile, oferecendo 
          recursos avançados para dispositivos móveis e tablets.
        </p>
      </div>

      {/* Current Device Info */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Informações do Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                isMobile ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <Smartphone className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Mobile</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">&lt; 768px</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                isTablet ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <Tablet className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Tablet</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">768px - 1024px</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                isDesktop ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <Monitor className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Desktop</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">&gt; 1024px</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <strong>Dispositivo atual:</strong> {breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)} • 
              Largura: {window.innerWidth}px
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
        <ResponsiveCard
          title="Navegação Mobile"
          subtitle="Menu lateral responsivo"
          actions={
            <button
              onClick={() => setShowMobileNav(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Testar
            </button>
          }
        >
          <p className="text-gray-600 dark:text-dark-400 text-sm">
            Menu lateral com animações suaves e navegação otimizada para toque.
          </p>
        </ResponsiveCard>

        <ResponsiveCard
          title="Gestos Touch"
          subtitle="Swipe, pinch, rotate"
          actions={
            <button
              onClick={() => setActiveTab('gestures')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ver Demo
            </button>
          }
        >
          <p className="text-gray-600 dark:text-dark-400 text-sm">
            Suporte completo a gestos multi-touch para uma experiência natural.
          </p>
        </ResponsiveCard>

        <ResponsiveCard
          title="PWA"
          subtitle="Aplicativo instalável"
          actions={
            <button
              onClick={() => setShowPWAInstructions(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Instalar
            </button>
          }
        >
          <p className="text-gray-600 dark:text-dark-400 text-sm">
            Instale como um app nativo no seu dispositivo.
          </p>
        </ResponsiveCard>

        <ResponsiveCard
          title="Modo Offline"
          subtitle="Funciona sem internet"
        >
          <p className="text-gray-600 dark:text-dark-400 text-sm">
            Dados sincronizados automaticamente quando conectado.
          </p>
        </ResponsiveCard>

        <ResponsiveCard
          title="Layout Responsivo"
          subtitle="Adapta-se a qualquer tela"
        >
          <p className="text-gray-600 dark:text-dark-400 text-sm">
            Interface que se ajusta perfeitamente a diferentes dispositivos.
          </p>
        </ResponsiveCard>

        <ResponsiveCard
          title="Performance"
          subtitle="Otimizado para mobile"
        >
          <p className="text-gray-600 dark:text-dark-400 text-sm">
            Carregamento rápido e animações fluidas em qualquer dispositivo.
          </p>
        </ResponsiveCard>
      </ResponsiveGrid>
    </div>
  );

  const NavigationTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Navegação Mobile
        </h2>
        <p className="text-gray-600 dark:text-dark-400">
          Sistema de navegação otimizado para dispositivos móveis com menu lateral deslizante.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardHeader>
            <CardTitle>Demonstração do Menu Mobile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-dark-400">
                Clique no botão abaixo para testar o menu lateral mobile.
              </p>
              <button
                onClick={() => setShowMobileNav(true)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Abrir Menu Mobile
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardHeader>
            <CardTitle>Recursos da Navegação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Menu Deslizante</h4>
                  <p className="text-sm text-gray-600 dark:text-dark-400">
                    Desliza suavemente da esquerda com animação fluida
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Controle de Permissões</h4>
                  <p className="text-sm text-gray-600 dark:text-dark-400">
                    Mostra apenas opções permitidas para cada usuário
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Badges de Notificação</h4>
                  <p className="text-sm text-gray-600 dark:text-dark-400">
                    Indicadores visuais para itens que precisam de atenção
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const GesturesTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Gestos Touch
        </h2>
        <p className="text-gray-600 dark:text-dark-400">
          Interações avançadas com toque para uma experiência mais natural e intuitiva.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardHeader>
            <CardTitle>Cards com Swipe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-dark-400 mb-4">
              Deslize os cards para a esquerda ou direita para revelar ações.
            </p>
            <SwipeableCardExample />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardHeader>
            <CardTitle>Gestos Multi-Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-dark-400 mb-4">
              Use dois dedos para zoom, rotação e arrastar elementos.
            </p>
            <TouchGesturesExample />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const PWATab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Progressive Web App (PWA)
        </h2>
        <p className="text-gray-600 dark:text-dark-400">
          Instale o FisioFlow como um aplicativo nativo no seu dispositivo.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardHeader>
            <CardTitle>Status de Instalação</CardTitle>
          </CardHeader>
          <CardContent>
            <PWAStatus />
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => setShowPWAInstructions(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Como Instalar
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardHeader>
            <CardTitle>Recursos PWA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Instalação nativa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Funciona offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Notificações push</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Ícone na tela inicial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Tela cheia</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Atualizações automáticas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const OfflineTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Funcionalidades Offline
        </h2>
        <p className="text-gray-600 dark:text-dark-400">
          O FisioFlow continua funcionando mesmo quando você está desconectado da internet.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Status de Conectividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span>Indicador de status:</span>
              <OfflineIndicatorCompact />
            </div>
            <p className="text-sm text-gray-600 dark:text-dark-400">
              O indicador mostra se você está online ou offline e exibe informações sobre sincronização.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardHeader>
            <CardTitle>Recursos Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Cache Inteligente</h4>
                  <p className="text-sm text-gray-600 dark:text-dark-400">
                    Dados importantes são armazenados localmente para acesso offline
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Sincronização Automática</h4>
                  <p className="text-sm text-gray-600 dark:text-dark-400">
                    Alterações feitas offline são sincronizadas quando a conexão retorna
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Armazenamento Local</h4>
                  <p className="text-sm text-gray-600 dark:text-dark-400">
                    Dados críticos ficam disponíveis mesmo sem internet
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ResponsiveTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Layout Responsivo
        </h2>
        <p className="text-gray-600 dark:text-dark-400">
          Interface que se adapta perfeitamente a qualquer tamanho de tela.
        </p>
      </div>

      <ResponsiveLayoutExample />
    </div>
  );

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mobile-First
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Experiência otimizada para dispositivos móveis
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <Card
              key={tab.id}
              className={`cursor-pointer transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-dark-600 hover:shadow-md hover:border-gray-300 dark:hover:border-dark-500'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className={`font-semibold text-sm mb-1 ${
                  activeTab === tab.id
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {tab.label}
                </h3>
                <p className="text-xs text-gray-600 dark:text-dark-400">
                  {tab.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'navigation' && <NavigationTab />}
        {activeTab === 'gestures' && <GesturesTab />}
        {activeTab === 'pwa' && <PWATab />}
        {activeTab === 'offline' && <OfflineTab />}
        {activeTab === 'responsive' && <ResponsiveTab />}
      </div>

      {/* Components */}
      <MobileNavigation 
        isOpen={showMobileNav} 
        onToggle={() => setShowMobileNav(false)} 
      />
      
      <PWAInstaller />
      
      <OfflineIndicator />
      
      {showPWAInstructions && (
        <PWAInstallInstructions onClose={() => setShowPWAInstructions(false)} />
      )}
    </AnimatedContainer>
  );
}