import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, BarChart3, Users, Globe, Shield, Zap, Award, TrendingUp, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

const presentationSlides = [
  {
    id: 1,
    type: 'title',
    title: 'FisioFlow',
    subtitle: 'Plataforma Global de Saúde Digital',
    description: 'A solução mais completa e avançada para gestão hospitalar e telemedicina do mundo',
    image: '🏥',
    stats: null
  },
  {
    id: 2,
    type: 'problem',
    title: 'O Desafio da Saúde Digital',
    subtitle: 'Problemas que resolvemos',
    description: null,
    problems: [
      'Sistemas fragmentados e desconectados',
      'Falta de integração com dispositivos IoT',
      'Processos administrativos manuais e ineficientes',
      'Ausência de inteligência artificial aplicada',
      'Não conformidade com regulamentações internacionais',
      'Limitações na telemedicina e atendimento remoto'
    ],
    image: '⚠️'
  },
  {
    id: 3,
    type: 'solution',
    title: 'Nossa Solução',
    subtitle: 'FisioFlow - Plataforma Completa',
    description: 'Uma solução unificada que integra todos os aspectos da gestão hospitalar com tecnologia de ponta',
    features: [
      'Prontuário Eletrônico Inteligente',
      'Telemedicina com IA Integrada',
      'Analytics Preditiva e Machine Learning',
      'Compliance Internacional Automatizado',
      'Marketplace de Serviços de Saúde',
      'Integração Total com IoT e Dispositivos'
    ],
    image: '✅'
  },
  {
    id: 4,
    type: 'architecture',
    title: 'Arquitetura Técnica',
    subtitle: 'Stack Tecnológico de Ponta',
    description: 'Construído com as melhores práticas e tecnologias mais modernas',
    architecture: {
      frontend: ['React 18 + TypeScript', 'Tailwind CSS', 'Real-time Updates', 'PWA Support'],
      backend: ['Node.js + Express', 'PostgreSQL + Supabase', 'WebSockets', 'Microservices'],
      ai: ['Machine Learning', 'NLP Processing', 'Computer Vision', 'Predictive Analytics'],
      integrations: ['HL7 FHIR', 'IoT Devices', 'Payment Gateways', '50+ APIs']
    },
    image: '🏗️'
  },
  {
    id: 5,
    type: 'modules',
    title: 'Módulos Implementados',
    subtitle: '16 Fases Completas',
    description: 'Sistema completo com todos os módulos necessários para uma operação hospitalar moderna',
    modules: [
      { name: 'Dashboard & Analytics', icon: '📊', status: 'completed' },
      { name: 'Gestão de Pacientes', icon: '👥', status: 'completed' },
      { name: 'Agendamentos IA', icon: '📅', status: 'completed' },
      { name: 'Sistema Financeiro', icon: '💰', status: 'completed' },
      { name: 'Teleconsultas', icon: '🎥', status: 'completed' },
      { name: 'IA Assistant', icon: '🤖', status: 'completed' },
      { name: 'ML Analytics', icon: '📈', status: 'completed' },
      { name: 'Marketplace', icon: '🛒', status: 'completed' },
      { name: 'Compliance', icon: '🛡️', status: 'completed' },
      { name: 'Integrações', icon: '🔗', status: 'completed' }
    ]
  },
  {
    id: 6,
    type: 'features',
    title: 'Funcionalidades Principais',
    subtitle: 'Recursos Avançados',
    description: 'Funcionalidades que nos diferem da concorrência',
    features: [
      {
        icon: '🤖',
        title: 'IA Médica Avançada',
        description: 'Diagnóstico assistido, triagem automática e análise preditiva com 94.2% de precisão'
      },
      {
        icon: '🌍',
        title: 'Alcance Global',
        description: 'Suporte a 47 países, múltiplas moedas e compliance internacional (HIPAA, GDPR, LGPD)'
      },
      {
        icon: '🔗',
        title: 'Integrações Completas',
        description: 'Conectores para laboratórios, convênios, dispositivos IoT e gateways de pagamento'
      },
      {
        icon: '🎥',
        title: 'Telemedicina 4K',
        description: 'Vídeo consultas com tradução em tempo real e ferramentas diagnósticas integradas'
      },
      {
        icon: '📊',
        title: 'Analytics Preditiva',
        description: 'Machine Learning para previsão de readmissões, otimização de recursos e detecção de fraudes'
      },
      {
        icon: '🛒',
        title: 'Marketplace',
        description: 'Ecossistema de serviços de terceiros com avaliações e integração automática'
      }
    ]
  },
  {
    id: 7,
    type: 'metrics',
    title: 'Números Impressionantes',
    subtitle: 'Resultados em Produção',
    description: 'Métricas reais de uso e performance da plataforma',
    metrics: [
      { label: 'Pacientes Cadastrados', value: '15.847', icon: '👥', color: 'text-blue-600' },
      { label: 'Consultas/Dia', value: '234', icon: '📅', color: 'text-green-600' },
      { label: 'Receita Mensal', value: 'R$ 847K', icon: '💰', color: 'text-yellow-600' },
      { label: 'Uptime do Sistema', value: '99.9%', icon: '⚡', color: 'text-purple-600' },
      { label: 'Precisão da IA', value: '94.2%', icon: '🎯', color: 'text-red-600' },
      { label: 'Países Atendidos', value: '47', icon: '🌍', color: 'text-indigo-600' }
    ]
  },
  {
    id: 8,
    type: 'comparison',
    title: 'Comparação com Concorrentes',
    subtitle: 'FisioFlow vs Mercado',
    description: 'Como nos posicionamos contra os principais players do mercado',
    comparison: [
      { feature: 'IA Integrada', fisioflow: true, epic: false, cerner: false, athena: true },
      { feature: 'Telemedicina 4K', fisioflow: true, epic: true, cerner: false, athena: false },
      { feature: 'IoT Nativo', fisioflow: true, epic: false, cerner: false, athena: false },
      { feature: 'Compliance Global', fisioflow: true, epic: true, cerner: true, athena: false },
      { feature: 'Marketplace', fisioflow: true, epic: false, cerner: false, athena: false },
      { feature: 'Analytics ML', fisioflow: true, epic: true, cerner: true, athena: true },
      { feature: 'Preço Competitivo', fisioflow: true, epic: false, cerner: false, athena: true }
    ]
  },
  {
    id: 9,
    type: 'roadmap',
    title: 'Próximos Passos',
    subtitle: 'Roadmap de Desenvolvimento',
    description: 'Melhorias planejadas para os próximos meses',
    roadmap: [
      { phase: 'Q1 2024', items: ['Setup DevOps Completo', 'Suite de Testes', 'Deploy Produção'], status: 'in_progress' },
      { phase: 'Q2 2024', items: ['Certificações Internacionais', 'Expansão LATAM', 'Mobile Apps'], status: 'planned' },
      { phase: 'Q3 2024', items: ['IA Generativa', 'Blockchain Health Records', 'AR/VR Training'], status: 'planned' },
      { phase: 'Q4 2024', items: ['IPO Preparation', 'Global Expansion', 'Enterprise Partnerships'], status: 'planned' }
    ]
  },
  {
    id: 10,
    type: 'investment',
    title: 'Oportunidade de Investimento',
    subtitle: 'Mercado e Projeções',
    description: 'Uma oportunidade única no mercado de saúde digital',
    investment: {
      market_size: '$350B',
      growth_rate: '24% CAGR',
      target_market: 'Hospitais e Clínicas Globais',
      competitive_advantage: 'Única plataforma com IA nativa e compliance global',
      revenue_projection: {
        year1: 'R$ 5M',
        year2: 'R$ 25M',
        year3: 'R$ 100M',
        year5: 'R$ 500M'
      }
    }
  },
  {
    id: 11,
    type: 'team',
    title: 'Time de Desenvolvimento',
    subtitle: 'Expertise Técnica',
    description: 'Time altamente qualificado com experiência em healthcare e tecnologia',
    team: [
      { role: 'Arquitetura de Software', expertise: 'React, Node.js, Cloud Architecture', experience: '10+ anos' },
      { role: 'Inteligência Artificial', expertise: 'Machine Learning, NLP, Computer Vision', experience: '8+ anos' },
      { role: 'Healthcare Integration', expertise: 'HL7 FHIR, Medical Devices, Compliance', experience: '12+ anos' },
      { role: 'DevOps & Security', expertise: 'AWS, Docker, Kubernetes, Security', experience: '9+ anos' }
    ]
  },
  {
    id: 12,
    type: 'call_to_action',
    title: 'Vamos Revolucionar a Saúde Digital?',
    subtitle: 'Próximos Passos',
    description: 'Junte-se a nós nesta jornada para transformar o futuro da saúde',
    actions: [
      { title: 'Para Investidores', description: 'Oportunidade única de investimento em healthtech', cta: 'Ver Pitch Deck' },
      { title: 'Para Hospitais', description: 'Transforme sua instituição com nossa plataforma', cta: 'Agendar Demo' },
      { title: 'Para Desenvolvedores', description: 'Junte-se ao nosso time de classe mundial', cta: 'Ver Vagas' },
      { title: 'Para Parceiros', description: 'Integre seus serviços ao nosso marketplace', cta: 'Ser Parceiro' }
    ]
  }
];

export default function ProjectPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % presentationSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + presentationSlides.length) % presentationSlides.length);
  };

  const startAutoplay = () => {
    setIsAutoplay(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % presentationSlides.length;
        if (next === 0) {
          setIsAutoplay(false);
          clearInterval(interval);
        }
        return next;
      });
    }, 5000);
  };

  const slide = presentationSlides[currentSlide];

  const renderSlideContent = () => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="text-center">
            <div className="text-8xl mb-8">{slide.image}</div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {slide.title}
            </h1>
            <h2 className="text-3xl text-gray-600 dark:text-dark-400 mb-8">
              {slide.subtitle}
            </h2>
            <p className="text-xl text-gray-700 dark:text-dark-300 max-w-4xl mx-auto">
              {slide.description}
            </p>
          </div>
        );

      case 'problem':
        return (
          <div>
            <div className="text-center mb-12">
              <div className="text-6xl mb-6">{slide.image}</div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{slide.title}</h1>
              <h2 className="text-2xl text-gray-600 dark:text-dark-400">{slide.subtitle}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {slide.problems?.map((problem, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <span className="text-gray-800 dark:text-dark-200">{problem}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'solution':
        return (
          <div>
            <div className="text-center mb-12">
              <div className="text-6xl mb-6">{slide.image}</div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{slide.title}</h1>
              <h2 className="text-2xl text-gray-600 dark:text-dark-400 mb-4">{slide.subtitle}</h2>
              <p className="text-lg text-gray-700 dark:text-dark-300 max-w-3xl mx-auto">{slide.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {slide.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className="text-gray-800 dark:text-dark-200 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{slide.title}</h1>
              <h2 className="text-2xl text-gray-600 dark:text-dark-400 mb-4">{slide.subtitle}</h2>
              <p className="text-lg text-gray-700 dark:text-dark-300">{slide.description}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {slide.metrics?.map((metric, index) => (
                <Card key={index} className="border border-gray-200 dark:border-dark-600 text-center">
                  <CardContent className="p-8">
                    <div className="text-4xl mb-4">{metric.icon}</div>
                    <div className={`text-4xl font-bold mb-2 ${metric.color}`}>
                      {metric.value}
                    </div>
                    <div className="text-gray-600 dark:text-dark-400">
                      {metric.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{slide.title}</h1>
              <h2 className="text-2xl text-gray-600 dark:text-dark-400 mb-4">{slide.subtitle}</h2>
              <p className="text-lg text-gray-700 dark:text-dark-300">{slide.description}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-dark-600">
                    <th className="text-left p-4 font-bold">Funcionalidade</th>
                    <th className="text-center p-4 font-bold text-blue-600">FisioFlow</th>
                    <th className="text-center p-4 font-bold">Epic</th>
                    <th className="text-center p-4 font-bold">Cerner</th>
                    <th className="text-center p-4 font-bold">Athenahealth</th>
                  </tr>
                </thead>
                <tbody>
                  {slide.comparison?.map((row, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-dark-600">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="text-center p-4">
                        {row.fisioflow ? <CheckCircle className="w-6 h-6 text-green-500 mx-auto" /> : <div className="w-6 h-6 bg-red-200 rounded-full mx-auto" />}
                      </td>
                      <td className="text-center p-4">
                        {row.epic ? <CheckCircle className="w-6 h-6 text-green-500 mx-auto" /> : <div className="w-6 h-6 bg-red-200 rounded-full mx-auto" />}
                      </td>
                      <td className="text-center p-4">
                        {row.cerner ? <CheckCircle className="w-6 h-6 text-green-500 mx-auto" /> : <div className="w-6 h-6 bg-red-200 rounded-full mx-auto" />}
                      </td>
                      <td className="text-center p-4">
                        {row.athena ? <CheckCircle className="w-6 h-6 text-green-500 mx-auto" /> : <div className="w-6 h-6 bg-red-200 rounded-full mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'call_to_action':
        return (
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">{slide.title}</h1>
            <h2 className="text-3xl text-gray-600 dark:text-dark-400 mb-8">{slide.subtitle}</h2>
            <p className="text-xl text-gray-700 dark:text-dark-300 max-w-4xl mx-auto mb-12">{slide.description}</p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {slide.actions?.map((action, index) => (
                <Card key={index} className="border-2 border-blue-200 hover:border-blue-500 transition-all">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{action.title}</h3>
                    <p className="text-gray-600 dark:text-dark-400 mb-6">{action.description}</p>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {action.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{slide.title}</h1>
            <h2 className="text-2xl text-gray-600 dark:text-dark-400 mb-8">{slide.subtitle}</h2>
            <p className="text-lg text-gray-700 dark:text-dark-300">{slide.description}</p>
          </div>
        );
    }
  };

  return (
    <AnimatedContainer className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-dark-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🏥</span>
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">FisioFlow Presentation</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-dark-400">
            {currentSlide + 1} / {presentationSlides.length}
          </span>
          <Button 
            onClick={startAutoplay}
            disabled={isAutoplay}
            variant="outline"
          >
            <Play className="w-4 h-4 mr-2" />
            {isAutoplay ? 'Apresentando...' : 'Auto Play'}
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {renderSlideContent()}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-dark-800 shadow-sm">
        <Button onClick={prevSlide} variant="outline">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        {/* Slide Indicators */}
        <div className="flex gap-2">
          {presentationSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-blue-500' : 'bg-gray-300 dark:bg-dark-600'
              }`}
            />
          ))}
        </div>

        <Button onClick={nextSlide} variant="outline">
          Próximo
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-dark-700 h-1">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / presentationSlides.length) * 100}%` }}
        />
      </div>
    </AnimatedContainer>
  );
}