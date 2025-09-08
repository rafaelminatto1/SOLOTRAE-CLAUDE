import React, { useState } from 'react';
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, Eye, Lock, Settings, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  type: 'regulatory' | 'certification' | 'standard' | 'internal';
  region: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'in_progress';
  score: number;
  lastAudit: Date;
  nextAudit: Date;
  requirements: ComplianceRequirement[];
  violations: Violation[];
  certificationExpiry?: Date;
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: 'data_privacy' | 'security' | 'documentation' | 'training' | 'technical' | 'operational';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  evidence: Evidence[];
  responsibleParty: string;
  dueDate?: Date;
  lastReview: Date;
}

interface Evidence {
  id: string;
  type: 'document' | 'screenshot' | 'log' | 'certificate' | 'testimony';
  title: string;
  description: string;
  uploadDate: Date;
  verifiedBy?: string;
  verificationDate?: Date;
}

interface Violation {
  id: string;
  requirementId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  discoveredDate: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  dueDate: Date;
  assignedTo: string;
  remediationPlan?: string;
  cost?: number;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure' | 'warning';
  details: Record<string, any>;
  sensitiveData: boolean;
  retentionPeriod: number;
}

const mockFrameworks: ComplianceFramework[] = [
  {
    id: 'hipaa',
    name: 'HIPAA (Health Insurance Portability and Accountability Act)',
    description: 'Regulamentação americana para proteção de informações de saúde',
    type: 'regulatory',
    region: 'United States',
    status: 'compliant',
    score: 92,
    lastAudit: new Date('2024-01-15'),
    nextAudit: new Date('2024-07-15'),
    requirements: [],
    violations: [],
    certificationExpiry: new Date('2025-01-15')
  },
  {
    id: 'gdpr',
    name: 'GDPR (General Data Protection Regulation)',
    description: 'Regulamentação europeia de proteção de dados pessoais',
    type: 'regulatory',
    region: 'European Union',
    status: 'partial',
    score: 78,
    lastAudit: new Date('2024-01-10'),
    nextAudit: new Date('2024-04-10'),
    requirements: [],
    violations: [
      {
        id: 'v1',
        requirementId: 'gdpr_art25',
        severity: 'medium',
        description: 'Privacy by Design não implementado em todos os sistemas',
        discoveredDate: new Date('2024-01-05'),
        status: 'in_progress',
        dueDate: new Date('2024-03-01'),
        assignedTo: 'privacy-team@company.com'
      }
    ]
  },
  {
    id: 'lgpd',
    name: 'LGPD (Lei Geral de Proteção de Dados)',
    description: 'Lei brasileira de proteção de dados pessoais',
    type: 'regulatory',
    region: 'Brazil',
    status: 'compliant',
    score: 88,
    lastAudit: new Date('2024-01-20'),
    nextAudit: new Date('2024-10-20'),
    requirements: [],
    violations: []
  },
  {
    id: 'iso27001',
    name: 'ISO 27001 - Information Security Management',
    description: 'Padrão internacional para gestão de segurança da informação',
    type: 'certification',
    region: 'Global',
    status: 'in_progress',
    score: 65,
    lastAudit: new Date('2024-01-01'),
    nextAudit: new Date('2024-06-01'),
    requirements: [],
    violations: []
  }
];

const mockAuditLogs: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    userId: 'user_123',
    userEmail: 'doctor@hospital.com',
    action: 'VIEW_PATIENT_RECORD',
    resource: 'patient_record',
    resourceId: 'patient_456',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    outcome: 'success',
    details: { recordType: 'medical_history', department: 'cardiology' },
    sensitiveData: true,
    retentionPeriod: 2555 // days
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    userId: 'user_789',
    userEmail: 'admin@hospital.com',
    action: 'EXPORT_DATA',
    resource: 'patient_data',
    resourceId: 'bulk_export_001',
    ipAddress: '192.168.1.105',
    userAgent: 'DataExportTool/1.0',
    outcome: 'warning',
    details: { recordCount: 1000, format: 'CSV', reason: 'research_study' },
    sensitiveData: true,
    retentionPeriod: 2555
  },
  {
    id: 'log_3',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    userId: 'user_321',
    userEmail: 'nurse@hospital.com',
    action: 'FAILED_LOGIN',
    resource: 'authentication',
    resourceId: 'login_attempt_999',
    ipAddress: '192.168.1.200',
    userAgent: 'Mobile App v2.1',
    outcome: 'failure',
    details: { reason: 'invalid_password', attempts: 3 },
    sensitiveData: false,
    retentionPeriod: 365
  }
];

export default function ComplianceAuditSystem() {
  const [activeTab, setActiveTab] = useState<'frameworks' | 'violations' | 'audit_logs' | 'reports'>('frameworks');
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'failure' | 'warning'>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'non_compliant':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return 'text-green-600';
      case 'failure':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const FrameworksTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Frameworks de Compliance
        </h2>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Shield className="w-4 h-4 mr-2" />
          Adicionar Framework
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {mockFrameworks.map(framework => (
          <Card key={framework.id} className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {framework.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                    {framework.region} • {framework.type}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(framework.status)}`}>
                  {framework.status}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-dark-400">
                {framework.description}
              </p>
              
              {/* Compliance Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-dark-400">Score de Compliance</span>
                  <span className="font-bold text-gray-900 dark:text-white">{framework.score}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      framework.score >= 90 ? 'bg-green-500' :
                      framework.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${framework.score}%` }}
                  />
                </div>
              </div>

              {/* Audit Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-dark-400">Última Auditoria:</span>
                  <p className="font-medium">{framework.lastAudit.toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-dark-400">Próxima Auditoria:</span>
                  <p className="font-medium">{framework.nextAudit.toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Violations Summary */}
              {framework.violations.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-800 dark:text-red-300">
                      {framework.violations.length} Violação(ões) Ativa(s)
                    </span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {framework.violations.filter(v => v.status === 'open').length} em aberto, 
                    {framework.violations.filter(v => v.status === 'in_progress').length} em progresso
                  </p>
                </div>
              )}

              {/* Certification Expiry */}
              {framework.certificationExpiry && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-dark-400">Certificação expira em:</span>
                  <span className="font-medium">
                    {framework.certificationExpiry.toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedFramework(framework)}>
                  Ver Detalhes
                </Button>
                <Button variant="outline" size="sm">
                  Nova Auditoria
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ViolationsTab = () => {
    const allViolations = mockFrameworks.flatMap(f => 
      f.violations.map(v => ({ ...v, framework: f.name }))
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Violações de Compliance
          </h2>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reportar Violação
          </Button>
        </div>

        <div className="space-y-4">
          {allViolations.map(violation => (
            <Card key={violation.id} className="border border-gray-200 dark:border-dark-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                        {violation.severity}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-dark-400">
                        {violation.framework}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {violation.description}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(violation.status)}`}>
                    {violation.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-dark-400">Descoberto em:</span>
                    <p className="font-medium">{violation.discoveredDate.toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-dark-400">Prazo:</span>
                    <p className="font-medium">{violation.dueDate.toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-dark-400">Responsável:</span>
                    <p className="font-medium">{violation.assignedTo}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm">
                    Plano de Ação
                  </Button>
                  <Button variant="outline" size="sm">
                    Marcar como Resolvida
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const AuditLogsTab = () => {
    const filteredLogs = mockAuditLogs.filter(log => 
      logFilter === 'all' || log.outcome === logFilter
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Logs de Auditoria
          </h2>
          <div className="flex gap-2">
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos</option>
              <option value="success">Sucesso</option>
              <option value="failure">Falha</option>
              <option value="warning">Aviso</option>
            </select>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Exportar Logs
            </Button>
          </div>
        </div>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      Recurso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      Resultado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {log.timestamp.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{log.userEmail}</div>
                        <div className="text-xs text-gray-500 dark:text-dark-400">{log.userId}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {log.action}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{log.resource}</div>
                        <div className="text-xs text-gray-500 dark:text-dark-400">{log.resourceId}</div>
                        {log.sensitiveData && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Lock className="w-3 h-3 mr-1" />
                            Sensível
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getOutcomeColor(log.outcome)}`}>
                          {log.outcome}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-400">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sistema de Compliance e Auditoria
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Gestão de conformidade regulatória e auditoria de sistemas
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Frameworks Ativos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockFrameworks.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Violações Abertas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockFrameworks.flatMap(f => f.violations).filter(v => v.status === 'open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Eventos Auditados (24h)</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockAuditLogs.length * 100}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Score Médio</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.round(mockFrameworks.reduce((acc, f) => acc + f.score, 0) / mockFrameworks.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'frameworks', label: 'Frameworks', icon: Shield },
          { id: 'violations', label: 'Violações', icon: AlertTriangle },
          { id: 'audit_logs', label: 'Logs Auditoria', icon: Eye },
          { id: 'reports', label: 'Relatórios', icon: FileText }
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
      {activeTab === 'frameworks' && <FrameworksTab />}
      {activeTab === 'violations' && <ViolationsTab />}
      {activeTab === 'audit_logs' && <AuditLogsTab />}
      {activeTab === 'reports' && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Relatórios de Compliance
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Geração automatizada de relatórios em desenvolvimento...
          </p>
        </div>
      )}
    </AnimatedContainer>
  );
}