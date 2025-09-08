import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Save, X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useSOAPRecords } from '@/hooks/useSOAPRecords';
import { formatDate } from '@/lib/utils';

interface SOAPRecord {
  id?: string;
  patient_id: string;
  therapist_id: string;
  date: string;
  subjective: string;
  objective: {
    observations: string;
    measurements: Record<string, any>;
    tests: string[];
  };
  assessment: {
    diagnosis: string;
    progress: string;
    concerns: string[];
  };
  plan: {
    treatment: string;
    exercises: string[];
    goals: string[];
    next_session: string;
  };
  pain_level: number;
  session_duration: number;
  notes: string;
  status: 'draft' | 'completed' | 'reviewed';
}

interface SOAPRecordEditorProps {
  record?: SOAPRecord;
  patientId: string;
  onSave: (record: SOAPRecord) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const SOAPRecordEditor: React.FC<SOAPRecordEditorProps> = ({
  record,
  patientId,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const { createRecord, updateRecord, isLoading } = useSOAPRecords();
  const [formData, setFormData] = useState<SOAPRecord>({
    patient_id: patientId,
    therapist_id: '',
    date: new Date().toISOString().split('T')[0],
    subjective: '',
    objective: {
      observations: '',
      measurements: {},
      tests: []
    },
    assessment: {
      diagnosis: '',
      progress: '',
      concerns: []
    },
    plan: {
      treatment: '',
      exercises: [],
      goals: [],
      next_session: ''
    },
    pain_level: 0,
    session_duration: 60,
    notes: '',
    status: 'draft'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTest, setNewTest] = useState('');
  const [newConcern, setNewConcern] = useState('');
  const [newExercise, setNewExercise] = useState('');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    if (record) {
      setFormData(record);
    }
  }, [record]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subjective.trim()) {
      newErrors.subjective = 'Campo subjetivo é obrigatório';
    }
    if (!formData.objective.observations.trim()) {
      newErrors.objective = 'Observações objetivas são obrigatórias';
    }
    if (!formData.assessment.diagnosis.trim()) {
      newErrors.assessment = 'Diagnóstico é obrigatório';
    }
    if (!formData.plan.treatment.trim()) {
      newErrors.plan = 'Plano de tratamento é obrigatório';
    }
    if (formData.pain_level < 0 || formData.pain_level > 10) {
      newErrors.pain_level = 'Nível de dor deve estar entre 0 e 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let savedRecord: SOAPRecord;
      if (isEditing && record?.id) {
        savedRecord = await updateRecord(record.id, formData);
      } else {
        savedRecord = await createRecord(formData);
      }
      onSave(savedRecord);
    } catch (error) {
      console.error('Erro ao salvar registro SOAP:', error);
    }
  };

  const addItem = (field: 'tests' | 'concerns' | 'exercises' | 'goals', value: string) => {
    if (!value.trim()) return;

    setFormData(prev => {
      const updated = { ...prev };
      if (field === 'tests') {
        updated.objective.tests = [...updated.objective.tests, value];
      } else if (field === 'concerns') {
        updated.assessment.concerns = [...updated.assessment.concerns, value];
      } else if (field === 'exercises') {
        updated.plan.exercises = [...updated.plan.exercises, value];
      } else if (field === 'goals') {
        updated.plan.goals = [...updated.plan.goals, value];
      }
      return updated;
    });

    // Clear input
    if (field === 'tests') setNewTest('');
    else if (field === 'concerns') setNewConcern('');
    else if (field === 'exercises') setNewExercise('');
    else if (field === 'goals') setNewGoal('');
  };

  const removeItem = (field: 'tests' | 'concerns' | 'exercises' | 'goals', index: number) => {
    setFormData(prev => {
      const updated = { ...prev };
      if (field === 'tests') {
        updated.objective.tests = updated.objective.tests.filter((_, i) => i !== index);
      } else if (field === 'concerns') {
        updated.assessment.concerns = updated.assessment.concerns.filter((_, i) => i !== index);
      } else if (field === 'exercises') {
        updated.plan.exercises = updated.plan.exercises.filter((_, i) => i !== index);
      } else if (field === 'goals') {
        updated.plan.goals = updated.plan.goals.filter((_, i) => i !== index);
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Editar Registro SOAP' : 'Novo Registro SOAP'}
          </h2>
          <p className="text-muted-foreground">
            {formatDate(formData.date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={formData.status === 'completed' ? 'default' : 'secondary'}>
            {formData.status === 'draft' && 'Rascunho'}
            {formData.status === 'completed' && 'Concluído'}
            {formData.status === 'reviewed' && 'Revisado'}
          </Badge>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Data da Sessão</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="180"
                value={formData.session_duration}
                onChange={(e) => setFormData(prev => ({ ...prev, session_duration: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="pain">Nível de Dor (0-10)</Label>
              <Input
                id="pain"
                type="number"
                min="0"
                max="10"
                value={formData.pain_level}
                onChange={(e) => setFormData(prev => ({ ...prev, pain_level: parseInt(e.target.value) }))}
              />
              {errors.pain_level && (
                <p className="text-sm text-red-500 mt-1">{errors.pain_level}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'draft' | 'completed' | 'reviewed') => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="reviewed">Revisado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subjective */}
      <Card>
        <CardHeader>
          <CardTitle>S - Subjetivo</CardTitle>
          <p className="text-sm text-muted-foreground">
            O que o paciente relata sobre seus sintomas, dor e progresso
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva os relatos do paciente..."
            value={formData.subjective}
            onChange={(e) => setFormData(prev => ({ ...prev, subjective: e.target.value }))}
            rows={4}
          />
          {errors.subjective && (
            <p className="text-sm text-red-500 mt-1">{errors.subjective}</p>
          )}
        </CardContent>
      </Card>

      {/* Objective */}
      <Card>
        <CardHeader>
          <CardTitle>O - Objetivo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Observações mensuráveis, testes e avaliações realizadas
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Observações objetivas durante a sessão..."
              value={formData.objective.observations}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                objective: { ...prev.objective, observations: e.target.value }
              }))}
              rows={3}
            />
            {errors.objective && (
              <p className="text-sm text-red-500 mt-1">{errors.objective}</p>
            )}
          </div>

          <div>
            <Label>Testes Realizados</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Adicionar teste..."
                value={newTest}
                onChange={(e) => setNewTest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('tests', newTest)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addItem('tests', newTest)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.objective.tests.map((test, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {test}
                  <button
                    onClick={() => removeItem('tests', index)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>A - Avaliação</CardTitle>
          <p className="text-sm text-muted-foreground">
            Análise profissional, diagnóstico e progresso do paciente
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="diagnosis">Diagnóstico/Impressão Clínica</Label>
            <Textarea
              id="diagnosis"
              placeholder="Diagnóstico e impressão clínica..."
              value={formData.assessment.diagnosis}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                assessment: { ...prev.assessment, diagnosis: e.target.value }
              }))}
              rows={2}
            />
            {errors.assessment && (
              <p className="text-sm text-red-500 mt-1">{errors.assessment}</p>
            )}
          </div>

          <div>
            <Label htmlFor="progress">Progresso</Label>
            <Textarea
              id="progress"
              placeholder="Avaliação do progresso do paciente..."
              value={formData.assessment.progress}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                assessment: { ...prev.assessment, progress: e.target.value }
              }))}
              rows={2}
            />
          </div>

          <div>
            <Label>Preocupações/Alertas</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Adicionar