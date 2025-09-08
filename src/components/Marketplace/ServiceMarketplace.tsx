import React, { useState } from 'react';
import { Store, Star, ShoppingCart, Filter, Search, DollarSign, Users, CheckCircle, Clock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface MarketplaceService {
  id: string;
  name: string;
  description: string;
  category: 'telehealth' | 'diagnostics' | 'wellness' | 'pharmacy' | 'insurance' | 'education' | 'ai_tools';
  provider: ServiceProvider;
  pricing: ServicePricing;
  rating: number;
  reviews: number;
  features: string[];
  integrations: string[];
  certifications: string[];
  availability: 'global' | 'regional' | 'local';
  status: 'active' | 'beta' | 'coming_soon' | 'deprecated';
  installCount: number;
  lastUpdated: Date;
}

interface ServiceProvider {
  id: string;
  name: string;
  logo: string;
  type: 'enterprise' | 'startup' | 'healthcare_institution' | 'individual';
  verified: boolean;
  since: Date;
  rating: number;
  location: string;
  certifications: string[];
}

interface ServicePricing {
  model: 'free' | 'freemium' | 'subscription' | 'per_use' | 'enterprise';
  basePlan: {
    name: string;
    price: number;
    currency: string;
    period: 'month' | 'year' | 'transaction';
    features: string[];
  };
  plans: PricingPlan[];
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  popular: boolean;
  limits: Record<string, number>;
}

const mockServices: MarketplaceService[] = [
  {
    id: 's1',
    name: 'AI Diagnosis Assistant Pro',
    description: 'Assistente de diagnóstico baseado em IA com análise de sintomas, sugestões de tratamento e integração com prontuários eletrônicos.',
    category: 'ai_tools',
    provider: {
      id: 'p1',
      name: 'MedAI Solutions',
      logo: '🧠',
      type: 'enterprise',
      verified: true,
      since: new Date('2020-01-01'),
      rating: 4.8,
      location: 'San Francisco, USA',
      certifications: ['FDA Class II', 'CE Mark', 'HIPAA Compliant']
    },
    pricing: {
      model: 'subscription',
      basePlan: {
        name: 'Professional',
        price: 299,
        currency: 'USD',
        period: 'month',
        features: ['Unlimited consultations', 'Real-time analysis', 'EHR integration']
      },
      plans: [
        {
          id: 'basic',
          name: 'Basic',
          price: 99,
          currency: 'USD',
          period: 'month',
          features: ['100 consultations/month', 'Basic AI analysis'],
          popular: false,
          limits: { consultations: 100 }
        },
        {
          id: 'pro',
          name: 'Professional',
          price: 299,
          currency: 'USD',
          period: 'month',
          features: ['Unlimited consultations', 'Advanced AI', 'Priority support'],
          popular: true,
          limits: { consultations: -1 }
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 999,
          currency: 'USD',
          period: 'month',
          features: ['Custom deployment', 'White-label', 'Dedicated support'],
          popular: false,
          limits: {}
        }
      ]
    },
    rating: 4.8,
    reviews: 1247,
    features: ['AI-powered diagnosis', 'Multi-language support', 'Real-time analysis', 'EHR integration'],
    integrations: ['Epic', 'Cerner', 'Allscripts', 'HL7 FHIR'],
    certifications: ['FDA Approved', 'HIPAA Compliant', 'SOC 2'],
    availability: 'global',
    status: 'active',
    installCount: 15420,
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: 's2',
    name: 'Remote Patient Monitoring Suite',
    description: 'Plataforma completa de monitoramento remoto de pacientes com dispositivos IoT, alertas em tempo real e dashboard analítico.',
    category: 'telehealth',
    provider: {
      id: 'p2',
      name: 'HealthTech Innovations',
      logo: '📱',
      type: 'startup',
      verified: true,
      since: new Date('2019-06-01'),
      rating: 4.6,
      location: 'Tel Aviv, Israel',
      certifications: ['CE Mark', 'FDA Class II']
    },
    pricing: {
      model: 'per_use',
      basePlan: {
        name: 'Pay per Patient',
        price: 25,
        currency: 'USD',
        period: 'month',
        features: ['Per patient monitoring', 'Basic alerts', 'Standard support']
      },
      plans: []
    },
    rating: 4.6,
    reviews: 892,
    features: ['Wearable integration', 'Real-time alerts', 'Care team dashboard', 'Patient app'],
    integrations: ['Apple Health', 'Google Fit', 'Fitbit', 'Samsung Health'],
    certifications: ['HIPAA Compliant', 'GDPR Compliant'],
    availability: 'global',
    status: 'active',
    installCount: 8750,
    lastUpdated: new Date('2024-01-10')
  },
  {
    id: 's3',
    name: 'Virtual Pharmacy Connect',
    description: 'Solução de farmácia virtual com prescrição digital, entrega domiciliar e gestão de medicamentos.',
    category: 'pharmacy',
    provider: {
      id: 'p3',
      name: 'PharmaTech Global',
      logo: '💊',
      type: 'enterprise',
      verified: true,
      since: new Date('2015-03-01'),
      rating: 4.4,
      location: 'London, UK',
      certifications: ['GMP Certified', 'MHRA Approved']
    },
    pricing: {
      model: 'freemium',
      basePlan: {
        name: 'Basic',
        price: 0,
        currency: 'USD',
        period: 'month',
        features: ['Basic prescription management', 'Standard delivery']
      },
      plans: [
        {
          id: 'premium',
          name: 'Premium',
          price: 49,
          currency: 'USD',
          period: 'month',
          features: ['Priority delivery', 'Medication reminders', 'Consultation included'],
          popular: true,
          limits: {}
        }
      ]
    },
    rating: 4.4,
    reviews: 2156,
    features: ['Digital prescriptions', 'Home delivery', 'Medication tracking', 'Drug interaction alerts'],
    integrations: ['Major EHR systems', 'Insurance networks', 'Delivery partners'],
    certifications: ['FDA Registered', 'DEA Licensed'],
    availability: 'regional',
    status: 'active',
    installCount: 22300,
    lastUpdated: new Date('2024-01-08')
  }
];

export default function ServiceMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<MarketplaceService | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'popularity' | 'recent'>('rating');

  const categories = [
    { id: 'all', label: 'Todos', icon: Store },
    { id: 'telehealth', label: 'Telemedicina', icon: Globe },
    { id: 'ai_tools', label: 'IA & Analytics', icon: '🧠' },
    { id: 'pharmacy', label: 'Farmácia', icon: '💊' },
    { id: 'diagnostics', label: 'Diagnósticos', icon: '🔬' },
    { id: 'wellness', label: 'Bem-estar', icon: '💚' }
  ];

  const getPricingDisplay = (service: MarketplaceService) => {
    const { model, basePlan } = service.pricing;
    if (model === 'free') return 'Grátis';
    if (model === 'enterprise') return 'Contato';
    return `$${basePlan.price}/${basePlan.period}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'beta': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'coming_soon': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'deprecated': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredServices = mockServices.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Marketplace de Serviços
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Descubra e integre serviços de saúde de terceiros
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar serviços, provedores ou funcionalidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="rating">Melhor Avaliados</option>
              <option value="popularity">Mais Populares</option>
              <option value="price">Menor Preço</option>
              <option value="recent">Mais Recentes</option>
            </select>
            
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-600'
            }`}
          >
            {typeof category.icon === 'string' ? (
              <span className="text-lg">{category.icon}</span>
            ) : (
              <category.icon className="w-4 h-4" />
            )}
            {category.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <Card key={service.id} className="border border-gray-200 dark:border-dark-600 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{service.provider.logo}</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-dark-400">
                      por {service.provider.name}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-dark-400 line-clamp-3">
                {service.description}
              </p>
              
              {/* Rating and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{service.rating}</span>
                    <span className="text-sm text-gray-500">({service.reviews})</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-dark-400">
                  {service.installCount.toLocaleString()} instalações
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex flex-wrap gap-1">
                  {service.features.slice(0, 3).map(feature => (
                    <span key={feature} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                      {feature}
                    </span>
                  ))}
                  {service.features.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-dark-400 text-xs rounded">
                      +{service.features.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Provider Info */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-dark-600">
                <div className="flex items-center gap-2">
                  {service.provider.verified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-dark-400">
                    {service.provider.type === 'enterprise' ? 'Empresa' : 
                     service.provider.type === 'startup' ? 'Startup' : 'Individual'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {getPricingDisplay(service)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedService(service)}
                >
                  Ver Detalhes
                </Button>
                <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Instalar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedService.provider.logo}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedService.name}
                  </h3>
                  <p className="text-gray-600 dark:text-dark-400">
                    por {selectedService.provider.name}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedService(null)}>
                ×
              </Button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh] space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Descrição</h4>
                <p className="text-gray-600 dark:text-dark-400">{selectedService.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Funcionalidades</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {selectedService.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-dark-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedService.pricing.plans.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Planos e Preços</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {selectedService.pricing.plans.map(plan => (
                      <div key={plan.id} className={`p-4 border rounded-lg ${plan.popular ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-dark-600'}`}>
                        {plan.popular && (
                          <div className="text-center mb-2">
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">Mais Popular</span>
                          </div>
                        )}
                        <div className="text-center mb-3">
                          <h5 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h5>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${plan.price}
                            <span className="text-sm text-gray-500">/{plan.period}</span>
                          </div>
                        </div>
                        <ul className="space-y-1 text-sm">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Instalar Agora
                </Button>
                <Button variant="outline">
                  Testar Grátis
                </Button>
                <Button variant="outline">
                  Contatar Fornecedor
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedContainer>
  );
}