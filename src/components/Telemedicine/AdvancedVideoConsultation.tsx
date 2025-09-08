import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, Phone, PhoneOff, Monitor, Camera, Settings, Users, MessageSquare, FileText, Stethoscope, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface VideoConsultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scheduledTime: Date;
  duration: number;
  status: 'scheduled' | 'starting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  consultationType: 'routine' | 'follow_up' | 'urgent' | 'second_opinion' | 'group';
  speciality: string;
  roomId: string;
  participants: Participant[];
  recordings: Recording[];
  vitalsSharing: boolean;
  screenSharing: boolean;
  aiAssistance: boolean;
  translation: TranslationSettings;
  quality: VideoQuality;
  features: ConsultationFeatures;
}

interface Participant {
  id: string;
  name: string;
  role: 'patient' | 'doctor' | 'specialist' | 'observer' | 'translator' | 'caregiver';
  avatar: string;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'poor_connection';
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  joinedAt?: Date;
  location: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

interface Recording {
  id: string;
  filename: string;
  duration: number;
  size: number;
  quality: 'hd' | 'sd' | 'audio_only';
  encrypted: boolean;
  transcription?: string;
  aiAnalysis?: string;
  createdAt: Date;
  retentionPeriod: number;
}

interface TranslationSettings {
  enabled: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  realTimeSubtitles: boolean;
  voiceTranslation: boolean;
  medicalTerminology: boolean;
}

interface VideoQuality {
  resolution: '4k' | '1080p' | '720p' | '480p' | 'auto';
  fps: number;
  bandwidth: number;
  latency: number;
  packetLoss: number;
  jitter: number;
}

interface ConsultationFeatures {
  whiteboardEnabled: boolean;
  documentSharing: boolean;
  prescriptionPad: boolean;
  vitalsSynchronization: boolean;
  aiDiagnosis: boolean;
  recordingConsent: boolean;
  waitingRoom: boolean;
  backgroundBlur: boolean;
  noiseReduction: boolean;
}

interface VitalSign {
  type: 'heart_rate' | 'blood_pressure' | 'temperature' | 'oxygen_saturation' | 'respiratory_rate' | 'glucose';
  value: number;
  unit: string;
  timestamp: Date;
  source: 'manual' | 'device' | 'wearable';
  normal: boolean;
}

interface DiagnosticTool {
  id: string;
  name: string;
  type: 'stethoscope' | 'otoscope' | 'ophthalmoscope' | 'dermatoscope' | 'ultrasound' | 'ecg';
  connected: boolean;
  batteryLevel: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  aiEnhancement: boolean;
}

const mockConsultation: VideoConsultation = {
  id: 'vc_001',
  patientId: 'p123',
  patientName: 'João Silva Santos',
  doctorId: 'd456',
  doctorName: 'Dr. Maria Rodriguez',
  scheduledTime: new Date(),
  duration: 30,
  status: 'in_progress',
  consultationType: 'routine',
  speciality: 'Cardiologia',
  roomId: 'room_abc123',
  participants: [
    {
      id: 'p123',
      name: 'João Silva Santos',
      role: 'patient',
      avatar: '👨‍💼',
      connectionStatus: 'connected',
      audioEnabled: true,
      videoEnabled: true,
      screenSharing: false,
      joinedAt: new Date(Date.now() - 5 * 60 * 1000),
      location: 'São Paulo, Brazil',
      deviceType: 'desktop'
    },
    {
      id: 'd456',
      name: 'Dr. Maria Rodriguez',
      role: 'doctor',
      avatar: '👩‍⚕️',
      connectionStatus: 'connected',
      audioEnabled: true,
      videoEnabled: true,
      screenSharing: false,
      joinedAt: new Date(Date.now() - 6 * 60 * 1000),
      location: 'Madrid, Spain',
      deviceType: 'desktop'
    },
    {
      id: 's789',
      name: 'Dr. James Wilson',
      role: 'specialist',
      avatar: '👨‍⚕️',
      connectionStatus: 'connecting',
      audioEnabled: false,
      videoEnabled: false,
      screenSharing: false,
      location: 'London, UK',
      deviceType: 'mobile'
    }
  ],
  recordings: [],
  vitalsSharing: true,
  screenSharing: false,
  aiAssistance: true,
  translation: {
    enabled: true,
    sourceLanguage: 'pt-BR',
    targetLanguage: 'es-ES',
    realTimeSubtitles: true,
    voiceTranslation: false,
    medicalTerminology: true
  },
  quality: {
    resolution: '1080p',
    fps: 30,
    bandwidth: 2.5,
    latency: 45,
    packetLoss: 0.1,
    jitter: 2
  },
  features: {
    whiteboardEnabled: true,
    documentSharing: true,
    prescriptionPad: true,
    vitalsSynchronization: true,
    aiDiagnosis: true,
    recordingConsent: true,
    waitingRoom: true,
    backgroundBlur: true,
    noiseReduction: true
  }
};

const mockVitals: VitalSign[] = [
  {
    type: 'heart_rate',
    value: 78,
    unit: 'bpm',
    timestamp: new Date(),
    source: 'wearable',
    normal: true
  },
  {
    type: 'blood_pressure',
    value: 125,
    unit: 'mmHg',
    timestamp: new Date(),
    source: 'device',
    normal: true
  },
  {
    type: 'oxygen_saturation',
    value: 98,
    unit: '%',
    timestamp: new Date(),
    source: 'device',
    normal: true
  }
];

const mockDiagnosticTools: DiagnosticTool[] = [
  {
    id: 'dt1',
    name: 'Digital Stethoscope Pro',
    type: 'stethoscope',
    connected: true,
    batteryLevel: 85,
    quality: 'excellent',
    aiEnhancement: true
  },
  {
    id: 'dt2',
    name: 'Wireless Otoscope',
    type: 'otoscope',
    connected: false,
    batteryLevel: 0,
    quality: 'poor',
    aiEnhancement: false
  },
  {
    id: 'dt3',
    name: 'Portable ECG Monitor',
    type: 'ecg',
    connected: true,
    batteryLevel: 67,
    quality: 'good',
    aiEnhancement: true
  }
];

export default function AdvancedVideoConsultation() {
  const [consultation] = useState<VideoConsultation>(mockConsultation);
  const [activeTab, setActiveTab] = useState<'video' | 'vitals' | 'tools' | 'chat' | 'notes'>('video');
  const [localAudio, setLocalAudio] = useState(true);
  const [localVideo, setLocalVideo] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getConnectionColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'disconnected':
      case 'poor_connection':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'fair':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const VideoInterface = () => (
    <div className="space-y-6">
      {/* Main Video Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {consultation.participants.map(participant => (
          <Card key={participant.id} className={`relative border-2 ${
            participant.role === 'doctor' ? 'border-blue-500' : 'border-gray-200 dark:border-dark-600'
          }`}>
            <div className="aspect-video bg-gray-100 dark:bg-dark-700 rounded-lg flex items-center justify-center relative">
              {participant.videoEnabled ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-6xl">{participant.avatar}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <VideoOff className="w-12 h-12 text-gray-400" />
                  <span className="text-sm text-gray-500">Vídeo desligado</span>
                </div>
              )}
              
              {/* Participant Info Overlay */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black bg-opacity-70 rounded px-2 py-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">
                      {participant.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {participant.audioEnabled ? (
                        <Mic className="w-3 h-3 text-green-400" />
                      ) : (
                        <MicOff className="w-3 h-3 text-red-400" />
                      )}
                      <div className={`w-2 h-2 rounded-full ${getConnectionColor(participant.connectionStatus)}`} />
                    </div>
                  </div>
                  <div className="text-xs text-gray-300">
                    {participant.role} • {participant.location}
                  </div>
                </div>
              </div>

              {/* Screen Sharing Indicator */}
              {participant.screenSharing && (
                <div className="absolute top-2 right-2">
                  <Monitor className="w-5 h-5 text-blue-400" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* AI Translation Banner */}
      {consultation.translation.enabled && (
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-800 dark:text-purple-300">
                  Tradução Automática Ativa
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  {consultation.translation.sourceLanguage} → {consultation.translation.targetLanguage}
                  {consultation.translation.realTimeSubtitles && ' • Legendas em tempo real'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Controls */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={localAudio ? "default" : "destructive"}
                size="sm"
                onClick={() => setLocalAudio(!localAudio)}
              >
                {localAudio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              
              <Button
                variant={localVideo ? "default" : "destructive"}
                size="sm"
                onClick={() => setLocalVideo(!localVideo)}
              >
                {localVideo ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              
              <Button variant="outline" size="sm">
                <Monitor className="w-4 h-4 mr-1" />
                Compartilhar Tela
              </Button>
              
              <Button 
                variant={isRecording ? "destructive" : "outline"} 
                size="sm"
                onClick={() => setIsRecording(!isRecording)}
              >
                <div className={`w-3 h-3 rounded-full mr-1 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                {isRecording ? 'Parar' : 'Gravar'}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-dark-400">
                Qualidade: {consultation.quality.resolution} • {consultation.quality.latency}ms
              </span>
              
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button variant="destructive" size="sm">
                <PhoneOff className="w-4 h-4 mr-1" />
                Encerrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const VitalsPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sinais Vitais em Tempo Real
        </h3>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          Sincronizar Dispositivos
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {mockVitals.map(vital => (
          <Card key={vital.type} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                  {vital.type.replace('_', ' ')}
                </h4>
                <div className={`w-3 h-3 rounded-full ${vital.normal ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {vital.value} <span className="text-lg text-gray-500">{vital.unit}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-dark-400">
                {vital.source} • {vital.timestamp.toLocaleTimeString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Histórico de Sinais Vitais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 dark:bg-dark-700 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-dark-400">
              <div className="w-16 h-16 bg-gray-200 dark:bg-dark-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                📊
              </div>
              <p>Gráfico de tendências de sinais vitais</p>
              <p className="text-sm">Dados coletados em tempo real</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DiagnosticTools = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ferramentas Diagnósticas
        </h3>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white">
          <Stethoscope className="w-4 h-4 mr-2" />
          Conectar Dispositivo
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {mockDiagnosticTools.map(tool => (
          <Card key={tool.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {tool.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-dark-400 capitalize">
                      {tool.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${tool.connected ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Bateria</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${tool.batteryLevel}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{tool.batteryLevel}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Qualidade</p>
                  <p className={`font-medium capitalize ${getQualityColor(tool.quality)}`}>
                    {tool.quality}
                  </p>
                </div>
              </div>

              {tool.aiEnhancement && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                      IA Enhancement Ativo
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!tool.connected}>
                  Iniciar Exame
                </Button>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ChatPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Chat da Consulta
        </h3>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-1" />
          Transcrição
        </Button>
      </div>

      <Card className="border border-gray-200 dark:border-dark-600">
        <CardContent className="p-4">
          <div className="h-96 bg-gray-50 dark:bg-dark-700 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center text-gray-500 dark:text-dark-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4" />
              <p>Mensagens da consulta aparecerão aqui</p>
              <p className="text-sm">Chat em tempo real com tradução automática</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
            <Button>Enviar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Teleconsulta Avançada
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              {consultation.consultationType} • {consultation.speciality}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-dark-400">
            Duração: 15:32
          </span>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-600">AO VIVO</span>
        </div>
      </div>

      {/* Consultation Info */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-400">Paciente</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {consultation.patientName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-400">Médico</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {consultation.doctorName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-400">Participantes</p>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{consultation.participants.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'video', label: 'Vídeo', icon: Video },
          { id: 'vitals', label: 'Sinais Vitais', icon: Activity },
          { id: 'tools', label: 'Ferramentas', icon: Stethoscope },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'notes', label: 'Anotações', icon: FileText }
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
      {activeTab === 'video' && <VideoInterface />}
      {activeTab === 'vitals' && <VitalsPanel />}
      {activeTab === 'tools' && <DiagnosticTools />}
      {activeTab === 'chat' && <ChatPanel />}
      {activeTab === 'notes' && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Anotações da Consulta
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Sistema de anotações colaborativas em desenvolvimento...
          </p>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configurações da Consulta
              </h3>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                ×
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Qualidade de Vídeo
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                      Resolução
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white">
                      <option value="auto">Automática</option>
                      <option value="1080p">1080p</option>
                      <option value="720p">720p</option>
                      <option value="480p">480p</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                      FPS
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white">
                      <option value="30">30 FPS</option>
                      <option value="24">24 FPS</option>
                      <option value="15">15 FPS</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Recursos
                </h4>
                <div className="space-y-3">
                  {[
                    { key: 'backgroundBlur', label: 'Desfoque de Fundo' },
                    { key: 'noiseReduction', label: 'Redução de Ruído' },
                    { key: 'recordingConsent', label: 'Gravação da Sessão' },
                    { key: 'aiDiagnosis', label: 'Assistência de IA' }
                  ].map(feature => (
                    <div key={feature.key} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                        {feature.label}
                      </label>
                      <input
                        type="checkbox"
                        defaultChecked={consultation.features[feature.key as keyof ConsultationFeatures]}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedContainer>
  );
}