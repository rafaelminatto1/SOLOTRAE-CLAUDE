import React, { useState } from 'react';
import { TrendingUp, Brain, BarChart3, LineChart, PieChart, AlertTriangle, Target, Zap, Filter, Download, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface PredictiveModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'time_series' | 'anomaly_detection';
  category: 'clinical' | 'operational' | 'financial' | 'patient_behavior' | 'resource_planning';
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingData: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'evaluating' | 'deprecated';
  predictions: Prediction[];
  features: ModelFeature[];
  businessImpact: BusinessImpact;
}

interface Prediction {
  id: string;
  timestamp: Date;
  prediction: any;
  confidence: number;
  actualOutcome?: any;
  accuracy?: number;
  patientId?: string;
  context: PredictionContext;
}

interface PredictionContext {
  category: string;
  timeHorizon: '1_day' | '1_week' | '1_month' | '3_months' | '1_year';
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  actionable: boolean;
  interventions: string[];
}

interface ModelFeature {
  name: string;
  importance: number;
  type: 'numerical' | 'categorical' | 'text' | 'image' | 'time_series';
  dataSource: string;
  correlation: number;
}

interface BusinessImpact {
  costSavings: number;
  revenueIncrease: number;
  efficiencyGain: number;
  qualityImprovement: number;
  riskReduction: number;
  patientSatisfaction: number;
}

interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'pattern' | 'correlation' | 'forecast';
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendedActions: string[];
  impact: {
    clinical: number;
    financial: number;
    operational: number;
  };
  timeframe: string;
  visualizationType: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
  data: any[];
}

interface MLPipeline {
  id: string;
  name: string;
  steps: PipelineStep[];
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  progress: number;
  startTime: Date;
  estimatedCompletion: Date;
  dataVolume: number;
  resourceUsage: ResourceUsage;
}

interface PipelineStep {
  name: string;
  type: 'data_ingestion' | 'preprocessing' | 'feature_engineering' | 'model_training' | 'evaluation' | 'deployment';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  duration?: number;
  errors?: string[];
}

interface ResourceUsage {
  cpu: number;
  memory: number;
  gpu: number;
  storage: number;
  cost: number;
}

const mockModels: PredictiveModel[] = [
  {
    id: 'model_1',
    name: 'Previsão de Readmissão Hospitalar',
    type: 'classification',
    category: 'clinical',
    algorithm: 'Random Forest Classifier',
    accuracy: 0.87,
    precision: 0.84,
    recall: 0.89,
    f1Score: 0.86,
    trainingData: 50000,
    lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'active',
    predictions: [],
    features: [
      { name: 'Idade', importance: 0.23, type: 'numerical', dataSource: 'patient_demographics', correlation: 0.45 },
      { name: 'Comorbidades', importance: 0.19, type: 'categorical', dataSource: 'medical_history', correlation: 0.67 },
      { name: 'Tempo de Internação', importance: 0.16, type: 'numerical', dataSource: 'admission_data', correlation: 0.52 },
      { name: 'Medicações', importance: 0.14, type: 'categorical', dataSource: 'prescriptions', correlation: 0.38 }
    ],
    businessImpact: {
      costSavings: 850000,
      revenueIncrease: 0,
      efficiencyGain: 15,
      qualityImprovement: 22,
      riskReduction: 35,
      patientSatisfaction: 18
    }
  },
  {
    id: 'model_2',
    name: 'Otimização de Agendamento',
    type: 'regression',
    category: 'operational',
    algorithm: 'XGBoost Regressor',
    accuracy: 0.92,
    precision: 0.91,
    recall: 0.93,
    f1Score: 0.92,
    trainingData: 120000,
    lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'active',
    predictions: [],
    features: [
      { name: 'Histórico de No-Shows', importance: 0.28, type: 'numerical', dataSource: 'appointments', correlation: 0.73 },
      { name: 'Tipo de Consulta', importance: 0.22, type: 'categorical', dataSource: 'services', correlation: 0.56 },
      { name: 'Dia da Semana', importance: 0.18, type: 'categorical', dataSource: 'calendar', correlation: 0.41 },
      { name: 'Distância da Clínica', importance: 0.15, type: 'numerical', dataSource: 'patient_location', correlation: 0.34 }
    ],
    businessImpact: {
      costSavings: 320000,
      revenueIncrease: 480000,
      efficiencyGain: 28,
      qualityImprovement: 12,
      riskReduction: 8,
      patientSatisfaction: 25
    }
  },
  {
    id: 'model_3',
    name: 'Detecção de Fraudes',
    type: 'anomaly_detection',
    category: 'financial',
    algorithm: 'Isolation Forest',
    accuracy: 0.94,
    precision: 0.88,
    recall: 0.96,
    f1Score: 0.92,
    trainingData: 75000,
    lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'active',
    predictions: [],
    features: [
      { name: 'Valor da Transação', importance: 0.31, type: 'numerical', dataSource: 'billing', correlation: 0.82 },
      { name: 'Frequência de Uso', importance: 0.25, type: 'numerical', dataSource: 'patient_activity', correlation: 0.67 },
      { name: 'Padrão Geográfico', importance: 0.20, type: 'numerical', dataSource: 'location_data', correlation: 0.54 }
    ],
    businessImpact: {
      costSavings: 1200000,
      revenueIncrease: 0,
      efficiencyGain: 45,
      qualityImprovement: 0,
      riskReduction: 78,
      patientSatisfaction: 0
    }
  }
];

const mockInsights: AnalyticsInsight[] = [
  {
    id: 'insight_1',
    type: 'trend',
    title: 'Aumento de 23% nas Consultas Cardiológicas',
    description: 'Observamos um crescimento significativo nas consultas cardiológicas nos últimos 3 meses, especialmente em pacientes entre 45-65 anos.',
    significance: 'high',
    confidence: 0.89,
    recommendedActions: [
      'Expandir equipe de cardiologistas',
      'Implementar programa de prevenção cardiovascular',
      'Otimizar agendamento para especialidade'
    ],
    impact: {
      clinical: 8.5,
      financial: 6.2,
      operational: 7.8
    },
    timeframe: '3 meses',
    visualizationType: 'line',
    data: []
  },
  {
    id: 'insight_2',
    type: 'anomaly',
    title: 'Pico Anômalo de No-Shows nas Quintas-feiras',
    description: 'Taxa de faltas 40% maior nas quintas-feiras comparado à média semanal, possivelmente relacionado a fatores externos.',
    significance: 'medium',
    confidence: 0.76,
    recommendedActions: [
      'Implementar lembretes adicionais para quintas-feiras',
      'Ajustar política de cancelamento',
      'Investigar causas específicas'
    ],
    impact: {
      clinical: 4.2,
      financial: 5.8,
      operational: 6.5
    },
    timeframe: '6 semanas',
    visualizationType: 'bar',
    data: []
  },
  {
    id: 'insight_3',
    type: 'forecast',
    title: 'Previsão de Demanda para Dezembro',
    description: 'Modelo prevê aumento de 35% na demanda geral em dezembro, com pico nas especialidades de pneumologia e infectologia.',
    significance: 'critical',
    confidence: 0.92,
    recommendedActions: [
      'Contratar profissionais temporários',
      'Estender horários de atendimento',
      'Implementar telemedicina adicional'
    ],
    impact: {
      clinical: 9.2,
      financial: 8.7,
      operational: 9.5
    },
    timeframe: 'Próximos 2 meses',
    visualizationType: 'line',
    data: []
  }
];

const mockPipelines: MLPipeline[] = [
  {
    id: 'pipeline_1',
    name: 'Retreinamento Modelo Readmissão',
    status: 'running',
    progress: 65,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    estimatedCompletion: new Date(Date.now() + 1 * 60 * 60 * 1000),
    dataVolume: 85000,
    resourceUsage: {
      cpu: 75,
      memory: 68,
      gpu: 45,
      storage: 120,
      cost: 24.50
    },
    steps: [
      { name: 'Ingestão de Dados', type: 'data_ingestion', status: 'completed', progress: 100, duration: 15 },
      { name: 'Pré-processamento', type: 'preprocessing', status: 'completed', progress: 100, duration: 28 },
      { name: 'Engenharia de Features', type: 'feature_engineering', status: 'completed', progress: 100, duration: 22 },
      { name: 'Treinamento do Modelo', type: 'model_training', status: 'running', progress: 60 },
      { name: 'Avaliação', type: 'evaluation', status: 'pending', progress: 0 },
      { name: 'Deploy', type: 'deployment', status: 'pending', progress: 0 }
    ]
  }
];

export default function PredictiveAnalytics() {
  const [activeTab, setActiveTab] = useState<'insights' | 'models' | 'pipelines' | 'reports'>('insights');
  const [selectedModel, setSelectedModel] = useState<PredictiveModel | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'training':
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'evaluating':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'deprecated':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const InsightsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Insights de IA
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button className="bg-purple-500 hover:bg-purple-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockInsights.map(insight => (
          <Card key={insight.id} className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  {insight.type === 'trend' && <TrendingUp className="w-5 h-5 text-blue-500 mt-1" />}
                  {insight.type === 'anomaly' && <AlertTriangle className="w-5 h-5 text-orange-500 mt-1" />}
                  {insight.type === 'forecast' && <Target className="w-5 h-5 text-purple-500 mt-1" />}
                  {insight.type === 'pattern' && <BarChart3 className="w-5 h-5 text-green-500 mt-1" />}
                  {insight.type === 'correlation' && <LineChart className="w-5 h-5 text-indigo-500 mt-1" />}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                      {insight.title}
                    </h3>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getSignificanceColor(insight.significance)}`}>
                  {insight.significance}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-dark-400">
                {insight.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-400">Confiança:</span>
                <span className="font-medium">{Math.round(insight.confidence * 100)}%</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-400">Período:</span>
                <span className="font-medium">{insight.timeframe}</span>
              </div>

              {/* Impact Scores */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Impacto:
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'Clínico', value: insight.impact.clinical, color: 'bg-red-500' },
                    { label: 'Financeiro', value: insight.impact.financial, color: 'bg-green-500' },
                    { label: 'Operacional', value: insight.impact.operational, color: 'bg-blue-500' }
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16">{item.label}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-dark-600 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${item.color}`}
                          style={{ width: `${item.value * 10}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              {insight.recommendedActions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Ações Recomendadas:
                  </h4>
                  <div className="space-y-1">
                    {insight.recommendedActions.slice(0, 2).map((action, index) => (
                      <div key={index} className="text-xs text-gray-600 dark:text-dark-400 flex items-start gap-1">
                        <div className="w-1 h-1 bg-current rounded-full mt-1.5 flex-shrink-0" />
                        {action}
                      </div>
                    ))}
                    {insight.recommendedActions.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-dark-400">
                        +{insight.recommendedActions.length - 2} mais...
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full">
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ModelsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Modelos de Machine Learning
        </h2>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Brain className="w-4 h-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      <div className="space-y-4">
        {mockModels.map(model => (
          <Card key={model.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {model.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-400 mt-1">
                    <span className="capitalize">{model.category.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{model.algorithm}</span>
                    <span>•</span>
                    <span>{model.trainingData.toLocaleString()} registros</span>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(model.status)}`}>
                  {model.status}
                </span>
              </div>

              {/* Performance Metrics */}
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-dark-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-dark-400">Acurácia</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.round(model.accuracy * 100)}%
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-dark-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-dark-400">Precisão</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.round(model.precision * 100)}%
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-dark-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-dark-400">Recall</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.round(model.recall * 100)}%
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-dark-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-dark-400">F1-Score</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.round(model.f1Score * 100)}%
                  </p>
                </div>
              </div>

              {/* Top Features */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Features Mais Importantes:
                </h4>
                <div className="space-y-2">
                  {model.features.slice(0, 4).map(feature => (
                    <div key={feature.name} className="flex items-center gap-3">
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {feature.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-dark-400">
                          {Math.round(feature.importance * 100)}%
                        </span>
                      </div>
                      <div className="w-24 bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${feature.importance * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Impact */}
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                  Impacto no Negócio:
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700 dark:text-green-400">Economia de Custos:</span>
                    <p className="font-bold">R$ {model.businessImpact.costSavings.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-green-700 dark:text-green-400">Melhoria na Qualidade:</span>
                    <p className="font-bold">{model.businessImpact.qualityImprovement}%</p>
                  </div>
                  <div>
                    <span className="text-green-700 dark:text-green-400">Redução de Risco:</span>
                    <p className="font-bold">{model.businessImpact.riskReduction}%</p>
                  </div>
                  <div>
                    <span className="text-green-700 dark:text-green-400">Ganho de Eficiência:</span>
                    <p className="font-bold">{model.businessImpact.efficiencyGain}%</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-dark-400">
                  Último treino: {model.lastTrained.toLocaleDateString('pt-BR')}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedModel(model)}>
                    Detalhes
                  </Button>
                  <Button variant="outline" size="sm">
                    Retreinar
                  </Button>
                  <Button variant="outline" size="sm">
                    Deploy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const PipelinesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Pipelines de ML
        </h2>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Zap className="w-4 h-4 mr-2" />
          Nova Pipeline
        </Button>
      </div>

      <div className="space-y-4">
        {mockPipelines.map(pipeline => (
          <Card key={pipeline.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pipeline.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-400 mt-1">
                    <span>{pipeline.dataVolume.toLocaleString()} registros</span>
                    <span>•</span>
                    <span>Início: {pipeline.startTime.toLocaleTimeString('pt-BR')}</span>
                    <span>•</span>
                    <span>ETA: {pipeline.estimatedCompletion.toLocaleTimeString('pt-BR')}</span>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pipeline.status)}`}>
                  {pipeline.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-dark-400">Progresso Geral</span>
                  <span className="text-sm font-medium">{pipeline.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${pipeline.progress}%` }}
                  />
                </div>
              </div>

              {/* Pipeline Steps */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Etapas da Pipeline:
                </h4>
                <div className="space-y-2">
                  {pipeline.steps.map((step, index) => (
                    <div key={step.name} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'running' ? 'bg-blue-500 text-white' :
                        step.status === 'failed' ? 'bg-red-500 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {step.status === 'completed' ? '✓' : 
                         step.status === 'failed' ? '✗' : index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {step.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-dark-400">
                            {step.progress}%
                          </span>
                        </div>
                        {step.status === 'running' && (
                          <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1 mt-1">
                            <div 
                              className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${step.progress}%` }}
                            />
                          </div>
                        )}
                        {step.duration && (
                          <span className="text-xs text-gray-400">
                            {step.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Usage */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 dark:bg-dark-700 rounded">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-dark-400">CPU</p>
                  <p className="font-bold text-gray-900 dark:text-white">{pipeline.resourceUsage.cpu}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-dark-400">Memória</p>
                  <p className="font-bold text-gray-900 dark:text-white">{pipeline.resourceUsage.memory}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-dark-400">GPU</p>
                  <p className="font-bold text-gray-900 dark:text-white">{pipeline.resourceUsage.gpu}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-dark-400">Storage</p>
                  <p className="font-bold text-gray-900 dark:text-white">{pipeline.resourceUsage.storage}GB</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-dark-400">Custo</p>
                  <p className="font-bold text-gray-900 dark:text-white">R$ {pipeline.resourceUsage.cost.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Ver Logs
                </Button>
                <Button variant="outline" size="sm">
                  Pausar
                </Button>
                <Button variant="outline" size="sm">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Preditiva
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Inteligência artificial aplicada à tomada de decisões em saúde
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Modelos Ativos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockModels.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Insights Gerados</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockInsights.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Pipelines Rodando</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockPipelines.filter(p => p.status === 'running').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Acurácia Média</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.round(mockModels.reduce((acc, m) => acc + m.accuracy, 0) / mockModels.length * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'insights', label: 'Insights', icon: TrendingUp },
          { id: 'models', label: 'Modelos ML', icon: Brain },
          { id: 'pipelines', label: 'Pipelines', icon: Zap },
          { id: 'reports', label: 'Relatórios', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'insights' && <InsightsTab />}
      {activeTab === 'models' && <ModelsTab />}
      {activeTab === 'pipelines' && <PipelinesTab />}
      {activeTab === 'reports' && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Relatórios Avançados
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Sistema de relatórios automatizados em desenvolvimento...
          </p>
        </div>
      )}
    </AnimatedContainer>
  );
}