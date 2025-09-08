import React, { useState } from 'react';
import { Play, User, Calendar, FileText, DollarSign, Brain, Globe, Shield, Store, Zap, GraduationCap, Wifi } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

// Import all our main components for demo
const demoModules = [
  {
    id: 'dashboard',
    name: 'Dashboard Principal',
    icon: '📊',
    description: 'Visão geral completa da clínica com métricas em tempo real',
    component: 'Dashboard',
    features: ['Analytics em tempo real', 'KPIs de negócio', 'Alertas inteligentes'],
    color: 'bg-blue-500'
  },
  {
    id: 'patients',
    name: 'Gestão de Pacientes',
    icon: '👥',
    description: 'Sistema completo de prontuários eletrônicos e histórico médico',
    component: 'Patients',
    features: ['Prontuário eletrônico', 'Histórico médico', 'Documentos digitais'],
    color: 'bg-green-500'
  },
  {
    id: 'appointments',
    name: 'Agendamentos Inteligentes',
    icon: '📅',
    description: 'Sistema de agendamento com IA preditiva e otimização automática',
    component: 'Appointments',
    features: ['IA preditiva', 'Otimização automática', 'Lembretes automáticos'],
    color: 'bg-purple-500'
  },
  {
    id: 'financial',
    name: 'Gestão Financeira',
    icon: '💰',
    description: 'Sistema financeiro completo com faturamento e análise de receita',
    component: 'Financial',
    features: ['Faturamento automático', 'Análise de receita', 'Relatórios fiscais'],
    color: 'bg-yellow-500'
  },
  {
    id: 'telemedicine',
    name: 'Teleconsultas Avançadas',
    icon: '🎥',
    description: 'Plataforma de vídeo consultas com IA e tradução em tempo real',
    component: 'AdvancedVideoConsultation',
    features: ['Vídeo HD/4K', 'Tradução automática', 'Ferramentas diagnósticas'],
    color: 'bg-red-500'
  },
  {
    id: 'ai_assistant',
    name: 'Assistente de IA',
    icon: '🤖',
    description: 'Assistente inteligente para diagnóstico e triagem médica',
    component: 'AIHealthAssistant',
    features: ['Diagnóstico assistido', 'Triagem automática', 'Análise de sintomas'],
    color: 'bg-indigo-500'
  },
  {
    id: 'analytics',
    name: 'Analytics Preditiva',
    icon: '📈',
    description: 'Machine Learning aplicado para insights e previsões médicas',
    component: 'PredictiveAnalytics',
    features: ['ML avançado', 'Previsões médicas', 'Insights automáticos'],
    color: 'bg-pink-500'
  },
  {
    id: 'marketplace',
    name: 'Marketplace de Serviços',
    icon: '🛒',
    description: 'Marketplace para integração com serviços de saúde de terceiros',
    component: 'ServiceMarketplace',
    features: ['Serviços terceiros', 'Integração fácil', 'Avaliações e reviews'],
    color: 'bg-orange-500'
  },
  {
    id: 'compliance',
    name: 'Compliance e Auditoria',
    icon: '🛡️',
    description: 'Sistema de compliance internacional (HIPAA, GDPR, LGPD)',
    component: 'ComplianceAuditSystem',
    features: ['HIPAA/GDPR', 'Auditoria automática', 'Relatórios compliance'],
    color: 'bg-gray-700'
  },
  {
    id: 'integrations',
    name: 'Integrações Globais',
    icon: '🔗',
    description: 'Conectores para laboratórios, convênios e dispositivos IoT',
    component: 'Integrations',
    features: ['APIs globais', 'Dispositivos IoT', 'Protocolos médicos'],
    color: 'bg-teal-500'
  }
];

const mockStats = {
  totalPatients: 15847,
  dailyAppointments: 234,
  monthlyRevenue: 847650,
  systemUptime: 99.9,
  aiAccuracy: 94.2,
  globalReach: 47,
  integratedDevices: 1205,
  complianceScore: 98
};

export default function Demo() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "Visão Geral do Sistema",
      description: "FisioFlow - Plataforma global de saúde digital completa",
      duration: 3000
    },
    {
      title: "Dashboard em Tempo Real",
      description: "Métricas e KPIs atualizados automaticamente",
      duration: 4000
    },
    {
      title: "Gestão Inteligente de Pacientes",
      description: "Prontuários eletrônicos com IA integrada",
      duration: 4000
    },
    {
      title: "Teleconsultas Avançadas",
      description: "Vídeo consultas com tradução e diagnóstico assistido",
      duration: 5000
    },
    {
      title: "Analytics Preditiva",
      description: "Machine Learning para insights médicos",
      duration: 4000
    },
    {
      title: "Marketplace de Serviços",
      description: "Ecossistema de integrações de terceiros",
      duration: 3000
    },
    {
      title: "Compliance Internacional",
      description: "Conformidade com HIPAA, GDPR, LGPD e ISO27001",
      duration: 3000
    }
  ];

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    
    // Simulate demo progression
    demoSteps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        if (index === demoSteps.length - 1) {
          setTimeout(() => setIsPlaying(false), step.duration);
        }
      }, demoSteps.slice(0, index).reduce((acc, s) => acc + s.duration, 0));
    });
  };

  return (
    <AnimatedContainer className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">🏥</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FisioFlow Demo
            </h1>
            <p className="text-xl text-gray-600 dark:text-dark-400">
              Plataforma Global de Saúde Digital
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <p className="text-lg text-gray-700 dark:text-dark-300 leading-relaxed">
            Demonstração interativa da plataforma mais completa de gestão hospitalar e telemedicina do mundo. 
            Construída com React, TypeScript e tecnologias de ponta, integrando IA, IoT e compliance internacional.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <Button 
            onClick={startDemo}
            disabled={isPlaying}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg px-8 py-3"
          >
            <Play className="w-5 h-5 mr-2" />
            {isPlaying ? 'Demo em Andamento...' : 'Iniciar Demo Automática'}
          </Button>
          
          <Button variant="outline" className="text-lg px-8 py-3">
            <FileText className="w-5 h-5 mr-2" />
            Ver Documentação
          </Button>
        </div>
      </div>

      {/* Demo Progress */}
      {isPlaying && (
        <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">
                  {demoSteps[currentStep]?.title}
                </h3>
                <p className="text-blue-600 dark:text-blue-400">
                  {demoSteps[currentStep]?.description}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                  {currentStep + 1}/{demoSteps.length}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockStats.totalPatients.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-dark-400">
              Pacientes Cadastrados
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockStats.dailyAppointments}
            </div>
            <div className="text-sm text-gray-500 dark:text-dark-400">
              Consultas Hoje
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              R$ {(mockStats.monthlyRevenue / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-gray-500 dark:text-dark-400">
              Receita Mensal
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🤖</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockStats.aiAccuracy}%
            </div>
            <div className="text-sm text-gray-500 dark:text-dark-400">
              Precisão da IA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Showcase */}
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Módulos da Plataforma
        </h2>
        
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {demoModules.map((module, index) => (
            <Card 
              key={module.id} 
              className={`border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedModule === module.id 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : 'border-gray-200 dark:border-dark-600'
              } ${isPlaying && currentStep === index ? 'ring-4 ring-blue-300' : ''}`}
              onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {module.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {module.name}
                    </h3>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-dark-400">
                  {module.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Principais Funcionalidades:
                  </h4>
                  <ul className="space-y-1">
                    {module.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-dark-400 flex items-center gap-2">
                        <div className="w-1 h-1 bg-current rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Here we would navigate to the actual component
                    console.log(`Navigating to ${module.component}`);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Demonstrar Módulo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Stack Tecnológico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Frontend</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-dark-400">
                <div>React 18 + TypeScript</div>
                <div>Tailwind CSS</div>
                <div>Framer Motion</div>
                <div>Lucide Icons</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Backend</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-dark-400">
                <div>Node.js + Express</div>
                <div>PostgreSQL + Supabase</div>
                <div>Real-time WebSockets</div>
                <div>RESTful APIs</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Inteligência Artificial</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-dark-400">
                <div>Machine Learning</div>
                <div>Natural Language Processing</div>
                <div>Computer Vision</div>
                <div>Predictive Analytics</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Integrações</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-dark-400">
                <div>HL7 FHIR</div>
                <div>Payment Gateways</div>
                <div>IoT Devices</div>
                <div>Third-party APIs</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Reach */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Globe className="w-6 h-6" />
            Alcance Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">🌍</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {mockStats.globalReach}
              </div>
              <div className="text-gray-600 dark:text-dark-400">
                Países Atendidos
              </div>
            </div>
            
            <div>
              <div className="text-4xl mb-2">🏥</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                500+
              </div>
              <div className="text-gray-600 dark:text-dark-400">
                Hospitais Conectados
              </div>
            </div>
            
            <div>
              <div className="text-4xl mb-2">📱</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {mockStats.integratedDevices.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-dark-400">
                Dispositivos IoT
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Pronto para Revolucionar sua Instituição de Saúde?
        </h2>
        <p className="text-xl mb-6 opacity-90">
          Junte-se a centenas de hospitais que já transformaram seus processos com FisioFlow
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
            Solicitar Demonstração
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3">
            Falar com Vendas
          </Button>
        </div>
      </div>
    </AnimatedContainer>
  );
}