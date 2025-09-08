import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, Brain, Target, Activity, BarChart3, LineChart, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface LabAnalytics {
  patientId: string;
  patientName: string;
  age: number;
  gender: 'M' | 'F';
  timeSeriesData: LabTimePoint[];
  anomalies: LabAnomaly[];
  predictions: LabPrediction[];
  riskAssessment: RiskAssessment;
  correlations: ParameterCorrelation[];
  trends: TrendAnalysis[];
}

interface LabTimePoint {
  date: Date;
  parameters: {
    [key: string]: {
      value: number;
      status: 'normal' | 'alto' | 'baixo' | 'critico';
      referenceRange: [number, number];
    };
  };
}

interface LabAnomaly {
  id: string;
  parameter: string;
  value: number;
  expectedRange: [number, number];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  possibleCauses: string[];
  recommendations: string[];
  confidence: number;
  detectedAt: Date;
}

interface LabPrediction {
  id: string;
  parameter: string;
  currentValue: number;
  predictedValue: number;
  predictedDate: Date;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
}

interface RiskAssessment {
  overall: number; // 0-100
  categories: {
    cardiovascular: number;
    diabetes: number;
    kidney: number;
    liver: number;
    infection: number;
    metabolic: number;
  };
  alerts: RiskAlert[];
}

interface RiskAlert {
  type: 'warning' | 'danger';
  condition: string;
  probability: number;
  indicators: string[];
  recommendations: string[];
}

interface ParameterCorrelation {
  param1: string;
  param2: string;
  correlation: number; // -1 to 1
  pValue: number;
  significance: 'high' | 'medium' | 'low';
  clinicalRelevance: string;
}

interface TrendAnalysis {
  parameter: string;
  period: '7d' | '30d' | '90d' | '1y';
  direction: 'up' | 'down' | 'stable';
  rate: number;
  significance: 'significant' | 'moderate' | 'minimal';
  clinicalImplication: string;
}

const mockAnalytics: LabAnalytics = {
  patientId: 'p123',
  patientName: 'João Silva Santos',
  age: 45,
  gender: 'M',
  timeSeriesData: [
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      parameters: {
        'Glicemia': { value: 95, status: 'normal', referenceRange: [70, 99] },
        'Colesterol': { value: 180, status: 'normal', referenceRange: [0, 200] },
        'HDL': { value: 45, status: 'normal', referenceRange: [40, 60] },
        'LDL': { value: 120, status: 'normal', referenceRange: [0, 130] }
      }
    },
    {
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      parameters: {
        'Glicemia': { value: 105, status: 'alto', referenceRange: [70, 99] },
        'Colesterol': { value: 195, status: 'normal', referenceRange: [0, 200] },
        'HDL': { value: 42, status: 'normal', referenceRange: [40, 60] },
        'LDL': { value: 135, status: 'alto', referenceRange: [0, 130] }
      }
    },
    {
      date: new Date(),
      parameters: {
        'Glicemia': { value: 115, status: 'alto', referenceRange: [70, 99] },
        'Colesterol': { value: 210, status: 'alto', referenceRange: [0, 200] },
        'HDL': { value: 38, status: 'baixo', referenceRange: [40, 60] },
        'LDL': { value: 145, status: 'alto', referenceRange: [0, 130] }
      }
    }
  ],
  anomalies: [
    {
      id: '1',
      parameter: 'Glicemia',
      value: 115,
      expectedRange: [70, 99],
      severity: 'medium',
      description: 'Glicemia persistentemente elevada indicando possível pré-diabetes',
      possibleCauses: ['Resistência insulínica', 'Estresse', 'Dieta inadequada', 'Sedentarismo'],
      recommendations: [
        'Teste de tolerância à glicose',
        'Avaliação dietética',
        'Programa de exercícios',
        'Monitoramento regular'
      ],
      confidence: 0.85,
      detectedAt: new Date()
    },
    {
      id: '2',
      parameter: 'HDL',
      value: 38,
      expectedRange: [40, 60],
      severity: 'medium',
      description: 'HDL baixo aumenta risco cardiovascular',
      possibleCauses: ['Sedentarismo', 'Tabagismo', 'Sobrepeso', 'Genética'],
      recommendations: [
        'Exercícios aeróbicos regulares',
        'Cessação do tabagismo se aplicável',
        'Dieta rica em ômega-3',
        'Avaliação cardiológica'
      ],
      confidence: 0.92,
      detectedAt: new Date()
    }
  ],
  predictions: [
    {
      id: '1',
      parameter: 'Glicemia',
      currentValue: 115,
      predictedValue: 125,
      predictedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      confidence: 0.78,
      trend: 'increasing',
      factors: ['Tendência histórica', 'Idade', 'Padrão alimentar']
    },
    {
      id: '2',
      parameter: 'LDL',
      currentValue: 145,
      predictedValue: 155,
      predictedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      confidence: 0.71,
      trend: 'increasing',
      factors: ['Progressão atual', 'Fatores de risco', 'Histórico familiar']
    }
  ],
  riskAssessment: {
    overall: 65,
    categories: {
      cardiovascular: 70,
      diabetes: 75,
      kidney: 25,
      liver: 30,
      infection: 15,
      metabolic: 60
    },
    alerts: [
      {
        type: 'warning',
        condition: 'Síndrome Metabólica',
        probability: 0.65,
        indicators: ['Glicemia elevada', 'HDL baixo', 'LDL alto'],
        recommendations: [
          'Consulta endocrinológica',
          'Programa de mudança de estilo de vida',
          'Monitoramento cardiovascular'
        ]
      },
      {
        type: 'danger',
        condition: 'Pré-diabetes',
        probability: 0.78,
        indicators: ['Glicemia de jejum > 100mg/dL persistente', 'Tendência crescente'],
        recommendations: [
          'Teste de hemoglobina glicada',
          'Curva glicêmica',
          'Intervenção dietética imediata'
        ]
      }
    ]
  },
  correlations: [
    {
      param1: 'Glicemia',
      param2: 'LDL',
      correlation: 0.72,
      pValue: 0.003,
      significance: 'high',
      clinicalRelevance: 'Hiperglicemia associada ao aumento do LDL indica risco metabólico'
    },
    {
      param1: 'HDL',
      param2: 'Glicemia',
      correlation: -0.68,
      pValue: 0.007,
      significance: 'high',
      clinicalRelevance: 'Relação inversa típica da síndrome metabólica'
    }
  ],
  trends: [
    {
      parameter: 'Glicemia',
      period: '30d',
      direction: 'up',
      rate: 1.2,
      significance: 'significant',
      clinicalImplication: 'Deterioração do controle glicêmico - intervenção necessária'
    },
    {
      parameter: 'HDL',
      period: '30d',
      direction: 'down',
      rate: -0.8,
      significance: 'moderate',
      clinicalImplication: 'Redução do HDL aumenta risco cardiovascular'
    }
  ]
};

export default function AdvancedLabAnalytics() {
  const [selectedPatient, setSelectedPatient] = useState<LabAnalytics>(mockAnalytics);
  const [activeView, setActiveView] = useState<'anomalies' | 'predictions' | 'risk' | 'correlations' | 'trends'>('anomalies');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'bg-red-500';
    if (risk >= 60) return 'bg-orange-500';
    if (risk >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const AnomaliesView = () => (
    <div className="space-y-4">
      {selectedPatient.anomalies.map(anomaly => (
        <Card key={anomaly.id} className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {anomaly.parameter}: {anomaly.value}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-dark-400">
                    {anomaly.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                  {anomaly.severity}
                </span>
                <span className="text-sm text-gray-500 dark:text-dark-400">
                  {Math.round(anomaly.confidence * 100)}% confiança
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Possíveis Causas:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-dark-400 space-y-1">
                  {anomaly.possibleCauses.map((cause, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Recomendações:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-dark-400 space-y-1">
                  {anomaly.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const PredictionsView = () => (
    <div className="space-y-4">
      {selectedPatient.predictions.map(prediction => (
        <Card key={prediction.id} className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {prediction.parameter}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-dark-400">
                    Previsão para {prediction.predictedDate.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-dark-400">
                {Math.round(prediction.confidence * 100)}% confiança
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-dark-700 rounded">
                <p className="text-sm text-gray-600 dark:text-dark-400">Valor Atual</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {prediction.currentValue}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm text-blue-600 dark:text-blue-400">Valor Previsto</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {prediction.predictedValue}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-dark-700 rounded">
                <p className="text-sm text-gray-600 dark:text-dark-400">Tendência</p>
                <div className="flex items-center justify-center gap-1">
                  {prediction.trend === 'increasing' && <TrendingUp className="w-4 h-4 text-red-500" />}
                  {prediction.trend === 'decreasing' && <TrendingUp className="w-4 h-4 text-green-500 transform rotate-180" />}
                  {prediction.trend === 'stable' && <Activity className="w-4 h-4 text-gray-500" />}
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {prediction.trend}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Fatores Influenciadores:
              </h4>
              <div className="flex flex-wrap gap-2">
                {prediction.factors.map((factor, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const RiskView = () => (
    <div className="space-y-6">
      {/* Overall Risk */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Avaliação Geral de Risco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-dark-600"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - selectedPatient.riskAssessment.overall / 100)}`}
                  className={`${getRiskColor(selectedPatient.riskAssessment.overall).replace('bg-', 'text-')}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedPatient.riskAssessment.overall}%
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Risco Moderado a Alto
              </h3>
              <p className="text-gray-600 dark:text-dark-400">
                Requer monitoramento e intervenção
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Risks */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Risco por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(selectedPatient.riskAssessment.categories).map(([category, risk]) => (
              <div key={category} className="flex items-center gap-4">
                <div className="w-32">
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {category === 'cardiovascular' ? 'Cardiovascular' : 
                     category === 'diabetes' ? 'Diabetes' :
                     category === 'kidney' ? 'Renal' :
                     category === 'liver' ? 'Hepática' :
                     category === 'infection' ? 'Infecção' :
                     category === 'metabolic' ? 'Metabólica' : category}
                  </span>
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getRiskColor(risk)}`}
                    style={{ width: `${risk}%` }}
                  />
                </div>
                <div className="w-12 text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {risk}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Alerts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alertas de Risco
        </h3>
        {selectedPatient.riskAssessment.alerts.map((alert, index) => (
          <Card key={index} className={`border ${alert.type === 'danger' ? 'border-red-300 dark:border-red-600' : 'border-orange-300 dark:border-orange-600'}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-6 h-6 mt-1 ${alert.type === 'danger' ? 'text-red-500' : 'text-orange-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {alert.condition}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-dark-400">
                      {Math.round(alert.probability * 100)}% probabilidade
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Indicadores:
                      </h5>
                      <ul className="text-sm text-gray-600 dark:text-dark-400 space-y-1">
                        {alert.indicators.map((indicator, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Recomendações:
                      </h5>
                      <ul className="text-sm text-gray-600 dark:text-dark-400 space-y-1">
                        {alert.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const CorrelationsView = () => (
    <div className="space-y-4">
      {selectedPatient.correlations.map((correlation, index) => (
        <Card key={index} className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {correlation.param1} ↔ {correlation.param2}
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-400">
                  {correlation.clinicalRelevance}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(correlation.significance)}`}>
                {correlation.significance}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-dark-700 rounded">
                <p className="text-sm text-gray-600 dark:text-dark-400">Correlação</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {correlation.correlation.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-dark-700 rounded">
                <p className="text-sm text-gray-600 dark:text-dark-400">P-valor</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {correlation.pValue.toFixed(3)}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-dark-700 rounded">
                <p className="text-sm text-gray-600 dark:text-dark-400">Força</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.abs(correlation.correlation) > 0.7 ? 'Forte' : 
                   Math.abs(correlation.correlation) > 0.3 ? 'Moderada' : 'Fraca'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const TrendsView = () => (
    <div className="space-y-4">
      {selectedPatient.trends.map((trend, index) => (
        <Card key={index} className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <LineChart className="w-6 h-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {trend.parameter}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-dark-400">
                    Análise de {trend.period}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                {trend.direction === 'down' && <TrendingUp className="w-4 h-4 text-green-500 transform rotate-180" />}
                {trend.direction === 'stable' && <Activity className="w-4 h-4 text-gray-500" />}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(trend.significance)}`}>
                  {trend.significance}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-dark-400 mb-2">
                Taxa de mudança: {trend.rate > 0 ? '+' : ''}{trend.rate.toFixed(1)} por período
              </p>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    trend.direction === 'up' ? 'bg-red-500' : 
                    trend.direction === 'down' ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                  style={{ width: `${Math.min(Math.abs(trend.rate) * 20, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Implicação Clínica:
              </h4>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                {trend.clinicalImplication}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
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
              Análise Inteligente de Laboratório
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              IA aplicada na interpretação de resultados laboratoriais
            </p>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedPatient.patientName}
              </h2>
              <p className="text-gray-600 dark:text-dark-400">
                {selectedPatient.age} anos, {selectedPatient.gender === 'M' ? 'Masculino' : 'Feminino'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-dark-400">
                Última análise: {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-400">
                {selectedPatient.timeSeriesData.length} pontos temporais
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'anomalies', label: 'Anomalias', icon: AlertTriangle },
          { id: 'predictions', label: 'Previsões', icon: TrendingUp },
          { id: 'risk', label: 'Risco', icon: Target },
          { id: 'correlations', label: 'Correlações', icon: BarChart3 },
          { id: 'trends', label: 'Tendências', icon: LineChart }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeView === tab.id
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

      {/* Content Views */}
      {activeView === 'anomalies' && <AnomaliesView />}
      {activeView === 'predictions' && <PredictionsView />}
      {activeView === 'risk' && <RiskView />}
      {activeView === 'correlations' && <CorrelationsView />}
      {activeView === 'trends' && <TrendsView />}
    </AnimatedContainer>
  );
}