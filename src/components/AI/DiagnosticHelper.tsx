import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  Stethoscope,
  Brain,
  AlertCircle,
  CheckCircle,
  Target,
  Activity,
  FileText,
  Search,
  Lightbulb,
  TrendingUp,
  Clock,
  User,
  MapPin,
  Zap,
  BookOpen,
  Star,
  Filter,
  Download,
  Share,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Mic,
  MicOff,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Symptom {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  location?: string;
  triggers?: string[];
  alleviators?: string[];
}

interface DiagnosticHypothesis {
  condition: string;
  probability: number;
  confidence: number;
  evidence: string[];
  contraEvidence: string[];
  suggestedTests: string[];
  redFlags: string[];
  treatmentApproach: string;
  prognosis: {
    timeframe: string;
    outlook: 'excellent' | 'good' | 'fair' | 'guarded';
    factors: string[];
  };
}

interface ClinicalDecisionSupport {
  recommendedAction: 'continue_assessment' | 'refer_specialist' | 'order_imaging' | 'start_treatment' | 'urgent_referral';
  reasoning: string;
  nextSteps: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
}

interface DiagnosticHelperProps {
  patientId?: string;
  onDiagnosisComplete?: (diagnosis: DiagnosticHypothesis[]) => void;
  mode?: 'guided' | 'free_form' | 'quick_assessment';
  className?: string;
}

export default function DiagnosticHelper({
  patientId,
  onDiagnosisComplete,
  mode = 'guided',
  className = ''
}: DiagnosticHelperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [patientHistory, setPatientHistory] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [hypotheses, setHypotheses] = useState<DiagnosticHypothesis[]>([]);
  const [clinicalSupport, setClinicalSupport] = useState<ClinicalDecisionSupport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<'assessment' | 'differential' | 'tests' | 'decision'>('assessment');

  const steps = [
    { title: 'Queixa Principal', description: 'Descreva o motivo da consulta' },
    { title: 'Sintomas', description: 'Detalhe os sintomas presentes' },
    { title: 'História Clínica', description: 'Histórico relevante do paciente' },
    { title: 'Exame Físico', description: 'Achados do exame físico' },
    { title: 'Análise IA', description: 'Processamento e diagnóstico diferencial' }
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      performAIAnalysis();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSymptom = () => {
    const newSymptom: Symptom = {
      name: '',
      severity: 'mild',
      duration: '',
      location: '',
      triggers: [],
      alleviators: []
    };
    setSymptoms([...symptoms, newSymptom]);
  };

  const updateSymptom = (index: number, updates: Partial<Symptom>) => {
    const newSymptoms = [...symptoms];
    newSymptoms[index] = { ...newSymptoms[index], ...updates };
    setSymptoms(newSymptoms);
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simular análise de IA - integrar com API real
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockHypotheses: DiagnosticHypothesis[] = [
        {
          condition: 'Lombalgia Mecânica',
          probability: 85,
          confidence: 92,
          evidence: [
            'Dor lombar de início gradual',
            'Piora com movimento e melhora com repouso',
            'Ausência de sinais neurológicos',
            'Teste de Lasègue negativo',
            'Dor localizada na região L4-L5'
          ],
          contraEvidence: [
            'Ausência de irradiação para membros inferiores',
            'Reflexos preservados',
            'Força muscular normal'
          ],
          suggestedTests: [
            'Ressonância magnética (se persistir > 6 semanas)',
            'Radiografia simples de coluna lombar',
            'Testes funcionais específicos'
          ],
          redFlags: [],
          treatmentApproach: 'Fisioterapia conservadora com exercícios de fortalecimento do core e mobilização articular',
          prognosis: {
            timeframe: '4-8 semanas',
            outlook: 'good',
            factors: ['Idade do paciente', 'Aderência ao tratamento', 'Condicionamento físico']
          }
        },
        {
          condition: 'Síndrome Facetária',
          probability: 65,
          confidence: 78,
          evidence: [
            'Dor lombar unilateral',
            'Piora com extensão e rotação',
            'Dor referida para nádegas',
            'Teste de Kemp positivo'
          ],
          contraEvidence: [
            'Ausência de rigidez matinal significativa',
            'Mobilidade articular preservada'
          ],
          suggestedTests: [
            'Bloqueio diagnóstico das facetas',
            'TC de coluna lombar',
            'Cintilografia óssea'
          ],
          redFlags: [],
          treatmentApproach: 'Técnicas manuais direcionadas às facetas, exercícios específicos de mobilidade',
          prognosis: {
            timeframe: '6-10 semanas',
            outlook: 'good',
            factors: ['Grau de degeneração articular', 'Resposta ao tratamento conservador']
          }
        },
        {
          condition: 'Hérnia Discal L4-L5',
          probability: 25,
          confidence: 65,
          evidence: [
            'História de movimento brusco',
            'Dor com componente radicular leve',
            'Desconforto ao tossir/espirrar'
          ],
          contraEvidence: [
            'Lasègue negativo',
            'Ausência de déficit neurológico',
            'Reflexos normais',
            'Força muscular preservada'
          ],
          suggestedTests: [
            'RM de coluna lombossacra (prioritária)',
            'Eletroneuromiografia',
            'Tomografia computadorizada'
          ],
          redFlags: [
            'Monitorar evolução neurológica',
            'Atenção para síndrome da cauda equina'
          ],
          treatmentApproach: 'Fisioterapia conservadora inicialmente, evitar flexão excessiva',
          prognosis: {
            timeframe: '8-12 semanas',
            outlook: 'fair',
            factors: ['Tamanho da hérnia', 'Resposta ao tratamento conservador', 'Atividade profissional']
          }
        }
      ];

      const mockClinicalSupport: ClinicalDecisionSupport = {
        recommendedAction: 'start_treatment',
        reasoning: 'Baseado na apresentação clínica e ausência de red flags, é recomendado iniciar tratamento conservador com fisioterapia.',
        nextSteps: [
          'Iniciar fisioterapia com foco em fortalecimento do core',
          'Orientações ergonômicas e posturais',
          'Reavaliação em 2 semanas',
          'Considerar RM se não houver melhora em 6 semanas'
        ],
        urgencyLevel: 'low'
      };

      setHypotheses(mockHypotheses);
      setClinicalSupport(mockClinicalSupport);
      onDiagnosisComplete?.(mockHypotheses);

    } catch (error) {
      console.error('Erro na análise de IA:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (probability >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (isAnalyzing) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              IA Analisando Caso Clínico...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processando dados e gerando diagnóstico diferencial
            </p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>🔍 Analisando sintomas e história clínica...</p>
          <p>📊 Correlacionando com base de conhecimento médico...</p>
          <p>🎯 Gerando diagnósticos diferenciais...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                Assistente de Diagnóstico IA
                <Brain className="h-4 w-4 ml-2 text-green-500 animate-pulse" />
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suporte inteligente para tomada de decisão clínica
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        {mode === 'guided' && !hypotheses.length && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Progresso da Avaliação
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentStep + 1} de {steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`text-xs ${
                    index <= currentStep
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {step.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Content */}
      {!hypotheses.length ? (
        <Card>
          <div className="p-6">
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {steps[currentStep].title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </div>

            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Queixa Principal
                  </label>
                  <Textarea
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Ex: Dor lombar há 2 semanas, piora ao levantar pela manhã..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mic className="h-4 w-4" />
                  <span>Dica: Use o microfone para gravação de áudio</span>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    Sintomas Identificados ({symptoms.length})
                  </h5>
                  <Button size="sm" onClick={addSymptom}>
                    <Target className="h-4 w-4 mr-1" />
                    Adicionar Sintoma
                  </Button>
                </div>

                {symptoms.map((symptom, index) => (
                  <Card key={index} variant="outlined" className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sintoma
                        </label>
                        <Input
                          value={symptom.name}
                          onChange={(e) => updateSymptom(index, { name: e.target.value })}
                          placeholder="Ex: Dor lombar"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Severidade
                        </label>
                        <select
                          value={symptom.severity}
                          onChange={(e) => updateSymptom(index, { severity: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                        >
                          <option value="mild">Leve</option>
                          <option value="moderate">Moderada</option>
                          <option value="severe">Severa</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Duração
                        </label>
                        <Input
                          value={symptom.duration}
                          onChange={(e) => updateSymptom(index, { duration: e.target.value })}
                          placeholder="Ex: 2 semanas"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Localização
                        </label>
                        <Input
                          value={symptom.location || ''}
                          onChange={(e) => updateSymptom(index, { location: e.target.value })}
                          placeholder="Ex: Região lombar baixa"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSymptom(index)}
                        className="text-red-600"
                      >
                        Remover
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    História Clínica Relevante
                  </label>
                  <Textarea
                    value={patientHistory}
                    onChange={(e) => setPatientHistory(e.target.value)}
                    placeholder="Histórico médico, cirurgias anteriores, medicamentos, alergias..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded">
                    <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Dicas</h6>
                    <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
                      <li>• Histórico familiar relevante</li>
                      <li>• Medicações atuais</li>
                      <li>• Alergias conhecidas</li>
                      <li>• Cirurgias anteriores</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded">
                    <h6 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Red Flags</h6>
                    <ul className="text-yellow-800 dark:text-yellow-200 space-y-1 text-xs">
                      <li>• Trauma recente</li>
                      <li>• Perda de peso inexplicada</li>
                      <li>• Febre persistente</li>
                      <li>• Déficits neurológicos</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded">
                    <h6 className="font-medium text-green-900 dark:text-green-100 mb-2">📋 Sistemas</h6>
                    <ul className="text-green-800 dark:text-green-200 space-y-1 text-xs">
                      <li>• Sistema cardiovascular</li>
                      <li>• Sistema respiratório</li>
                      <li>• Sistema gastrointestinal</li>
                      <li>• Sistema genitourinário</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Achados do Exame Físico
                  </label>
                  <Textarea
                    value={physicalExam}
                    onChange={(e) => setPhysicalExam(e.target.value)}
                    placeholder="Inspeção, palpação, testes especiais, amplitude de movimento..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                    <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">🔍 Testes Especiais Sugeridos</h6>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                      <li>• Teste de Lasègue</li>
                      <li>• Teste de Thomas</li>
                      <li>• Teste de Kemp</li>
                      <li>• Avaliação neurológica</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded">
                    <h6 className="font-medium text-purple-900 dark:text-purple-100 mb-2">📏 Medidas Objetivas</h6>
                    <ul className="text-purple-800 dark:text-purple-200 space-y-1 text-sm">
                      <li>• Amplitude de movimento</li>
                      <li>• Força muscular (0-5)</li>
                      <li>• Reflexos tendinosos</li>
                      <li>• Sensibilidade</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
              >
                Anterior
              </Button>
              
              <Button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 0 && !chiefComplaint) ||
                  (currentStep === 1 && symptoms.length === 0) ||
                  (currentStep === 2 && !patientHistory) ||
                  (currentStep === 3 && !physicalExam)
                }
              >
                {currentStep === steps.length - 1 ? 'Analisar com IA' : 'Próximo'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <Card className="p-1">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {[
                { key: 'differential', label: 'Diagnóstico Diferencial', icon: Stethoscope },
                { key: 'tests', label: 'Exames Sugeridos', icon: FileText },
                { key: 'decision', label: 'Suporte à Decisão', icon: Lightbulb }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {activeTab === 'differential' && (
            <div className="space-y-4">
              {hypotheses.map((hypothesis, index) => (
                <AnimatedContainer key={index} animation="slide-up" delay={index * 100}>
                  <Card variant="elevated" hover className="border-l-4 border-green-400">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {hypothesis.condition}
                            </h4>
                            <Badge className={getProbabilityColor(hypothesis.probability)}>
                              {hypothesis.probability}% probabilidade
                            </Badge>
                            <Badge variant="outline">
                              {hypothesis.confidence}% confiança
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {hypothesis.treatmentApproach}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            Evidências Favoráveis
                          </h5>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {hypothesis.evidence.map((evidence, idx) => (
                              <li key={idx} className="flex items-start space-x-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{evidence}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                            Contra-evidências
                          </h5>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {hypothesis.contraEvidence.map((contra, idx) => (
                              <li key={idx} className="flex items-start space-x-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{contra}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {hypothesis.redFlags.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                            <div>
                              <h6 className="font-medium text-red-900 dark:text-red-100 mb-1">
                                Red Flags Identificados
                              </h6>
                              <ul className="text-sm text-red-800 dark:text-red-200">
                                {hypothesis.redFlags.map((flag, idx) => (
                                  <li key={idx}>• {flag}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                        <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Prognóstico: {hypothesis.prognosis.timeframe}
                        </h6>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={
                            hypothesis.prognosis.outlook === 'excellent' ? 'bg-green-100 text-green-800' :
                            hypothesis.prognosis.outlook === 'good' ? 'bg-blue-100 text-blue-800' :
                            hypothesis.prognosis.outlook === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {hypothesis.prognosis.outlook === 'excellent' ? 'Excelente' :
                             hypothesis.prognosis.outlook === 'good' ? 'Bom' :
                             hypothesis.prognosis.outlook === 'fair' ? 'Regular' : 'Reservado'}
                          </Badge>
                        </div>
                        <ul className="text-sm text-blue-800 dark:text-blue-200">
                          {hypothesis.prognosis.factors.map((factor, idx) => (
                            <li key={idx}>• {factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                </AnimatedContainer>
              ))}
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              {hypotheses.map((hypothesis, index) => (
                <Card key={index}>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Exames para {hypothesis.condition}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {hypothesis.suggestedTests.map((test, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {test}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Para confirmação diagnóstica
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'decision' && clinicalSupport && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Lightbulb className="h-6 w-6 text-yellow-500" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Suporte à Decisão Clínica
                  </h4>
                  <Badge className={getUrgencyColor(clinicalSupport.urgencyLevel)}>
                    {clinicalSupport.urgencyLevel === 'urgent' ? 'Urgente' :
                     clinicalSupport.urgencyLevel === 'high' ? 'Alta' :
                     clinicalSupport.urgencyLevel === 'medium' ? 'Média' : 'Baixa'} Prioridade
                  </Badge>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
                  <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Recomendação Principal
                  </h5>
                  <p className="text-blue-800 dark:text-blue-200">
                    {clinicalSupport.reasoning}
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                    Próximos Passos Recomendados
                  </h5>
                  <div className="space-y-2">
                    {clinicalSupport.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar Relatório
                  </Button>
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aceitar Recomendações
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}